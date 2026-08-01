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

  // ─────────────────────────────────────────────────────────────────────────
  // FR-VIDEO-003–010: Live Interactivity & In-Class Features
  // ─────────────────────────────────────────────────────────────────────────

  // FR-VIDEO-003: Chat
  async sendChatMessage(classId: string, userId: string, message: string) {
    const chat = await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_CHAT',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { message, sentAt: new Date() },
      },
    });

    this.eventBus.publish('live_class.chat_sent', { classId, userId });
    return { id: chat.id, classId, userId, message, sentAt: chat.timestamp };
  }

  async getChatHistory(classId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { action: 'LIVE_CLASS_CHAT', recordId: classId },
      orderBy: { timestamp: 'asc' },
    });

    return logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      message: (l.changes as any)?.message,
      sentAt: l.timestamp,
    }));
  }

  // FR-VIDEO-004: Raise Hand
  async raiseHand(classId: string, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_RAISE_HAND',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { status: 'RAISED' },
      },
    });
    return { classId, userId, isHandRaised: true };
  }

  async lowerHand(classId: string, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_LOWER_HAND',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { status: 'LOWERED' },
      },
    });
    return { classId, userId, isHandRaised: false };
  }

  async getRaisedHands(classId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action: { in: ['LIVE_CLASS_RAISE_HAND', 'LIVE_CLASS_LOWER_HAND'] },
        recordId: classId,
      },
      orderBy: { timestamp: 'asc' },
    });

    const statusMap: Record<string, boolean> = {};
    logs.forEach((l) => {
      statusMap[l.userId!] = l.action === 'LIVE_CLASS_RAISE_HAND';
    });

    const raised = Object.entries(statusMap)
      .filter(([, isRaised]) => isRaised)
      .map(([uId]) => uId);

    return { classId, raisedHandUserIds: raised };
  }

  // FR-VIDEO-005: Screen Sharing
  async startScreenShare(classId: string, userId: string, streamId?: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_SCREEN_SHARE_START',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { streamId },
      },
    });
    return { classId, userId, isSharing: true, streamId };
  }

  async stopScreenShare(classId: string, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_SCREEN_SHARE_STOP',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
      },
    });
    return { classId, userId, isSharing: false };
  }

  // FR-VIDEO-006: Whiteboard
  async createWhiteboardSession(classId: string, userId: string) {
    const board = await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LIVE_CLASS_WHITEBOARD',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { canvasData: {}, elements: [] },
      },
    });
    return { whiteboardId: board.id, classId, canvasData: {}, elements: [] };
  }

  async getWhiteboardData(classId: string) {
    const board = await this.prisma.auditLog.findFirst({
      where: { action: 'LIVE_CLASS_WHITEBOARD', recordId: classId },
      orderBy: { timestamp: 'desc' },
    });
    return board ? board.changes : { canvasData: {}, elements: [] };
  }

  async updateWhiteboard(classId: string, elements: any[]) {
    const board = await this.prisma.auditLog.findFirst({
      where: { action: 'LIVE_CLASS_WHITEBOARD', recordId: classId },
    });

    if (board) {
      await this.prisma.auditLog.update({
        where: { id: board.id },
        data: { changes: { elements } },
      });
    }
    return { classId, elements };
  }

  // FR-VIDEO-007: Breakout Rooms
  async createBreakoutRoom(classId: string, name: string, participantUserIds: string[]) {
    const room = await this.prisma.auditLog.create({
      data: {
        action: 'LIVE_CLASS_BREAKOUT_ROOM',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { name, participantUserIds, status: 'ACTIVE' },
      },
    });
    return { roomId: room.id, name, participantUserIds, status: 'ACTIVE' };
  }

  async listBreakoutRooms(classId: string) {
    const rooms = await this.prisma.auditLog.findMany({
      where: { action: 'LIVE_CLASS_BREAKOUT_ROOM', recordId: classId },
    });
    return rooms.map((r) => ({ id: r.id, ...(r.changes as any) }));
  }

  // FR-VIDEO-008: Polls & Quizzes
  async createPoll(classId: string, teacherId: string, question: string, options: string[]) {
    const poll = await this.prisma.auditLog.create({
      data: {
        userId: teacherId,
        action: 'LIVE_CLASS_POLL',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { question, options, responses: {} },
      },
    });
    return { pollId: poll.id, question, options };
  }

  async submitPollResponse(pollId: string, userId: string, optionIndex: number) {
    const poll = await this.prisma.auditLog.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');

    const changes = poll.changes as any;
    const responses = changes.responses || {};
    responses[userId] = optionIndex;

    await this.prisma.auditLog.update({
      where: { id: pollId },
      data: { changes: { ...changes, responses } },
    });

    return { success: true, optionIndex };
  }

  async getPollResults(pollId: string) {
    const poll = await this.prisma.auditLog.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');

    const changes = poll.changes as any;
    const responses = changes.responses || {};
    const options: string[] = changes.options || [];

    const counts = options.map((opt, idx) => ({
      option: opt,
      count: Object.values(responses).filter((v) => v === idx).length,
    }));

    return {
      pollId,
      question: changes.question,
      totalVotes: Object.keys(responses).length,
      results: counts,
    };
  }

  // FR-VIDEO-009: Auto Attendance
  async getAutoAttendance(classId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: classId },
      include: {
        participants: true,
      },
    });
    if (!liveClass) throw new NotFoundException('Live class not found');

    const scheduledMins = liveClass.scheduledEnd
      ? Math.floor((liveClass.scheduledEnd.getTime() - liveClass.scheduledStart.getTime()) / 60000)
      : 60;

    return liveClass.participants.map((p) => {
      const minsAttended = Math.floor((p.duration || 0) / 60);
      const percentage = scheduledMins > 0 ? (minsAttended / scheduledMins) * 100 : 0;

      return {
        userId: p.userId,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        minutesAttended: minsAttended,
        attendancePercentage: percentage.toFixed(1),
        status: percentage >= 75 ? 'PRESENT' : percentage >= 25 ? 'PARTIAL' : 'ABSENT',
      };
    });
  }

  // FR-VIDEO-010: Class Resources
  async addClassResource(classId: string, teacherId: string, title: string, fileUrl: string) {
    const resource = await this.prisma.auditLog.create({
      data: {
        userId: teacherId,
        action: 'LIVE_CLASS_RESOURCE',
        resourceType: 'LIVE_CLASS',
        recordId: classId,
        changes: { title, fileUrl, uploadedAt: new Date() },
      },
    });
    return { resourceId: resource.id, title, fileUrl };
  }

  async listClassResources(classId: string) {
    const resources = await this.prisma.auditLog.findMany({
      where: { action: 'LIVE_CLASS_RESOURCE', recordId: classId },
      orderBy: { timestamp: 'desc' },
    });
    return resources.map((r) => ({ id: r.id, ...(r.changes as any) }));
  }
}
