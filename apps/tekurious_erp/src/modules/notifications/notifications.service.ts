import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-NOTIF-001: Send notification to a user
  async sendNotification(dto: {
    userId: string; title: string; message: string; type: string;
    priority?: string; resourceType?: string; resourceId?: string;
    channels?: string[]; scheduledAt?: string; templateId?: string; templateData?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        priority: (dto.priority || 'MEDIUM') as any,
        channels: (dto.channels || ['IN_APP']) as any,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        templateId: dto.templateId,
        templateData: dto.templateData,
      },
    });

    // Create delivery records for each channel
    if (dto.channels && dto.channels.length > 0) {
      await this.prisma.notificationDelivery.createMany({
        data: dto.channels.map((channel) => ({
          notificationId: notification.id,
          channel,
          recipient: dto.userId, // simplified — real impl resolves email/phone
          status: 'PENDING',
        })),
      });
    }

    this.eventBus.publish('notification.sent', {
      notificationId: notification.id,
      userId: dto.userId,
      type: dto.type,
      channels: dto.channels,
    });

    return notification;
  }

  // FR-NOTIF-002: Bulk send notification to multiple users
  async sendBulkNotification(dto: {
    userIds: string[]; title: string; message: string; type: string;
    priority?: string; channels?: string[]; resourceType?: string; resourceId?: string;
  }) {
    const results = { sent: 0, errors: [] as string[] };

    for (const userId of dto.userIds) {
      try {
        await this.sendNotification({ ...dto, userId });
        results.sent++;
      } catch {
        results.errors.push(userId);
      }
    }

    return { success: true, results };
  }

  // FR-NOTIF-003: Get user notifications
  async getUserNotifications(userId: string, filters: {
    isRead?: boolean; type?: string; page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
      ...(filters.isRead !== undefined ? { isRead: filters.isRead } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } }),
    ]);

    return {
      data: items,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // FR-NOTIF-004: Mark notification as read
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // FR-NOTIF-005: Mark all as read
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true, marked: result.count };
  }

  // FR-NOTIF-006: Delete notification
  async deleteNotification(userId: string, notificationId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n || n.userId !== userId) throw new NotFoundException('Notification not found');
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // FR-NOTIF-007: Get notification preferences
  async getPreferences(userId: string) {
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      // Return defaults
      return {
        userId,
        email: true, sms: true, push: true, inApp: true, whatsapp: false,
        quietHoursStart: '22:00', quietHoursEnd: '07:00',
        preferences: {},
      };
    }
    return prefs;
  }

  // FR-NOTIF-008: Update notification preferences
  async updatePreferences(userId: string, dto: {
    email?: boolean; sms?: boolean; push?: boolean; inApp?: boolean; whatsapp?: boolean;
    quietHoursStart?: string; quietHoursEnd?: string; preferences?: Record<string, any>;
  }) {
    const data: any = {
      ...(dto.email !== undefined ? { emailEnabled: dto.email } : {}),
      ...(dto.sms !== undefined ? { smsEnabled: dto.sms } : {}),
      ...(dto.push !== undefined ? { pushEnabled: dto.push } : {}),
      ...(dto.whatsapp !== undefined ? { whatsappEnabled: dto.whatsapp } : {}),
      ...(dto.preferences ? { preferences: dto.preferences } : {}),
    };
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // FR-EMAIL-001–006: Email Log
  async getEmailLogs(userId?: string, status?: string) {
    return this.prisma.emailLog.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
  }

  // FR-SMS-001–004: SMS Log
  async getSMSLogs(userId?: string) {
    return this.prisma.sMSLog.findMany({
      where: userId ? { userId } : {},
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
  }

  // Notification delivery status
  async getDeliveryStatus(notificationId: string) {
    const deliveries = await this.prisma.notificationDelivery.findMany({
      where: { notificationId },
    });
    return { notificationId, deliveries };
  }

  // Notification templates
  async createTemplate(createdBy: string, dto: {
    name: string; type: string; subject?: string; bodyHtml?: string;
    bodySms?: string; bodyPush?: string; variables?: string[];
  }) {
    return this.prisma.notificationTemplate.create({
      data: {
        name: dto.name,
        templateType: dto.type,
        subject: dto.subject,
        body: dto.bodyHtml || dto.bodySms || dto.bodyPush || '',
        variables: dto.variables || [],
        // no isActive field in schema
      },
    });
  }

  async listTemplates(type?: string) {
    return this.prisma.notificationTemplate.findMany({
      where: {
        ...(type ? { templateType: type } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  // FR-MSG-001–004: In-App Messaging — conversation/message flow
  async createConversation(userId: string, dto: {
    participantIds: string[]; name?: string; conversationType?: string;
  }) {
    const allParticipants = [userId, ...dto.participantIds.filter((id) => id !== userId)];
    const type = dto.conversationType || (allParticipants.length === 2 ? 'ONE_ON_ONE' : 'GROUP');

    const conversation = await this.prisma.conversation.create({
      data: {
        conversationType: type,
        name: dto.name,
        createdBy: userId,
        participants: {
          create: allParticipants.map((uid) => ({
            userId: uid,
            joinedAt: new Date(),
          })),
        },
      },
      include: { participants: true },
    });

    return conversation;
  }

  async sendMessage(userId: string, conversationId: string, dto: {
    content: string; messageType?: string; attachments?: string[];
  }) {
    const participant = await this.prisma.messageParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!participant) throw new NotFoundException('Not a participant in this conversation');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: dto.content,               // schema uses 'body' not 'content'
        messageType: dto.messageType || 'TEXT',
      },
    });

    // Update conversation last message
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: dto.content.slice(0, 100),
      },
    });

    this.eventBus.publish('message.sent', { messageId: message.id, conversationId, senderId: userId });
    return message;
  }

  async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const participant = await this.prisma.messageParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!participant) throw new NotFoundException('Not a participant in this conversation');

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null } }),
    ]);

    return { data: messages.reverse(), meta: { total, page, limit } };
  }

  async getUserConversations(userId: string) {
    const participations = await this.prisma.messageParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              select: { userId: true, role: true, joinedAt: true, lastReadAt: true },
            },
          },
        },
      },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
    });
    return participations.map((p) => p.conversation);
  }
}
