import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class LiveClassesService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-LIVE-001: Schedule Live Class
  async scheduleClass(requesterId: string, dto: {
    title: string; description?: string; classMode: string;
    classId?: string; subjectId?: string; topicId?: string;
    scheduledStart: string; scheduledEnd: string; maxParticipants?: number;
    enableChat?: boolean; enableScreenShare?: boolean; enableWhiteboard?: boolean;
  }) {
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    if (end <= start) throw new BadRequestException('End time must be after start time');

    // Resolve teacher profile — support userId or teacherProfile.id
    let teacherId = requesterId;
    const profileById = await this.prisma.teacherProfile.findUnique({ where: { id: requesterId } });
    if (!profileById) {
      const profileByUser = await this.prisma.teacherProfile.findUnique({ where: { userId: requesterId } });
      if (!profileByUser) {
        const user = await this.prisma.user.findUnique({ where: { id: requesterId } });
        if (!user) throw new NotFoundException('Teacher not found');
        const created = await this.prisma.teacherProfile.upsert({
          where: { userId: requesterId },
          create: { userId: requesterId },
          update: {},
        });
        teacherId = created.id;
      } else {
        teacherId = profileByUser.id;
      }
    }

    const liveClass = await this.prisma.liveClass.create({
      data: {
        teacherId,
        title: dto.title,
        description: dto.description,
        classMode: dto.classMode as any,
        classId: dto.classId,
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        scheduledStart: start,
        scheduledEnd: end,
        maxParticipants: dto.maxParticipants || 200,
        enableChat: dto.enableChat ?? true,
        enableScreenShare: dto.enableScreenShare ?? true,
        enableWhiteboard: dto.enableWhiteboard ?? true,
        status: 'SCHEDULED',
      },
    });

    this.eventBus.publish('live_class.scheduled', {
      classId: liveClass.id, teacherId, scheduledStart: dto.scheduledStart,
    });
    return liveClass;
  }

  // FR-LIVE-002: Start Live Class
  async startClass(teacherId: string, classId: string, dto: {
    meetingUrl?: string; meetingId?: string; meetingPassword?: string;
  }) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');
    if (liveClass.teacherId !== teacherId) throw new BadRequestException('Not your class');
    if (liveClass.status === 'LIVE') throw new ConflictException('Class already started');
    if (liveClass.status === 'COMPLETED') throw new BadRequestException('Class already completed');

    const updated = await this.prisma.liveClass.update({
      where: { id: classId },
      data: {
        status: 'LIVE',
        actualStart: new Date(),
        meetingUrl: dto.meetingUrl,
        meetingId: dto.meetingId,
        meetingPassword: dto.meetingPassword,
      },
    });

    this.eventBus.publish('live_class.started', { classId, teacherId });
    return updated;
  }

  // FR-LIVE-003: End Live Class
  async endClass(teacherId: string, classId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');
    if (liveClass.status !== 'LIVE') throw new BadRequestException('Class is not live');

    const updated = await this.prisma.liveClass.update({
      where: { id: classId },
      data: { status: 'COMPLETED', actualEnd: new Date() },
    });

    this.eventBus.publish('live_class.ended', { classId, teacherId });
    return updated;
  }

  // FR-LIVE-004: Cancel Live Class
  async cancelClass(teacherId: string, classId: string, reason?: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    const updated = await this.prisma.liveClass.update({
      where: { id: classId },
      data: { status: 'CANCELLED' },
    });

    this.eventBus.publish('live_class.cancelled', { classId, teacherId, reason });
    return updated;
  }

  // FR-LIVE-005: List Live Classes
  async listClasses(filters: {
    teacherId?: string; classId?: string; status?: string;
    startDate?: string; endDate?: string; classMode?: string;
  }) {
    return this.prisma.liveClass.findMany({
      where: {
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.classMode ? { classMode: filters.classMode as any } : {}),
        ...(filters.startDate || filters.endDate ? {
          scheduledStart: {
            ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
          },
        } : {}),
      },
      include: {
        _count: { select: { participants: true } },
      },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  // FR-VIDEO-001: Join Live Class
  async joinClass(userId: string, classId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');
    if (liveClass.status === 'CANCELLED') throw new BadRequestException('Class was cancelled');
    if (liveClass.status === 'COMPLETED') throw new BadRequestException('Class has ended');

    // Check participant limit
    const currentCount = await this.prisma.liveClassParticipant.count({
      where: { liveClassId: classId, leftAt: null },
    });
    if (currentCount >= liveClass.maxParticipants) {
      throw new BadRequestException('Class is at full capacity');
    }

    const existing = await this.prisma.liveClassParticipant.findUnique({
      where: { liveClassId_userId: { liveClassId: classId, userId } },
    });

    const participant = existing
      ? await this.prisma.liveClassParticipant.update({
          where: { id: existing.id },
          data: { joinedAt: new Date(), leftAt: null },
        })
      : await this.prisma.liveClassParticipant.create({
          data: { liveClassId: classId, userId, joinedAt: new Date() },
        });

    this.eventBus.publish('live_class.participant_joined', { classId, userId });
    return {
      participant,
      classDetails: {
        meetingUrl: liveClass.meetingUrl,
        meetingId: liveClass.meetingId,
        meetingPassword: liveClass.meetingPassword,
        enableChat: liveClass.enableChat,
        enableScreenShare: liveClass.enableScreenShare,
      },
    };
  }

  // FR-VIDEO-002: Leave Live Class
  async leaveClass(userId: string, classId: string) {
    const participant = await this.prisma.liveClassParticipant.findUnique({
      where: { liveClassId_userId: { liveClassId: classId, userId } },
    });
    if (!participant) throw new NotFoundException('Not in this class');

    const joinedAt = participant.joinedAt;
    const leftAt = new Date();
    const duration = Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000);

    const updated = await this.prisma.liveClassParticipant.update({
      where: { id: participant.id },
      data: { leftAt, duration: (participant.duration || 0) + duration },
    });

    this.eventBus.publish('live_class.participant_left', { classId, userId, duration });
    return updated;
  }

  // FR-META-001: Get Live Class Details
  async getClass(classId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: classId },
      include: {
        participants: {
          select: { userId: true, joinedAt: true, leftAt: true, duration: true },
        },
        recordings: { select: { id: true, recordingUrl: true, duration: true, createdAt: true } },
      },
    });
    if (!liveClass) throw new NotFoundException('Live class not found');
    return liveClass;
  }

  // FR-META-002: Remove Participant
  async removeParticipant(teacherId: string, classId: string, userId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass || liveClass.teacherId !== teacherId) throw new BadRequestException('Access denied');

    const participant = await this.prisma.liveClassParticipant.findUnique({
      where: { liveClassId_userId: { liveClassId: classId, userId } },
    });
    if (!participant) throw new NotFoundException('Participant not found');

    return this.prisma.liveClassParticipant.update({
      where: { id: participant.id },
      data: { isRemoved: true, leftAt: new Date() },
    });
  }

  // FR-POST-001: Upload Recording
  async addRecording(teacherId: string, classId: string, dto: {
    recordingUrl: string; duration?: number;
  }) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    // Update class with recording URL
    await this.prisma.liveClass.update({
      where: { id: classId },
      data: { recordingUrl: dto.recordingUrl },
    });

    // Add to recordings table
    const recording = await this.prisma.classRecording.create({
      data: {
        liveClassId: classId,
        recordingUrl: dto.recordingUrl,
        duration: dto.duration,
      },
    });

    this.eventBus.publish('live_class.recording_added', { classId, teacherId });
    return recording;
  }

  // FR-POST-002: Get Class Analytics
  async getClassAnalytics(classId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id: classId } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    const participants = await this.prisma.liveClassParticipant.findMany({
      where: { liveClassId: classId },
    });

    const joined = participants.length;
    const completed = participants.filter((p) => p.leftAt).length;
    const avgDuration = participants.reduce((s, p) => s + (p.duration || 0), 0) / (joined || 1);

    const scheduledDuration = liveClass.scheduledEnd
      ? Math.floor((liveClass.scheduledEnd.getTime() - liveClass.scheduledStart.getTime()) / 60000)
      : 0;

    return {
      classId,
      title: liveClass.title,
      status: liveClass.status,
      scheduledDuration,
      actualDuration: liveClass.actualStart && liveClass.actualEnd
        ? Math.floor((liveClass.actualEnd.getTime() - liveClass.actualStart.getTime()) / 60000)
        : null,
      totalParticipants: joined,
      completedParticipants: completed,
      averageAttendanceDuration: Math.floor(avgDuration / 60), // minutes
    };
  }

  // FR-ADMIN-001: Get Teacher's upcoming classes
  async getTeacherSchedule(teacherId: string) {
    return this.prisma.liveClass.findMany({
      where: {
        teacherId,
        status: 'SCHEDULED',
        scheduledStart: { gte: new Date() },
      },
      orderBy: { scheduledStart: 'asc' },
      take: 20,
    });
  }
}
