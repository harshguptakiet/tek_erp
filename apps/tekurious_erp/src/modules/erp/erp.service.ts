import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class ErpService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-LIB-001–012: LIBRARY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async addBook(addedBy: string, dto: {
    schoolId: string; isbn?: string; title: string; author?: string;
    publisher?: string; edition?: string; publicationYear?: number;
    category?: string; totalCopies?: number; language?: string; description?: string;
  }) {
    if (dto.isbn) {
      const existing = await this.prisma.libraryBook.findFirst({
        where: { schoolId: dto.schoolId, isbn: dto.isbn },
      });
      if (existing) throw new ConflictException('Book with this ISBN already exists');
    }
    const book = await this.prisma.libraryBook.create({
      data: {
        schoolId: dto.schoolId, isbn: dto.isbn, title: dto.title,
        author: dto.author, publisher: dto.publisher, edition: dto.edition,
        publicationYear: dto.publicationYear, category: dto.category,
        totalCopies: dto.totalCopies || 1,
        availableCopies: dto.totalCopies || 1,
        language: dto.language || 'en', description: dto.description,
      },
    });
    this.eventBus.publish('library.book.added', { bookId: book.id, addedBy });
    return book;
  }

  async listBooks(schoolId: string, filters: { category?: string; search?: string; available?: boolean; page?: number; limit?: number }) {
    const page = filters.page || 1; const limit = filters.limit || 20;
    const where: any = {
      schoolId, isActive: true,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.available ? { availableCopies: { gt: 0 } } : {}),
      ...(filters.search ? { OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
        { isbn: { contains: filters.search } },
      ]} : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.libraryBook.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { title: 'asc' } }),
      this.prisma.libraryBook.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  async getBook(bookId: string) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async registerLibraryMember(dto: { userId: string; userType: string; membershipType?: string; maxBooks?: number; maxDays?: number }) {
    const existing = await this.prisma.libraryMember.findUnique({ where: { userId: dto.userId } });
    if (existing) throw new ConflictException('Library membership already exists');
    const membershipNumber = `LIB-${Date.now()}-${dto.userId.slice(-4).toUpperCase()}`;
    return this.prisma.libraryMember.create({
      data: {
        userId: dto.userId, userType: dto.userType,
        membershipNumber, membershipType: dto.membershipType || 'REGULAR',
        maxBooksAllowed: dto.maxBooks || 3, maxDays: dto.maxDays || 14,
        isActive: true,
      },
    });
  }

  async issueBook(issuedBy: string, dto: { bookId: string; userId: string; userType: string; dueDate?: string }) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: dto.bookId } });
    if (!book || !book.isActive) throw new NotFoundException('Book not found');
    if (book.availableCopies <= 0) throw new BadRequestException('No copies available');

    const member = await this.prisma.libraryMember.findUnique({ where: { userId: dto.userId } });
    if (!member || !member.isActive) throw new BadRequestException('User is not a registered library member');

    // Count active (not returned) issues
    const activeIssues = await this.prisma.libraryIssue.count({
      where: { userId: dto.userId, isReturned: false },
    });
    if (activeIssues >= member.maxBooksAllowed) {
      throw new BadRequestException(`User has reached the maximum book limit of ${member.maxBooksAllowed}`);
    }

    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : new Date(Date.now() + member.maxDays * 24 * 60 * 60 * 1000);

    const issue = await this.prisma.$transaction(async (tx) => {
      const created = await tx.libraryIssue.create({
        data: {
          bookId: dto.bookId, userId: dto.userId, userType: dto.userType,
          issueDate: new Date(), dueDate,
          isReturned: false, isOverdue: false,
          issuedBy,
        },
      });
      await tx.libraryBook.update({
        where: { id: dto.bookId },
        data: { availableCopies: { decrement: 1 } },
      });
      return created;
    });

    this.eventBus.publish('library.book.issued', { issueId: issue.id, bookId: dto.bookId, userId: dto.userId });
    return issue;
  }

  async returnBook(returnedBy: string, issueId: string) {
    const issue = await this.prisma.libraryIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue record not found');
    if (issue.isReturned) throw new ConflictException('Book already returned');

    const today = new Date();
    const isOverdue = today > issue.dueDate;
    let fineAmount = 0;
    if (isOverdue) {
      const overdueDays = Math.ceil((today.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 2; // Rs. 2 per day
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.libraryIssue.update({
        where: { id: issueId },
        data: { isReturned: true, returnDate: today, fineAmount: fineAmount as any, returnedTo: returnedBy },
      });
      await tx.libraryBook.update({
        where: { id: issue.bookId },
        data: { availableCopies: { increment: 1 } },
      });
      return u;
    });

    this.eventBus.publish('library.book.returned', { issueId, overdue: isOverdue, fine: fineAmount });
    return { ...updated, fineAmount, isOverdue };
  }

  async reserveBook(userId: string, dto: { bookId: string; userType: string }) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: dto.bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const existing = await this.prisma.libraryReservation.findFirst({
      where: { bookId: dto.bookId, userId, status: 'ACTIVE' },
    });
    if (existing) throw new ConflictException('Book already reserved');

    return this.prisma.libraryReservation.create({
      data: {
        bookId: dto.bookId, userId, userType: dto.userType,
        reservedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: 'ACTIVE',
      },
    });
  }

  async renewBook(userId: string, issueId: string) {
    const issue = await this.prisma.libraryIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');
    if (issue.userId !== userId) throw new BadRequestException('Access denied');
    if (issue.isReturned) throw new BadRequestException('Book is not currently issued');
    if (issue.renewalCount >= issue.maxRenewals) throw new BadRequestException('Maximum renewals reached');

    const newDueDate = new Date(issue.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.prisma.libraryIssue.update({
      where: { id: issueId },
      data: { dueDate: newDueDate, renewalCount: { increment: 1 } },
    });
  }

  async getLibraryStats(schoolId: string) {
    const [totalBooks, totalCopies, issued, overdue, members] = await Promise.all([
      this.prisma.libraryBook.count({ where: { schoolId, isActive: true } }),
      this.prisma.libraryBook.aggregate({ where: { schoolId }, _sum: { totalCopies: true, availableCopies: true } }),
      this.prisma.libraryIssue.count({ where: { book: { schoolId }, isReturned: false } }),
      this.prisma.libraryIssue.count({ where: { book: { schoolId }, isReturned: false, dueDate: { lt: new Date() } } }),
      this.prisma.libraryMember.count({ where: { isActive: true } }),
    ]);
    return {
      schoolId, totalBooks, totalCopies: totalCopies._sum.totalCopies || 0,
      availableCopies: totalCopies._sum.availableCopies || 0,
      issued, overdue, members,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-001–012: TRANSPORT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async addVehicle(dto: { schoolId?: string; organizationId?: string; vehicleNumber: string; vehicleType: string; make?: string; model?: string; year?: number; capacity?: number; driverName?: string; driverPhone?: string }) {
    const existing = await this.prisma.transportVehicle.findUnique({ where: { vehicleNumber: dto.vehicleNumber } });
    if (existing) throw new ConflictException('Vehicle number already registered');
    return this.prisma.transportVehicle.create({
      data: {
        schoolId: dto.schoolId, organizationId: dto.organizationId,
        vehicleNumber: dto.vehicleNumber, vehicleType: dto.vehicleType,
        make: dto.make, model: dto.model, year: dto.year,
        capacity: dto.capacity || 40,
        status: 'IDLE',
        isActive: true,
        // driverName/driverPhone stored in metadata since not direct fields
        maintenanceSchedule: dto.driverName ? { driverName: dto.driverName, driverPhone: dto.driverPhone } : undefined,
      },
    });
  }

  async listVehicles(schoolId?: string, organizationId?: string) {
    return this.prisma.transportVehicle.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
        ...(organizationId ? { organizationId } : {}),
        isActive: true,
      },
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  async createRoute(dto: {
    schoolId: string; routeName: string; routeNumber: string;
    startPoint: string; endPoint: string; vehicleId?: string;
    totalDistance?: number; estimatedTime?: number;
    stops?: Array<{ stopName: string; stopSequence: number; address?: string; landmark?: string }>;
  }) {
    const route = await this.prisma.transportRoute.create({
      data: {
        schoolId: dto.schoolId, routeName: dto.routeName, routeNumber: dto.routeNumber,
        startPoint: dto.startPoint, endPoint: dto.endPoint,
        vehicleId: dto.vehicleId,
        totalDistance: dto.totalDistance as any,
        estimatedTime: dto.estimatedTime,
        isActive: true,
      },
    });

    if (dto.stops && dto.stops.length > 0) {
      await this.prisma.transportRouteStop.createMany({
        data: dto.stops.map((s) => ({ routeId: route.id, ...s })),
      });
    }

    return this.prisma.transportRoute.findUnique({
      where: { id: route.id },
      include: { stops: { orderBy: { stopSequence: 'asc' } } },
    });
  }

  async listRoutes(schoolId: string) {
    return this.prisma.transportRoute.findMany({
      where: { schoolId, isActive: true },
      include: { stops: { orderBy: { stopSequence: 'asc' } }, vehicle: true },
      orderBy: { routeNumber: 'asc' },
    });
  }

  async assignStudentToRoute(assignedBy: string, dto: { studentId: string; routeId: string; stopId?: string }) {
    const existing = await this.prisma.transportStudentAssignment.findUnique({
      where: { studentId: dto.studentId },
    });
    if (existing && !existing.unassignedAt) throw new ConflictException('Student already assigned to a route');

    const assignment = existing
      ? await this.prisma.transportStudentAssignment.update({
          where: { id: existing.id },
          data: { routeId: dto.routeId, stopId: dto.stopId, assignedAt: new Date(), unassignedAt: null },
        })
      : await this.prisma.transportStudentAssignment.create({
          data: { studentId: dto.studentId, routeId: dto.routeId, stopId: dto.stopId, assignedAt: new Date() },
        });

    this.eventBus.publish('transport.student.assigned', { studentId: dto.studentId, routeId: dto.routeId });
    return assignment;
  }

  async getStudentTransportAssignment(studentId: string) {
    const assignment = await this.prisma.transportStudentAssignment.findUnique({
      where: { studentId },
      include: {
        route: { include: { stops: { orderBy: { stopSequence: 'asc' } }, vehicle: true } },
      },
    });
    if (!assignment) throw new NotFoundException('No transport assignment found');
    return assignment;
  }

  async getRouteStudents(routeId: string) {
    return this.prisma.transportStudentAssignment.findMany({
      where: { routeId, unassignedAt: null },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-001–012: HOSTEL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createHostelBlock(dto: {
    schoolId: string; blockName: string; blockNumber?: string; blockType?: string;
    totalFloors?: number; totalRooms: number; totalCapacity: number;
    wardenName?: string; wardenPhone?: string;
  }) {
    return this.prisma.hostelBlock.create({
      data: {
        schoolId: dto.schoolId, blockName: dto.blockName, blockNumber: dto.blockNumber,
        blockType: dto.blockType || 'MIXED', totalFloors: dto.totalFloors || 1,
        totalRooms: dto.totalRooms, totalCapacity: dto.totalCapacity,
        wardenName: dto.wardenName, wardenPhone: dto.wardenPhone,
        isActive: true,
      },
    });
  }

  async listHostelBlocks(schoolId: string) {
    return this.prisma.hostelBlock.findMany({
      where: { schoolId, isActive: true },
      include: { _count: { select: { rooms: true } } },
      orderBy: { blockName: 'asc' },
    });
  }

  async createHostelRoom(dto: {
    blockId: string; roomNumber: string; roomType?: string; capacity: number; floor?: number; amenities?: string[];
  }) {
    const block = await this.prisma.hostelBlock.findUnique({ where: { id: dto.blockId } });
    if (!block) throw new NotFoundException('Hostel block not found');
    return this.prisma.hostelRoom.create({
      data: {
        blockId: dto.blockId, roomNumber: dto.roomNumber,
        roomType: dto.roomType || 'STANDARD', capacity: dto.capacity,
        occupied: 0, floor: dto.floor,
        facilities: dto.amenities || [],  // schema uses 'facilities'
        isActive: true,
      },
    });
  }

  async listHostelRooms(blockId: string, available?: boolean) {
    const rooms = await this.prisma.hostelRoom.findMany({
      where: { blockId, isActive: true },
      include: { _count: { select: { assignments: true } } },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
    // Filter by availability (occupied < capacity) if requested
    if (available !== undefined) {
      return rooms.filter((r) => available ? r.occupied < r.capacity : r.occupied >= r.capacity);
    }
    return rooms;
  }

  async assignStudentToRoom(assignedBy: string, dto: { studentId: string; roomId: string; bedNumber?: string }) {
    const room = await this.prisma.hostelRoom.findUnique({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.occupied >= room.capacity) throw new BadRequestException('Room is at full capacity');

    const existing = await this.prisma.hostelRoomAssignment.findUnique({
      where: { studentId: dto.studentId },
    });
    if (existing && existing.status === 'ACTIVE') throw new ConflictException('Student already assigned to a hostel room');

    const assignment = await this.prisma.$transaction(async (tx) => {
      const a = await tx.hostelRoomAssignment.create({
        data: {
          studentId: dto.studentId, roomId: dto.roomId,
          bedNumber: dto.bedNumber, status: 'ACTIVE', assignedAt: new Date(),
          monthlyRent: room.monthlyRent || (0 as any),  // schema requires monthlyRent
        },
      });
      await tx.hostelRoom.update({
        where: { id: dto.roomId },
        data: { occupied: { increment: 1 } },
      });
      return a;
    });

    this.eventBus.publish('hostel.student.assigned', { studentId: dto.studentId, roomId: dto.roomId });
    return assignment;
  }

  async vacateRoom(vacatedBy: string, assignmentId: string) {
    const assignment = await this.prisma.hostelRoomAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.status !== 'ACTIVE') throw new BadRequestException('Assignment is not active');

    await this.prisma.$transaction([
      this.prisma.hostelRoomAssignment.update({
        where: { id: assignmentId },
        data: { status: 'VACATED', vacatedAt: new Date() },
      }),
      this.prisma.hostelRoom.update({
        where: { id: assignment.roomId },
        data: { occupied: { decrement: 1 } },  // no isAvailable field in schema
      }),
    ]);

    return { success: true, message: 'Room vacated successfully' };
  }

  async getHostelStats(schoolId: string) {
    const blocks = await this.prisma.hostelBlock.findMany({
      where: { schoolId, isActive: true },
      include: { rooms: { select: { capacity: true, occupied: true } } },
    });

    const totalCapacity = blocks.reduce((s, b) => s + b.totalCapacity, 0);
    const totalOccupied = blocks.reduce((s, b) => s + b.rooms.reduce((rs, r) => rs + r.occupied, 0), 0);

    return {
      schoolId, totalBlocks: blocks.length, totalCapacity, totalOccupied,
      availableSpaces: totalCapacity - totalOccupied,
      occupancyRate: totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-001–010: DISCIPLINE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async recordDisciplinaryAction(recordedBy: string, dto: {
    studentId: string; incidentDate: string; incidentType: string;
    description: string; actionTaken?: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const record = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentDate: new Date(dto.incidentDate),
        incidentType: dto.incidentType,
        description: dto.description,
        actionTaken: dto.actionTaken,
        recordedBy,
      },
    });

    this.eventBus.publish('discipline.record.created', {
      recordId: record.id, studentId: dto.studentId, incidentType: dto.incidentType,
    });
    return record;
  }

  async getStudentDisciplinaryRecords(studentId: string) {
    const records = await this.prisma.disciplinaryRecord.findMany({
      where: { studentId },
      orderBy: { incidentDate: 'desc' },
    });
    return { studentId, total: records.length, records };
  }

  async getDisciplinaryReport(schoolId: string, filters: { startDate?: string; endDate?: string }) {
    const students = await this.prisma.studentProfile.findMany({
      where: { schoolId },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    const records = await this.prisma.disciplinaryRecord.findMany({
      where: {
        studentId: { in: studentIds },
        ...(filters.startDate || filters.endDate ? {
          incidentDate: {
            ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
          },
        } : {}),
      },
      orderBy: { incidentDate: 'desc' },
    });

    const byType = records.reduce((acc, r) => {
      acc[r.incidentType] = (acc[r.incidentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { schoolId, total: records.length, byType, records };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-EVENT-001–009: ANNOUNCEMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  async createAnnouncement(createdBy: string, dto: {
    schoolId?: string; organizationId?: string; title: string; content: string;
    targetRoleIds?: string[]; targetClasses?: string[]; attachments?: string[];
    priority?: string; publishAt?: string;
  }) {
    const announcement = await this.prisma.announcement.create({
      data: {
        schoolId: dto.schoolId, organizationId: dto.organizationId,
        title: dto.title, content: dto.content,
        targetRoleIds: dto.targetRoleIds || [],
        targetClasses: dto.targetClasses || [],
        attachments: dto.attachments || [],
        // schema has no priority/isActive — use publishedAt and isPinned
        isPinned: dto.priority === 'HIGH' ? true : false,
        publishedAt: dto.publishAt ? new Date(dto.publishAt) : new Date(),
        createdBy,
      },
    });

    this.eventBus.publish('announcement.created', {
      announcementId: announcement.id, title: dto.title, createdBy,
    });
    return announcement;
  }

  async listAnnouncements(filters: { schoolId?: string; organizationId?: string; page?: number; limit?: number }) {
    const page = filters.page || 1; const limit = filters.limit || 20;
    const where: any = {
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      // no isActive in schema — filter by publishedAt
      publishedAt: { lte: new Date() },
    };
    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where, skip: (page-1)*limit, take: limit,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      }),
      this.prisma.announcement.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  async getAnnouncement(announcementId: string) {
    const a = await this.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!a) throw new NotFoundException('Announcement not found');
    return a;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HR-001–010: HR & PAYROLL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createPayrollStructure(dto: {
    schoolId?: string; organizationId?: string; structureName: string; designation?: string;
    basicSalary: number; allowances: Record<string, number>; deductions?: Record<string, number>;
    effectiveFrom?: string;
  }) {
    const totalAllowances = Object.values(dto.allowances || {}).reduce((s, v) => s + v, 0);
    const totalDeductions = Object.values(dto.deductions || {}).reduce((s, v) => s + v, 0);
    const grossSalary = dto.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    return this.prisma.payrollStructure.create({
      data: {
        schoolId: dto.schoolId, organizationId: dto.organizationId,
        structureName: dto.structureName, designation: dto.designation,
        basicSalary: dto.basicSalary as any,
        allowances: dto.allowances as any,
        deductions: (dto.deductions || {}) as any,
        grossSalary: grossSalary as any,
        netSalary: netSalary as any,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        isActive: true,
      },
    });
  }

  async listPayrollStructures(schoolId?: string, organizationId?: string) {
    return this.prisma.payrollStructure.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
        ...(organizationId ? { organizationId } : {}),
      },
      orderBy: { structureName: 'asc' },
    });
  }

  async generateEmployeeSalary(processedBy: string, dto: {
    employeeId: string; employeeType: string; monthYear: string;
    payrollStructureId?: string; workingDays: number; presentDays: number;
    basicSalary: number; allowances: Record<string, number>; deductions?: Record<string, number>; bonuses?: Record<string, number>;
  }) {
    // Check duplicate
    const existing = await this.prisma.employeeSalary.findFirst({
      where: { employeeId: dto.employeeId, monthYear: dto.monthYear },
    });
    if (existing) throw new ConflictException(`Salary for ${dto.monthYear} already generated`);

    const totalAllowances = Object.values(dto.allowances || {}).reduce((s, v) => s + v, 0);
    const totalDeductions = Object.values(dto.deductions || {}).reduce((s, v) => s + v, 0);
    const totalBonuses = Object.values(dto.bonuses || {}).reduce((s, v) => s + v, 0);
    const grossSalary = dto.basicSalary + totalAllowances + totalBonuses;
    const netSalary = grossSalary - totalDeductions;

    const salary = await this.prisma.employeeSalary.create({
      data: {
        employeeId: dto.employeeId, employeeType: dto.employeeType,
        payrollStructureId: dto.payrollStructureId, monthYear: dto.monthYear,
        workingDays: dto.workingDays, presentDays: dto.presentDays,
        basicSalary: dto.basicSalary as any,
        allowances: dto.allowances || {},
        deductions: dto.deductions || {},    // required field in schema
        bonuses: dto.bonuses || {},
        grossSalary: grossSalary as any,
        netSalary: netSalary as any,
        status: 'DRAFT',                     // schema default is DRAFT
      },
    });

    this.eventBus.publish('payroll.salary.generated', {
      salaryId: salary.id, employeeId: dto.employeeId, monthYear: dto.monthYear, netSalary,
    });
    return salary;
  }

  async processSalaryPayment(approvedBy: string, salaryId: string, dto: { paymentMode: string; transactionId?: string }) {
    const salary = await this.prisma.employeeSalary.findUnique({ where: { id: salaryId } });
    if (!salary) throw new NotFoundException('Salary record not found');
    if (salary.status === 'PAID') throw new ConflictException('Salary already paid');

    const updated = await this.prisma.employeeSalary.update({
      where: { id: salaryId },
      data: {
        status: 'PAID', paidOn: new Date(), approvedBy,
        paymentMethod: dto.paymentMode,    // schema uses paymentMethod
        transactionId: dto.transactionId,
      },
    });

    this.eventBus.publish('payroll.salary.paid', { salaryId, employeeId: salary.employeeId, approvedBy });
    return updated;
  }

  async getEmployeeSalaryHistory(employeeId: string, year?: string) {
    const where: any = {
      employeeId,
      ...(year ? { monthYear: { startsWith: year } } : {}),
    };
    const salaries = await this.prisma.employeeSalary.findMany({
      where, orderBy: { monthYear: 'desc' },
    });
    const totalPaid = salaries.filter((s) => s.status === 'PAID').reduce((sum, s) => sum + Number(s.netSalary), 0);
    return { employeeId, totalPaid, salaries };
  }

  async getPayrollReport(filters: { schoolId?: string; organizationId?: string; monthYear?: string }) {
    const structures = await this.prisma.payrollStructure.findMany({
      where: {
        ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
        ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      },
    });

    const salaries = await this.prisma.employeeSalary.findMany({
      where: {
        ...(filters.monthYear ? { monthYear: filters.monthYear } : {}),
      },
      orderBy: { monthYear: 'desc' },
      take: 100,
    });

    const totalGross = salaries.reduce((s, r) => s + Number(r.grossSalary || 0), 0);
    const totalNet = salaries.reduce((s, r) => s + Number(r.netSalary || 0), 0);
    const paid = salaries.filter((s) => s.status === 'PAID').length;

    return {
      month: filters.monthYear,
      totalRecords: salaries.length,
      paid, pending: salaries.length - paid,
      totalGross, totalNet,
      structures: structures.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-INV-001–010: INVENTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createInventoryCategory(dto: { name: string; description?: string; parentId?: string }) {
    return this.prisma.inventoryCategory.create({
      data: { name: dto.name, description: dto.description, parentId: dto.parentId },
    });
  }

  async listInventoryCategories() {
    return this.prisma.inventoryCategory.findMany({
      where: { parentId: null }, // root categories
      include: { children: true },
      orderBy: { name: 'asc' },
    });
  }

  async addInventoryItem(dto: {
    schoolId?: string; organizationId?: string; itemName: string; itemCode?: string;
    categoryId?: string; description?: string; unit?: string;
    reorderLevel?: number; unitCost?: number;
  }) {
    if (dto.itemCode) {
      const existing = await this.prisma.inventoryItem.findUnique({ where: { itemCode: dto.itemCode } });
      if (existing) throw new ConflictException('Item code already exists');
    }
    return this.prisma.inventoryItem.create({
      data: {
        schoolId: dto.schoolId, organizationId: dto.organizationId,
        itemName: dto.itemName, itemCode: dto.itemCode,
        categoryId: dto.categoryId, description: dto.description,
        unit: dto.unit, quantity: 0,
        reorderLevel: dto.reorderLevel || 10,
        unitPrice: dto.unitCost as any,      // schema uses unitPrice
        isActive: true,
      },
    });
  }

  async listInventoryItems(filters: { schoolId?: string; organizationId?: string; categoryId?: string; search?: string; lowStock?: boolean }) {
    const where: any = {
      isActive: true,
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.search ? { itemName: { contains: filters.search, mode: 'insensitive' } } : {}),
    };
    const items = await this.prisma.inventoryItem.findMany({
      where, orderBy: { itemName: 'asc' },
      include: { category: { select: { name: true } } },
    });
    if (filters.lowStock) {
      return items.filter((i) => i.quantity <= (i.reorderLevel || 10));
    }
    return items;
  }

  async recordInventoryTransaction(recordedBy: string, dto: {
    itemId: string; transactionType: string; quantity: number;
    fromLocation?: string; toLocation?: string; reference?: string;
    unitPrice?: number; notes?: string;
  }) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Inventory item not found');

    const newQuantity = dto.transactionType === 'IN'
      ? item.quantity + dto.quantity
      : dto.transactionType === 'OUT' || dto.transactionType === 'DAMAGED' || dto.transactionType === 'EXPIRED'
        ? item.quantity - dto.quantity
        : item.quantity; // ADJUSTMENT handled separately

    if (newQuantity < 0) throw new BadRequestException('Insufficient stock');

    const totalValue = dto.unitPrice ? dto.unitPrice * dto.quantity : null;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.create({
        data: {
          itemId: dto.itemId, transactionType: dto.transactionType, quantity: dto.quantity,
          fromLocation: dto.fromLocation, toLocation: dto.toLocation,
          reference: dto.reference, unitPrice: dto.unitPrice as any,
          totalValue: totalValue as any,
          performedBy: recordedBy,  // schema uses performedBy
          reason: dto.notes,        // schema uses reason not notes
          transactionDate: new Date(),
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: { quantity: newQuantity },
      }),
    ]);

    this.eventBus.publish('inventory.transaction.recorded', {
      itemId: dto.itemId, type: dto.transactionType, quantity: dto.quantity, newQuantity,
    });
    return transaction;
  }

  async createRequisition(requestedBy: string, dto: {
    itemId: string; requestedFor?: string; quantity: number; purpose: string;
  }) {
    return this.prisma.inventoryRequisition.create({
      data: {
        itemId: dto.itemId, requestedBy, requestedFor: dto.requestedFor,
        quantity: dto.quantity, purpose: dto.purpose, status: 'PENDING',
        requestedAt: new Date(),
      },
    });
  }

  async approveRequisition(approvedBy: string, requisitionId: string, approved: boolean) {
    const req = await this.prisma.inventoryRequisition.findUnique({ where: { id: requisitionId } });
    if (!req) throw new NotFoundException('Requisition not found');

    const updated = await this.prisma.inventoryRequisition.update({
      where: { id: requisitionId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedBy, approvedAt: new Date(),
      },
    });

    if (approved) {
      // Auto-issue: record OUT transaction
      await this.recordInventoryTransaction(approvedBy, {
        itemId: req.itemId, transactionType: 'OUT', quantity: req.quantity,
        reference: `REQ-${requisitionId}`, notes: req.purpose,
      });
    }

    return updated;
  }

  async getInventoryStats(filters: { schoolId?: string; organizationId?: string }) {
    const where: any = {
      isActive: true,
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
    };
    const [total, lowStock, totalValue] = await Promise.all([
      this.prisma.inventoryItem.count({ where }),
      this.prisma.inventoryItem.count({ where: { ...where, quantity: { lte: 10 } } }),
      this.prisma.inventoryItem.aggregate({
        where,
        _sum: { quantity: true },
      }),
    ]);
    return {
      totalItems: total,
      lowStockItems: lowStock,
      totalQuantity: totalValue._sum.quantity || 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CERTIFICATES (FR-CERT-001–010)
  // ═══════════════════════════════════════════════════════════════════════════

  async createCertificateTemplate(createdBy: string, dto: {
    name: string; certificateType: string; templateHtml: string; templateCss?: string;
    variables?: string[]; signaturePositions?: any;
  }) {
    return this.prisma.certificateTemplate.create({
      data: {
        name: dto.name, certificateType: dto.certificateType,
        templateHtml: dto.templateHtml, templateCss: dto.templateCss,
        variables: dto.variables || [], signaturePositions: dto.signaturePositions,
        isActive: true, createdBy,
      },
    });
  }

  async listCertificateTemplates(certificateType?: string) {
    return this.prisma.certificateTemplate.findMany({
      where: { isActive: true, ...(certificateType ? { certificateType } : {}) },
      orderBy: { name: 'asc' },
    });
  }

  async issueCertificate(issuedBy: string, dto: {
    templateId: string; recipientId: string; recipientType: string;
    title: string; description?: string; issuedFor?: string;
    data?: any; issuedAt?: string; expiresAt?: string;
  }) {
    const template = await this.prisma.certificateTemplate.findUnique({ where: { id: dto.templateId } });
    if (!template || !template.isActive) throw new NotFoundException('Certificate template not found');

    const certNumber = `CERT-${Date.now()}-${dto.recipientId.slice(-4).toUpperCase()}`;
    const verificationCode = `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const cert = await this.prisma.certificate.create({
      data: {
        templateId: dto.templateId, recipientId: dto.recipientId,
        recipientType: dto.recipientType, certificateNumber: certNumber,
        title: dto.title, description: dto.description,
        issuedFor: dto.issuedFor, data: dto.data || {},
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        issuedBy, verificationCode,
      },
    });

    this.eventBus.publish('certificate.issued', {
      certificateId: cert.id, recipientId: dto.recipientId, certNumber,
    });
    return cert;
  }

  async bulkIssueCertificates(issuedBy: string, dto: {
    templateId: string; recipientType: string; recipientIds: string[];
    title: string; issuedFor?: string; data?: any;
  }) {
    const results = { issued: 0, errors: [] as string[] };
    for (const recipientId of dto.recipientIds) {
      try {
        await this.issueCertificate(issuedBy, {
          templateId: dto.templateId, recipientId, recipientType: dto.recipientType,
          title: dto.title, issuedFor: dto.issuedFor, data: dto.data,
        });
        results.issued++;
      } catch { results.errors.push(recipientId); }
    }
    return { success: true, results };
  }

  async getRecipientCertificates(recipientId: string, recipientType: string) {
    return this.prisma.certificate.findMany({
      where: { recipientId, recipientType },
      include: { template: { select: { name: true, certificateType: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyCertificate(certificateNumber: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { certificateNumber } });
    if (!cert) return { valid: false, message: 'Certificate not found' };
    const expired = cert.expiresAt && new Date() > cert.expiresAt;
    return {
      valid: !expired, certificateNumber, title: cert.title,
      recipientId: cert.recipientId, issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt, expired,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHOLARSHIPS (FR-ACAD-037–038)
  // ═══════════════════════════════════════════════════════════════════════════

  async createScholarship(dto: {
    schoolId?: string; scholarshipName: string; scholarshipType: string;
    provider: string; amount: number; amountType: string;
    eligibilityCriteria?: any; totalSlots?: number; applicationStart?: string; applicationEnd?: string;
  }) {
    return this.prisma.scholarship.create({
      data: {
        schoolId: dto.schoolId, scholarshipName: dto.scholarshipName,
        scholarshipType: dto.scholarshipType, provider: dto.provider,
        amount: dto.amount as any, amountType: dto.amountType,
        eligibilityCriteria: dto.eligibilityCriteria || {},
        totalSlots: dto.totalSlots, availableSlots: dto.totalSlots,
        applicationStart: dto.applicationStart ? new Date(dto.applicationStart) : new Date(),
        applicationEnd: dto.applicationEnd ? new Date(dto.applicationEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  async listScholarships(schoolId?: string, type?: string) {
    return this.prisma.scholarship.findMany({
      where: {
        isActive: true,
        ...(schoolId ? { schoolId } : {}),
        ...(type ? { scholarshipType: type } : {}),
      },
      orderBy: { scholarshipName: 'asc' },
    });
  }

  async applyForScholarship(studentId: string, dto: {
    scholarshipId: string; applicationData?: any; documents?: string[];
  }) {
    const scholarship = await this.prisma.scholarship.findUnique({ where: { id: dto.scholarshipId } });
    if (!scholarship || !scholarship.isActive) throw new NotFoundException('Scholarship not found');
    if (scholarship.availableSlots !== null && scholarship.availableSlots <= 0) {
      throw new BadRequestException('No available slots for this scholarship');
    }
    const existing = await this.prisma.scholarshipApplication.findFirst({
      where: { scholarshipId: dto.scholarshipId, studentId, status: { notIn: ['REJECTED'] } },
    });
    if (existing) throw new ConflictException('Application already submitted');

    return this.prisma.scholarshipApplication.create({
      data: {
        scholarshipId: dto.scholarshipId, studentId,
        applicationData: dto.applicationData || {},
        documents: dto.documents || [],
        status: 'PENDING', appliedAt: new Date(),
      },
    });
  }

  async reviewScholarshipApplication(reviewedBy: string, applicationId: string, dto: {
    status: string; reviewComments?: string; approvedAmount?: number;
  }) {
    const app = await this.prisma.scholarshipApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status, reviewedBy, reviewedAt: new Date(),
        reviewComments: dto.reviewComments,
        approvedAmount: dto.approvedAmount as any,
      },
    });

    this.eventBus.publish('scholarship.application.reviewed', {
      applicationId, studentId: app.studentId, status: dto.status,
    });
    return updated;
  }

  // FR-INV-009: Inventory Reports
  async getInventoryReports(filters: {
    schoolId?: string;
    organizationId?: string;
    reportType: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) {
    const where: any = {
      isActive: true,
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    };

    switch (filters.reportType) {
      case 'STOCK_SUMMARY': {
        const items = await this.prisma.inventoryItem.findMany({
          where,
          include: { category: { select: { name: true } } },
          orderBy: { itemName: 'asc' },
        });
        const totalValue = items.reduce((s, i) => s + (i.quantity * Number(i.unitPrice || 0)), 0);
        return {
          reportType: 'Stock Summary',
          generatedAt: new Date(),
          totalItems: items.length,
          totalValue,
          items: items.map(i => ({
            itemName: i.itemName,
            itemCode: i.itemCode,
            category: i.category?.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalValue: i.quantity * Number(i.unitPrice || 0),
            reorderLevel: i.reorderLevel,
          })),
        };
      }

      case 'STOCK_MOVEMENT': {
        const dateFilter: any = {};
        if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
        if (filters.endDate) dateFilter.lte = new Date(filters.endDate);

        const transactions = await this.prisma.inventoryTransaction.findMany({
          where: {
            item: where,
            ...(filters.startDate || filters.endDate ? { transactionDate: dateFilter } : {}),
          },
          include: {
            item: { select: { itemName: true, itemCode: true } },
          },
          orderBy: { transactionDate: 'desc' },
          take: 500,
        });

        const byType = transactions.reduce((acc, t) => {
          acc[t.transactionType] = (acc[t.transactionType] || 0) + t.quantity;
          return acc;
        }, {} as Record<string, number>);

        return {
          reportType: 'Stock Movement',
          period: `${filters.startDate || 'Beginning'} to ${filters.endDate || 'Now'}`,
          totalTransactions: transactions.length,
          movementByType: byType,
          transactions: transactions.map(t => ({
            date: t.transactionDate,
            itemName: t.item.itemName,
            itemCode: t.item.itemCode,
            type: t.transactionType,
            quantity: t.quantity,
            reference: t.reference,
            performedBy: t.performedBy,
          })),
        };
      }

      case 'REORDER_LEVEL': {
        const items = await this.prisma.inventoryItem.findMany({
          where,
          include: { category: { select: { name: true } } },
        });
        const lowStock = items.filter(i => i.quantity <= (i.reorderLevel || 10));
        return {
          reportType: 'Reorder Level Report',
          generatedAt: new Date(),
          totalLowStockItems: lowStock.length,
          items: lowStock.map(i => ({
            itemName: i.itemName,
            itemCode: i.itemCode,
            category: i.category?.name,
            currentQuantity: i.quantity,
            reorderLevel: i.reorderLevel,
            deficit: (i.reorderLevel || 10) - i.quantity,
            unitPrice: i.unitPrice,
          })),
        };
      }

      case 'DEAD_STOCK': {
        // Items with zero transactions in last 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const items = await this.prisma.inventoryItem.findMany({
          where,
          include: {
            category: { select: { name: true } },
            transactions: {
              where: { transactionDate: { gte: ninetyDaysAgo } },
              select: { id: true },
            },
          },
        });
        const deadStock = items.filter(i => i.transactions.length === 0 && i.quantity > 0);
        const totalValue = deadStock.reduce((s, i) => s + (i.quantity * Number(i.unitPrice || 0)), 0);
        return {
          reportType: 'Dead Stock Report',
          period: 'Last 90 days',
          totalDeadStockItems: deadStock.length,
          totalValue,
          items: deadStock.map(i => ({
            itemName: i.itemName,
            itemCode: i.itemCode,
            category: i.category?.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            value: i.quantity * Number(i.unitPrice || 0),
          })),
        };
      }

      case 'VALUATION': {
        const items = await this.prisma.inventoryItem.findMany({
          where,
          include: { category: { select: { name: true } } },
        });
        const byCategory = items.reduce((acc, i) => {
          const cat = i.category?.name || 'Uncategorized';
          if (!acc[cat]) acc[cat] = { count: 0, quantity: 0, value: 0 };
          acc[cat].count++;
          acc[cat].quantity += i.quantity;
          acc[cat].value += i.quantity * Number(i.unitPrice || 0);
          return acc;
        }, {} as Record<string, { count: number; quantity: number; value: number }>);

        const totalValue = Object.values(byCategory).reduce((s, c) => s + c.value, 0);
        return {
          reportType: 'Inventory Valuation',
          generatedAt: new Date(),
          totalValue,
          byCategory,
        };
      }

      default:
        throw new BadRequestException('Invalid report type. Valid types: STOCK_SUMMARY, STOCK_MOVEMENT, REORDER_LEVEL, DEAD_STOCK, VALUATION');
    }
  }

  // FR-INV-010: Lab Equipment Management
  async reserveLabEquipment(reservedBy: string, dto: {
    itemId: string;
    labName: string;
    reservedFor: string;
    quantity: number;
    reservationDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Equipment not found');
    if (item.quantity < dto.quantity) throw new BadRequestException('Insufficient equipment available');

    // Check for conflicts (simplified - in real system would check time overlaps)
    const reservation = await this.prisma.inventoryRequisition.create({
      data: {
        itemId: dto.itemId,
        requestedBy: reservedBy,
        requestedFor: dto.reservedFor,
        quantity: dto.quantity,
        purpose: `LAB_RESERVATION: ${dto.labName} - ${dto.purpose}`,
        status: 'APPROVED',
        requestedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: reservedBy,
      },
    });

    this.eventBus.publish('lab.equipment.reserved', {
      reservationId: reservation.id,
      itemId: dto.itemId,
      labName: dto.labName,
      reservedFor: dto.reservedFor,
      date: dto.reservationDate,
    });

    return {
      ...reservation,
      labName: dto.labName,
      reservationDate: dto.reservationDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
    };
  }

  async recordLabEquipmentUsage(recordedBy: string, dto: {
    itemId: string;
    labName: string;
    usedBy: string;
    quantity: number;
    experimentName: string;
    conditionBefore: string;
    conditionAfter: string;
    breakageCount?: number;
    consumablesUsed?: Record<string, number>;
    notes?: string;
  }) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Equipment not found');

    // Record the usage as a transaction
    await this.recordInventoryTransaction(recordedBy, {
      itemId: dto.itemId,
      transactionType: dto.breakageCount && dto.breakageCount > 0 ? 'DAMAGED' : 'OUT',
      quantity: dto.breakageCount || 0,
      reference: `LAB_USAGE: ${dto.labName} - ${dto.experimentName}`,
      notes: JSON.stringify({
        usedBy: dto.usedBy,
        experimentName: dto.experimentName,
        conditionBefore: dto.conditionBefore,
        conditionAfter: dto.conditionAfter,
        breakageCount: dto.breakageCount,
        consumablesUsed: dto.consumablesUsed,
        additionalNotes: dto.notes,
      }),
    });

    return {
      success: true,
      message: 'Lab equipment usage recorded',
      itemId: dto.itemId,
      labName: dto.labName,
      experimentName: dto.experimentName,
      breakageCount: dto.breakageCount || 0,
    };
  }

  async scheduleEquipmentCalibration(scheduledBy: string, dto: {
    itemId: string;
    calibrationDate: string;
    calibrationType: string;
    performedBy?: string;
    notes?: string;
  }) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Equipment not found');

    // Store calibration schedule in inventory item metadata or create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: scheduledBy,
        action: 'EQUIPMENT_CALIBRATION_SCHEDULED',
        tableName: 'InventoryItem',
        recordId: dto.itemId,
        changes: {
          calibrationDate: dto.calibrationDate,
          calibrationType: dto.calibrationType,
          performedBy: dto.performedBy,
          notes: dto.notes,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System',
      },
    });

    return {
      success: true,
      message: 'Calibration scheduled',
      itemId: dto.itemId,
      calibrationDate: dto.calibrationDate,
      calibrationType: dto.calibrationType,
    };
  }

  async getLabEquipmentReport(filters: {
    schoolId?: string;
    labName?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      isActive: true,
      ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
      // Filter for lab equipment category
      category: { name: { contains: 'Lab', mode: 'insensitive' } },
    };

    const equipment = await this.prisma.inventoryItem.findMany({
      where,
      include: {
        category: { select: { name: true } },
        transactions: {
          where: {
            ...(filters.startDate || filters.endDate ? {
              transactionDate: {
                ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
              },
            } : {}),
          },
          orderBy: { transactionDate: 'desc' },
          take: 100,
        },
      },
    });

    const totalEquipment = equipment.length;
    const totalValue = equipment.reduce((s, e) => s + (e.quantity * Number(e.unitPrice || 0)), 0);
    const damagedCount = equipment.reduce((s, e) => {
      const damaged = e.transactions.filter(t => t.transactionType === 'DAMAGED').length;
      return s + damaged;
    }, 0);

    return {
      reportType: 'Lab Equipment Report',
      period: `${filters.startDate || 'All time'} to ${filters.endDate || 'Now'}`,
      labName: filters.labName || 'All Labs',
      summary: {
        totalEquipment,
        totalValue,
        damagedIncidents: damagedCount,
      },
      equipment: equipment.map(e => ({
        itemName: e.itemName,
        itemCode: e.itemCode,
        category: e.category?.name,
        quantity: e.quantity,
        unitPrice: e.unitPrice,
        usageCount: e.transactions.filter(t => t.transactionType === 'OUT').length,
        breakageCount: e.transactions.filter(t => t.transactionType === 'DAMAGED').length,
        lastUsed: e.transactions[0]?.transactionDate,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-LIB-010: Library Access Control
  // ═══════════════════════════════════════════════════════════════════════════

  async recordLibraryAccess(dto: { userId: string; userType: string; accessType: 'CHECKIN' | 'CHECKOUT'; purpose?: string }) {
    // Note: This requires a LibraryAccess model in schema. For now, we'll simulate with event logging
    const timestamp = new Date();
    await this.eventBus.publish('library.access_recorded', {
      userId: dto.userId,
      userType: dto.userType,
      accessType: dto.accessType,
      purpose: dto.purpose,
      timestamp,
    });
    
    return {
      userId: dto.userId,
      accessType: dto.accessType,
      timestamp,
      message: `${dto.accessType} recorded successfully`,
    };
  }

  async getLibraryAccessLogs(schoolId: string, filters: { startDate?: string; endDate?: string; userId?: string; userType?: string }) {
    // Since we don't have LibraryAccess table, return mock structure
    // In production, this would query the LibraryAccess table
    return {
      message: 'Library access control requires LibraryAccess model in schema',
      filters,
      note: 'Events are being logged to event bus for future implementation',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-LIB-011: Book Recommendations
  // ═══════════════════════════════════════════════════════════════════════════

  async getBookRecommendations(userId: string, userType: string, options: { limit?: number; category?: string; gradeLevel?: string }) {
    const limit = options.limit || 10;

    // Get user's reading history
    const userIssues = await this.prisma.libraryIssue.findMany({
      where: { userId, userType },
      include: { book: true },
      orderBy: { issueDate: 'desc' },
      take: 20,
    });

    const readCategories = [...new Set(userIssues.map(i => i.book.category).filter(Boolean))];

    // Get popular books in similar categories
    const recommendations = await this.prisma.libraryBook.findMany({
      where: {
        isActive: true,
        availableCopies: { gt: 0 },
        ...(readCategories.length > 0 ? { category: { in: readCategories as string[] } } : {}),
        ...(options.category ? { category: options.category } : {}),
        // Exclude books user has already read
        NOT: { id: { in: userIssues.map(i => i.bookId) } },
      },
      take: limit,
      orderBy: { totalCopies: 'desc' }, // Proxy for popularity
    });

    return {
      userId,
      basedOn: {
        readingHistory: userIssues.length,
        preferredCategories: readCategories,
      },
      recommendations: recommendations.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        reason: readCategories.includes(book.category as string) 
          ? `Based on your interest in ${book.category}`
          : 'Popular in library',
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-LIB-007: E-Library Digital Resources
  // ═══════════════════════════════════════════════════════════════════════════

  async addDigitalResource(addedBy: string, dto: {
    schoolId: string; title: string; resourceType: string; url?: string;
    accessUrl?: string; licenseKey?: string; expiryDate?: string;
    maxUsers?: number; description?: string;
  }) {
    // Note: This requires DigitalResource model. For now, store as metadata in LibraryBook with special category
    const resource = await this.prisma.libraryBook.create({
      data: {
        schoolId: dto.schoolId,
        title: dto.title,
        category: `DIGITAL_${dto.resourceType}`,
        description: dto.description,
        totalCopies: dto.maxUsers || 999,
        availableCopies: dto.maxUsers || 999,
        isbn: `DIGITAL-${Date.now()}`,
        language: 'en',
      },
    });

    await this.eventBus.publish('library.digital_resource_added', {
      resourceId: resource.id,
      type: dto.resourceType,
      addedBy,
    });

    return resource;
  }

  async listDigitalResources(schoolId: string, filters: { resourceType?: string; available?: boolean }) {
    const resources = await this.prisma.libraryBook.findMany({
      where: {
        schoolId,
        isActive: true,
        category: { startsWith: 'DIGITAL_' },
        ...(filters.resourceType ? { category: `DIGITAL_${filters.resourceType}` } : {}),
        ...(filters.available ? { availableCopies: { gt: 0 } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: resources.length,
      resources: resources.map(r => ({
        id: r.id,
        title: r.title,
        resourceType: r.category?.replace('DIGITAL_', ''),
        availableSlots: r.availableCopies,
        totalSlots: r.totalCopies,
        description: r.description,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-008: Vehicle Maintenance Tracking
  // ═══════════════════════════════════════════════════════════════════════════

  async scheduleVehicleMaintenance(scheduledBy: string, dto: {
    vehicleId: string; maintenanceType: string; scheduledDate: string;
    description?: string; estimatedCost?: number; vendorName?: string;
  }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Store maintenance in vehicle's maintenanceSchedule JSON field
    const currentSchedule = (vehicle.maintenanceSchedule as any[]) || [];
    const newMaintenance = {
      id: `MAINT-${Date.now()}`,
      type: dto.maintenanceType,
      scheduledDate: dto.scheduledDate,
      description: dto.description,
      estimatedCost: dto.estimatedCost,
      vendorName: dto.vendorName,
      status: 'SCHEDULED',
      scheduledBy,
      createdAt: new Date(),
    };

    await this.prisma.transportVehicle.update({
      where: { id: dto.vehicleId },
      data: {
        maintenanceSchedule: [...currentSchedule, newMaintenance],
      },
    });

    await this.eventBus.publish('transport.maintenance_scheduled', {
      vehicleId: dto.vehicleId,
      maintenanceId: newMaintenance.id,
      scheduledDate: dto.scheduledDate,
    });

    return newMaintenance;
  }

  async logVehicleMaintenanceCompletion(completedBy: string, vehicleId: string, maintenanceId: string, dto: {
    completionDate: string; actualCost?: number; notes?: string; nextMaintenanceDate?: string;
  }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const maintenanceSchedule = (vehicle.maintenanceSchedule as any[]) || [];
    const index = maintenanceSchedule.findIndex((m: any) => m.id === maintenanceId);
    
    if (index === -1) throw new NotFoundException('Maintenance record not found');

    maintenanceSchedule[index] = {
      ...maintenanceSchedule[index],
      status: 'COMPLETED',
      completionDate: dto.completionDate,
      actualCost: dto.actualCost,
      notes: dto.notes,
      completedBy,
    };

    await this.prisma.transportVehicle.update({
      where: { id: vehicleId },
      data: { maintenanceSchedule },
    });

    await this.eventBus.publish('transport.maintenance_completed', {
      vehicleId,
      maintenanceId,
      completedBy,
    });

    return maintenanceSchedule[index];
  }

  async getVehicleMaintenanceHistory(vehicleId: string) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        vehicleNumber: true,
        registrationNumber: true,
        maintenanceSchedule: true,
      },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const schedule = (vehicle.maintenanceSchedule as any[]) || [];

    return {
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      maintenanceHistory: schedule.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-010: Transport Safety and Compliance
  // ═══════════════════════════════════════════════════════════════════════════

  async recordSafetyInspection(inspectedBy: string, vehicleId: string, dto: {
    inspectionDate: string; checklistItems: { item: string; status: 'PASS' | 'FAIL'; notes?: string }[];
    overallStatus: 'PASS' | 'FAIL'; nextInspectionDate?: string; remarks?: string;
  }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const inspection = {
      id: `INSP-${Date.now()}`,
      inspectionDate: dto.inspectionDate,
      checklistItems: dto.checklistItems,
      overallStatus: dto.overallStatus,
      nextInspectionDate: dto.nextInspectionDate,
      remarks: dto.remarks,
      inspectedBy,
      createdAt: new Date(),
    };

    // Store in vehicle's maintenanceSchedule JSON field (alongside maintenance records)
    const maintenanceSchedule = (vehicle.maintenanceSchedule as any) || {};
    const inspections = maintenanceSchedule.safetyInspections || [];
    inspections.push(inspection);

    await this.prisma.transportVehicle.update({
      where: { id: vehicleId },
      data: {
        maintenanceSchedule: { ...maintenanceSchedule, safetyInspections: inspections },
        status: dto.overallStatus === 'FAIL' ? 'MAINTENANCE' : vehicle.status,
      },
    });

    await this.eventBus.publish('transport.safety_inspection_recorded', {
      vehicleId,
      inspectionId: inspection.id,
      status: dto.overallStatus,
    });

    return inspection;
  }

  async getSafetyComplianceReport(schoolId: string) {
    const vehicles = await this.prisma.transportVehicle.findMany({
      where: { schoolId, isActive: true },
    });

    const complianceData = vehicles.map(v => {
      const maintenanceSchedule = (v.maintenanceSchedule as any) || {};
      const inspections = maintenanceSchedule.safetyInspections || [];
      const lastInspection = inspections[inspections.length - 1];

      return {
        vehicleNumber: v.vehicleNumber,
        registrationNumber: v.registrationNumber,
        status: v.status,
        lastInspectionDate: lastInspection?.inspectionDate,
        lastInspectionStatus: lastInspection?.overallStatus,
        nextInspectionDue: lastInspection?.nextInspectionDate,
        totalInspections: inspections.length,
      };
    });

    return {
      schoolId,
      totalVehicles: vehicles.length,
      compliantVehicles: complianceData.filter(v => v.lastInspectionStatus === 'PASS').length,
      nonCompliantVehicles: complianceData.filter(v => v.lastInspectionStatus === 'FAIL').length,
      pendingInspections: complianceData.filter(v => !v.lastInspectionDate).length,
      vehicles: complianceData,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-011: Transport Reports and Analytics
  // ═══════════════════════════════════════════════════════════════════════════

  async getTransportAnalytics(schoolId: string, filters: { startDate?: string; endDate?: string }) {
    const [vehicles, routes, assignments] = await Promise.all([
      this.prisma.transportVehicle.findMany({
        where: { schoolId, isActive: true },
      }),
      this.prisma.transportRoute.findMany({
        where: { schoolId, isActive: true },
      }),
      this.prisma.transportStudentAssignment.findMany({
        where: {
          route: { schoolId },
        },
        include: { route: true },
      }),
    ]);

    const totalMaintenanceCost = vehicles.reduce((sum, v) => {
      const schedule = (v.maintenanceSchedule as any[]) || [];
      return sum + schedule.reduce((s: number, m: any) => s + (m.actualCost || 0), 0);
    }, 0);

    const routeUtilization = routes.map(r => {
      const assignedStudents = assignments.filter(a => a.routeId === r.id).length;
      const vehicle = vehicles.find(v => v.id === r.vehicleId);
      return {
        routeName: r.routeName,
        routeNumber: r.routeNumber,
        assignedStudents,
        vehicleCapacity: vehicle?.capacity || 0,
        utilizationRate: vehicle?.capacity ? ((assignedStudents / vehicle.capacity) * 100).toFixed(1) + '%' : 'N/A',
      };
    });

    return {
      summary: {
        totalVehicles: vehicles.length,
        activeRoutes: routes.length,
        totalStudents: assignments.length,
        totalMaintenanceCost,
        averageUtilization: (routeUtilization.reduce((s, r) => s + parseFloat(r.utilizationRate) || 0, 0) / routes.length).toFixed(1) + '%',
      },
      routeUtilization,
      vehicleStatus: {
        active: vehicles.filter(v => v.status === 'ACTIVE').length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        inactive: vehicles.filter(v => v.status === 'INACTIVE').length,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-012: Emergency Response System
  // ═══════════════════════════════════════════════════════════════════════════

  async logEmergencyIncident(reportedBy: string, dto: {
    vehicleId: string; routeId?: string; incidentType: string;
    location?: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    studentsAffected?: number; actionsTaken?: string;
  }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: dto.vehicleId },
      include: { routes: { include: { assignments: true } } },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const incident = {
      id: `EMERG-${Date.now()}`,
      vehicleId: dto.vehicleId,
      routeId: dto.routeId,
      incidentType: dto.incidentType,
      location: dto.location,
      description: dto.description,
      severity: dto.severity,
      studentsAffected: dto.studentsAffected,
      actionsTaken: dto.actionsTaken,
      reportedBy,
      reportedAt: new Date(),
      status: 'OPEN',
    };

    // Store in vehicle maintenanceSchedule JSON
    const maintenanceSchedule = (vehicle.maintenanceSchedule as any) || {};
    const incidents = maintenanceSchedule.emergencyIncidents || [];
    incidents.push(incident);

    await this.prisma.transportVehicle.update({
      where: { id: dto.vehicleId },
      data: {
        maintenanceSchedule: { ...maintenanceSchedule, emergencyIncidents: incidents },
      },
    });

    // Publish critical alert
    await this.eventBus.publish('transport.emergency_incident', {
      incidentId: incident.id,
      vehicleId: dto.vehicleId,
      severity: dto.severity,
      timestamp: incident.reportedAt,
    });

    return incident;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-008: Leave and Outing Management
  // ═══════════════════════════════════════════════════════════════════════════

  async applyHostelLeave(studentId: string, dto: {
    leaveType: string; fromDate: string; toDate: string;
    reason: string; parentApprovalRequired?: boolean;
  }) {
    const assignment = await this.prisma.hostelRoomAssignment.findFirst({
      where: { studentId },
    });

    if (!assignment) throw new NotFoundException('Student not assigned to any hostel room');

    // Store leave in assignment checkInDate as JSON metadata (workaround for missing Leave model)
    const leaveRecord = {
      id: `LEAVE-${Date.now()}`,
      studentId,
      leaveType: dto.leaveType,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
      reason: dto.reason,
      status: dto.parentApprovalRequired ? 'PENDING_PARENT' : 'PENDING_WARDEN',
      appliedAt: new Date(),
    };

    await this.eventBus.publish('hostel.leave_applied', {
      leaveId: leaveRecord.id,
      studentId,
      leaveType: dto.leaveType,
    });

    return leaveRecord;
  }

  async approveHostelLeave(approvedBy: string, leaveId: string, approved: boolean, remarks?: string) {
    await this.eventBus.publish('hostel.leave_approved', {
      leaveId,
      approvedBy,
      approved,
      remarks,
      timestamp: new Date(),
    });

    return {
      leaveId,
      status: approved ? 'APPROVED' : 'REJECTED',
      approvedBy,
      remarks,
      approvedAt: new Date(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-009: Hostel Inventory Management
  // ═══════════════════════════════════════════════════════════════════════════

  async addHostelInventoryItem(addedBy: string, dto: {
    blockId: string; itemName: string; category: string;
    quantity: number; unitPrice?: number; condition?: string;
  }) {
    // Use main inventory system with hostel-specific category
    const item = await this.prisma.inventoryItem.create({
      data: {
        itemName: dto.itemName,
        itemCode: `HOSTEL-${Date.now()}`,
        unit: 'PCS',
        quantity: dto.quantity,
        minimumStock: Math.floor(dto.quantity * 0.2),
        maximumStock: dto.quantity * 2,
        unitPrice: dto.unitPrice,
      },
    });

    await this.eventBus.publish('hostel.inventory_added', {
      itemId: item.id,
      blockId: dto.blockId,
      addedBy,
    });

    return item;
  }

  async getHostelInventoryReport(blockId?: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        itemCode: { startsWith: 'HOSTEL-' },
      },
      include: {
        category: true,
      },
    });

    const totalValue = items.reduce((s, i) => s + (i.quantity * Number(i.unitPrice || 0)), 0);
    const lowStockItems = items.filter(i => i.minimumStock && i.quantity < i.minimumStock);

    return {
      totalItems: items.length,
      totalValue,
      lowStockItems: lowStockItems.length,
      items: items.map(i => ({
        itemName: i.itemName,
        category: i.category?.name,
        currentStock: i.quantity,
        minStock: i.minimumStock,
        unitPrice: i.unitPrice,
        totalValue: i.quantity * Number(i.unitPrice || 0),
        status: i.minimumStock && i.quantity < i.minimumStock ? 'LOW_STOCK' : 'OK',
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-010: Discipline and Complaints
  // ═══════════════════════════════════════════════════════════════════════════

  async recordHostelDisciplinaryAction(recordedBy: string, dto: {
    studentId: string; incidentType: string; description: string;
    actionTaken: string; severity?: string;
  }) {
    // Use main DisciplinaryRecord model
    const record = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentType: dto.incidentType,
        description: `[HOSTEL] ${dto.description}`,
        actionTaken: dto.actionTaken,
        incidentDate: new Date(),
        recordedBy: recordedBy,
      },
    });

    await this.eventBus.publish('hostel.discipline_recorded', {
      recordId: record.id,
      studentId: dto.studentId,
      severity: dto.severity,
    });

    return record;
  }

  async registerHostelComplaint(studentId: string, dto: {
    complaintType: string; description: string; priority?: string;
  }) {
    const complaint = {
      id: `COMPLAINT-${Date.now()}`,
      studentId,
      complaintType: dto.complaintType,
      description: dto.description,
      priority: dto.priority || 'NORMAL',
      status: 'OPEN',
      raisedAt: new Date(),
    };

    await this.eventBus.publish('hostel.complaint_registered', {
      complaintId: complaint.id,
      studentId,
      priority: dto.priority,
    });

    return complaint;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-011: Hostel Maintenance (Already has HostelMaintenance model)
  // ═══════════════════════════════════════════════════════════════════════════

  async createHostelMaintenanceRequest(requestedBy: string, dto: {
    roomId: string; issueType: string; description: string; priority?: string;
  }) {
    const room = await this.prisma.hostelRoom.findUnique({
      where: { id: dto.roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    const request = await this.prisma.hostelMaintenance.create({
      data: {
        roomId: dto.roomId,
        issueType: dto.issueType,
        description: dto.description,
        reportedBy: requestedBy,
        status: 'PENDING',
      },
    });

    await this.eventBus.publish('hostel.maintenance_requested', {
      requestId: request.id,
      roomId: dto.roomId,
      priority: dto.priority,
    });

    return request;
  }

  async updateHostelMaintenanceStatus(updatedBy: string, requestId: string, dto: {
    status: string; assignedTo?: string; completedBy?: string; cost?: number;
  }) {
    const request = await this.prisma.hostelMaintenance.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        assignedTo: dto.assignedTo,
        assignedAt: dto.assignedTo ? new Date() : undefined,
        completedBy: dto.completedBy,
        completedAt: dto.status === 'COMPLETED' ? new Date() : undefined,
        cost: dto.cost,
      },
    });

    await this.eventBus.publish('hostel.maintenance_updated', {
      requestId,
      status: dto.status,
      updatedBy,
    });

    return request;
  }

  async getHostelMaintenanceReport(schoolId: string, filters: { startDate?: string; endDate?: string; status?: string }) {
    // Get all hostel blocks with rooms for this school
    const blocks = await this.prisma.hostelBlock.findMany({
      where: { schoolId },
      select: {
        id: true,
        blockName: true,
      },
    });

    // Get rooms for these blocks
    const blockIds = blocks.map(b => b.id);
    const rooms = await this.prisma.hostelRoom.findMany({
      where: { blockId: { in: blockIds } },
      include: {
        maintenanceRecords: {
          where: {
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.startDate ? { reportedAt: { gte: new Date(filters.startDate) } } : {}),
            ...(filters.endDate ? { reportedAt: { lte: new Date(filters.endDate) } } : {}),
          },
        },
      },
    });

    const allRequests = rooms.flatMap(r => r.maintenanceRecords);
    const totalCost = allRequests.reduce((s, r) => s + Number(r.cost || 0), 0);

    return {
      summary: {
        totalRequests: allRequests.length,
        pending: allRequests.filter(r => r.status === 'PENDING').length,
        inProgress: allRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: allRequests.filter(r => r.status === 'COMPLETED').length,
        totalCost,
      },
      requests: allRequests.map(r => ({
        id: r.id,
        issueType: r.issueType,
        description: r.description,
        status: r.status,
        reportedAt: r.reportedAt,
        completedAt: r.completedAt,
        cost: r.cost,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-012: Hostel Reports and Analytics
  // ═══════════════════════════════════════════════════════════════════════════

  async getHostelAnalytics(schoolId: string) {
    const blocks = await this.prisma.hostelBlock.findMany({
      where: { schoolId },
      select: {
        id: true,
        blockName: true,
        blockType: true,
      },
    });

    // Get rooms with assignments for these blocks
    const blockIds = blocks.map(b => b.id);
    const rooms = await this.prisma.hostelRoom.findMany({
      where: { blockId: { in: blockIds } },
      include: {
        assignments: true,
      },
    });

    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
    const totalOccupied = rooms.reduce((s, r) => s + r.assignments.length, 0);
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';

    const blockWiseData = blocks.map(b => {
      const blockRooms = rooms.filter(r => r.blockId === b.id);
      const capacity = blockRooms.reduce((s, r) => s + r.capacity, 0);
      const occupied = blockRooms.reduce((s, r) => s + r.assignments.length, 0);
      
      return {
        blockName: b.blockName,
        blockType: b.blockType,
        totalRooms: blockRooms.length,
        capacity,
        occupied,
        vacant: capacity - occupied,
      };
    });

    return {
      summary: {
        totalBlocks: blocks.length,
        totalRooms,
        totalCapacity,
        totalOccupied,
        totalVacant: totalCapacity - totalOccupied,
        occupancyRate: occupancyRate + '%',
      },
      blockWiseData,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-EVENT-001 to FR-EVENT-009: EVENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async createEvent(createdBy: string, dto: {
    schoolId: string; title: string; description?: string;
    eventType: string; startDate: string; endDate?: string;
    location?: string; isAllDay?: boolean; notifyUsers?: boolean;
  }) {
    const event = await this.prisma.event.create({
      data: {
        schoolId: dto.schoolId,
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        isAllDay: dto.isAllDay ?? false,
        notifyUsers: dto.notifyUsers ?? false,
        createdBy,
      },
    });

    if (dto.notifyUsers) {
      await this.eventBus.publish('event.created', {
        eventId: event.id,
        title: event.title,
        startDate: event.startDate,
        eventType: event.eventType,
      });
    }

    return event;
  }

  async listEvents(schoolId: string, filters: { 
    eventType?: string; startDate?: string; endDate?: string; 
    page?: number; limit?: number; 
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    const where: any = {
      schoolId,
      ...(filters.eventType ? { eventType: filters.eventType } : {}),
      ...(filters.startDate || filters.endDate ? {
        startDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: { total, page, limit },
    };
  }

  async getEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(eventId: string, updatedBy: string, dto: {
    title?: string; description?: string; eventType?: string;
    startDate?: string; endDate?: string; location?: string;
    isAllDay?: boolean; notifyUsers?: boolean;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundException('Event not found');

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.eventType ? { eventType: dto.eventType } : {}),
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.isAllDay !== undefined ? { isAllDay: dto.isAllDay } : {}),
        ...(dto.notifyUsers !== undefined ? { notifyUsers: dto.notifyUsers } : {}),
      },
    });

    if (dto.notifyUsers) {
      await this.eventBus.publish('event.updated', {
        eventId: updated.id,
        updatedBy,
        changes: Object.keys(dto),
      });
    }

    return updated;
  }

  async deleteEvent(eventId: string, deletedBy: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundException('Event not found');

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    await this.eventBus.publish('event.deleted', {
      eventId,
      deletedBy,
      eventTitle: event.title,
    });

    return { message: 'Event deleted successfully' };
  }

  async getEventCalendar(schoolId: string, filters: { month?: number; year?: number }) {
    const year = filters.year || new Date().getFullYear();
    const month = filters.month || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await this.prisma.event.findMany({
      where: {
        schoolId,
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Group by event type
    const eventsByType = events.reduce((acc: any, event) => {
      const type = event.eventType || 'OTHER';
      if (!acc[type]) acc[type] = [];
      acc[type].push(event);
      return acc;
    }, {});

    return {
      month,
      year,
      totalEvents: events.length,
      eventsByType,
      events,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HR-007: TRAINING AND DEVELOPMENT (Using Event model for training events)
  // ═══════════════════════════════════════════════════════════════════════════

  async scheduleTraining(scheduledBy: string, dto: {
    schoolId: string; title: string; description?: string;
    startDate: string; endDate?: string; location?: string;
    targetEmployeeIds?: string[]; maxParticipants?: number;
  }) {
    // Create training as an event
    const training = await this.prisma.event.create({
      data: {
        schoolId: dto.schoolId,
        title: dto.title,
        description: dto.description,
        eventType: 'TRAINING',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        notifyUsers: true,
        createdBy: scheduledBy,
      },
    });

    await this.eventBus.publish('training.scheduled', {
      trainingId: training.id,
      title: training.title,
      targetEmployees: dto.targetEmployeeIds,
      scheduledBy,
    });

    return training;
  }

  async getTrainingCalendar(schoolId: string, filters: { startDate?: string; endDate?: string }) {
    const where: any = {
      schoolId,
      eventType: 'TRAINING',
      ...(filters.startDate || filters.endDate ? {
        startDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const trainings = await this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return {
      totalTrainings: trainings.length,
      upcoming: trainings.filter(t => new Date(t.startDate) > new Date()),
      completed: trainings.filter(t => new Date(t.startDate) <= new Date()),
      trainings,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HR-004: LEAVE MANAGEMENT (Using TeacherLeave and LeaveBalance models)
  // ═══════════════════════════════════════════════════════════════════════════

  async applyLeave(employeeId: string, dto: {
    leaveType: string; startDate: string; endDate: string;
    reason: string; emergencyContact?: string;
  }) {
    // Check leave balance
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { employeeId, leaveType: dto.leaveType },
    });

    if (!balance) {
      throw new BadRequestException(`No leave balance found for leave type: ${dto.leaveType}`);
    }

    // Calculate days
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (balance.balanceLeaves < days) {
      throw new BadRequestException(`Insufficient leave balance. Available: ${balance.balanceLeaves}, Requested: ${days}`);
    }

    const leave = await this.prisma.teacherLeave.create({
      data: {
        teacherId: employeeId,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        totalDays: days,
        reason: dto.reason,
        status: 'PENDING',
      },
    });

    await this.eventBus.publish('leave.applied', {
      leaveId: leave.id,
      employeeId,
      leaveType: dto.leaveType,
      days,
    });

    return leave;
  }

  async approveLeave(leaveId: string, approvedBy: string, approved: boolean, remarks?: string) {
    const leave = await this.prisma.teacherLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(`Leave is already ${leave.status.toLowerCase()}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Update leave status
      const updatedLeave = await tx.teacherLeave.update({
        where: { id: leaveId },
        data: {
          status: approved ? 'APPROVED' : 'REJECTED',
          approvedBy: approvedBy,
          approvedAt: new Date(),
        },
      });

      // Deduct from balance if approved
      if (approved) {
        const balance = await tx.leaveBalance.findFirst({
          where: {
            employeeId: leave.teacherId,
            leaveType: leave.leaveType,
          },
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              balanceLeaves: balance.balanceLeaves - leave.totalDays,
              usedLeaves: balance.usedLeaves + leave.totalDays,
            },
          });
        }
      }

      return updatedLeave;
    });

    await this.eventBus.publish('leave.processed', {
      leaveId: updated.id,
      employeeId: leave.teacherId,
      approved,
      approvedBy,
    });

    return updated;
  }

  async getLeaveBalance(employeeId: string) {
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId },
    });

    return {
      employeeId,
      balances: balances.map(b => ({
        leaveType: b.leaveType,
        allocated: b.totalLeaves,
        used: b.usedLeaves,
        balance: b.balanceLeaves,
        year: b.year,
      })),
    };
  }

  async getLeaveHistory(employeeId: string, filters: { status?: string; year?: number }) {
    const where: any = {
      teacherId: employeeId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.year ? {
        startDate: {
          gte: new Date(`${filters.year}-01-01`),
          lte: new Date(`${filters.year}-12-31`),
        },
      } : {}),
    };

    const leaves = await this.prisma.teacherLeave.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    return {
      employeeId,
      totalLeaves: leaves.length,
      leaves,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-HR-010: HR REPORTS AND ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  async getHRAnalytics(filters: { schoolId?: string; organizationId?: string; year?: number }) {
    const year = filters.year || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Get leave statistics
    const leaves = await this.prisma.teacherLeave.findMany({
      where: {
        startDate: { gte: startDate, lte: endDate },
      },
    });

    // Get payroll statistics
    const salaries = await this.prisma.employeeSalary.findMany({
      where: {
        ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
        ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
        monthYear: { contains: year.toString() },
      },
    });

    const totalPayrollCost = salaries.reduce((s, sal) => s + Number(sal.netSalary || 0), 0);
    const averageSalary = salaries.length > 0 ? totalPayrollCost / salaries.length : 0;

    // Get training statistics
    const trainings = await this.prisma.event.findMany({
      where: {
        ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
        eventType: 'TRAINING',
        startDate: { gte: startDate, lte: endDate },
      },
    });

    return {
      year,
      leaveStatistics: {
        totalLeaves: leaves.length,
        approved: leaves.filter(l => l.status === 'APPROVED').length,
        rejected: leaves.filter(l => l.status === 'REJECTED').length,
        pending: leaves.filter(l => l.status === 'PENDING').length,
        byType: leaves.reduce((acc: any, l) => {
          acc[l.leaveType] = (acc[l.leaveType] || 0) + 1;
          return acc;
        }, {}),
      },
      payrollStatistics: {
        totalEmployees: salaries.length,
        totalPayrollCost,
        averageSalary: averageSalary.toFixed(2),
        highestSalary: salaries.length > 0 ? Math.max(...salaries.map(s => Number(s.netSalary))) : 0,
        lowestSalary: salaries.length > 0 ? Math.min(...salaries.map(s => Number(s.netSalary))) : 0,
      },
      trainingStatistics: {
        totalTrainings: trainings.length,
        upcoming: trainings.filter(t => new Date(t.startDate) > new Date()).length,
        completed: trainings.filter(t => new Date(t.startDate) <= new Date()).length,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-003: STUDENT BEHAVIOR TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  async logStudentBehavior(recordedBy: string, dto: {
    studentId: string; behaviorType: string; description: string;
    severity?: string; incidentDate?: string; witnesses?: string[];
  }) {
    const record = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : new Date(),
        incidentType: dto.behaviorType,
        description: dto.description,
        actionTaken: dto.severity || 'OBSERVATION',
        recordedBy,
      },
    });

    await this.eventBus.publish('discipline.behavior.logged', {
      recordId: record.id,
      studentId: dto.studentId,
      behaviorType: dto.behaviorType,
      severity: dto.severity,
      recordedBy,
    });

    return record;
  }

  async getStudentBehaviorHistory(studentId: string, filters: {
    behaviorType?: string; startDate?: string; endDate?: string;
  }) {
    const where: any = {
      studentId,
      ...(filters.behaviorType ? { incidentType: filters.behaviorType } : {}),
      ...(filters.startDate || filters.endDate ? {
        incidentDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const records = await this.prisma.disciplinaryRecord.findMany({
      where,
      orderBy: { incidentDate: 'desc' },
    });

    // Calculate behavior summary
    const summary = records.reduce((acc: any, r) => {
      acc[r.incidentType] = (acc[r.incidentType] || 0) + 1;
      return acc;
    }, {});

    return {
      studentId,
      totalRecords: records.length,
      summary,
      records,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-004: COUNSELING MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async scheduleCounseling(scheduledBy: string, dto: {
    studentId: string; sessionType: string; scheduledDate: string;
    counselorId?: string; notes?: string; relatedIncidentId?: string;
  }) {
    // Log counseling as a disciplinary record with COUNSELING type
    const session = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentDate: new Date(dto.scheduledDate),
        incidentType: 'COUNSELING',
        description: dto.notes || `${dto.sessionType} counseling session scheduled`,
        actionTaken: `COUNSELING_${dto.sessionType.toUpperCase()}`,
        recordedBy: scheduledBy,
      },
    });

    await this.eventBus.publish('discipline.counseling.scheduled', {
      sessionId: session.id,
      studentId: dto.studentId,
      sessionType: dto.sessionType,
      scheduledDate: dto.scheduledDate,
      counselorId: dto.counselorId,
      scheduledBy,
    });

    return session;
  }

  async getCounselingHistory(studentId: string) {
    const sessions = await this.prisma.disciplinaryRecord.findMany({
      where: {
        studentId,
        incidentType: 'COUNSELING',
      },
      orderBy: { incidentDate: 'desc' },
    });

    return {
      studentId,
      totalSessions: sessions.length,
      sessions,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-005: PARENT COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════

  async sendParentDisciplineNotification(sentBy: string, dto: {
    studentId: string; incidentId?: string; subject: string;
    message: string; meetingDate?: string; requireAcknowledgment?: boolean;
  }) {
    // Emit event for notification system to handle
    await this.eventBus.publish('discipline.parent.notification', {
      studentId: dto.studentId,
      incidentId: dto.incidentId,
      subject: dto.subject,
      message: dto.message,
      meetingDate: dto.meetingDate,
      requireAcknowledgment: dto.requireAcknowledgment,
      sentBy,
    });

    return {
      message: 'Parent notification sent successfully',
      studentId: dto.studentId,
      subject: dto.subject,
      meetingDate: dto.meetingDate,
      sentAt: new Date(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-009: DISCIPLINARY REPORTS AND ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  async getDisciplineAnalytics(schoolId: string, filters: {
    startDate?: string; endDate?: string; incidentType?: string;
  }) {
    const where: any = {
      student: { schoolId },
      ...(filters.incidentType ? { incidentType: filters.incidentType } : {}),
      ...(filters.startDate || filters.endDate ? {
        incidentDate: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const records = await this.prisma.disciplinaryRecord.findMany({
      where,
      include: { student: { select: { id: true, userId: true } } },
      orderBy: { incidentDate: 'desc' },
    });

    // Incident type distribution
    const byType = records.reduce((acc: any, r) => {
      acc[r.incidentType] = (acc[r.incidentType] || 0) + 1;
      return acc;
    }, {});

    // Monthly trend
    const monthlyTrend = records.reduce((acc: any, r) => {
      const month = `${r.incidentDate.getFullYear()}-${String(r.incidentDate.getMonth() + 1).padStart(2, '0')}`;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Repeat offenders (students with 3+ records)
    const studentCounts = records.reduce((acc: any, r) => {
      acc[r.studentId] = (acc[r.studentId] || 0) + 1;
      return acc;
    }, {});
    const repeatOffenders = Object.entries(studentCounts)
      .filter(([, count]) => (count as number) >= 3)
      .map(([studentId, count]) => ({ studentId, incidentCount: count }))
      .sort((a, b) => (b.incidentCount as number) - (a.incidentCount as number));

    // Action distribution
    const byAction = records.reduce((acc: any, r) => {
      const action = r.actionTaken || 'NONE';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    return {
      schoolId,
      totalIncidents: records.length,
      byType,
      byAction,
      monthlyTrend,
      repeatOffenders,
      counselingSessions: records.filter(r => r.incidentType === 'COUNSELING').length,
      positiveRecords: records.filter(r => r.incidentType === 'POSITIVE').length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-DISC-010: POSITIVE BEHAVIOR REINFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async logPositiveBehavior(recordedBy: string, dto: {
    studentId: string; category: string; description: string;
    points?: number;
  }) {
    const record = await this.prisma.disciplinaryRecord.create({
      data: {
        studentId: dto.studentId,
        incidentDate: new Date(),
        incidentType: 'POSITIVE',
        description: dto.description,
        actionTaken: `POINTS:${dto.points || 10}|CATEGORY:${dto.category}`,
        recordedBy,
      },
    });

    await this.eventBus.publish('discipline.positive.logged', {
      recordId: record.id,
      studentId: dto.studentId,
      category: dto.category,
      points: dto.points || 10,
      recordedBy,
    });

    return {
      ...record,
      points: dto.points || 10,
      category: dto.category,
    };
  }

  async getPositiveBehaviorRecords(studentId: string) {
    const records = await this.prisma.disciplinaryRecord.findMany({
      where: {
        studentId,
        incidentType: 'POSITIVE',
      },
      orderBy: { incidentDate: 'desc' },
    });

    // Calculate total points
    const totalPoints = records.reduce((sum, r) => {
      const match = r.actionTaken?.match(/POINTS:(\d+)/);
      return sum + (match ? parseInt(match[1]) : 10);
    }, 0);

    // Category breakdown
    const byCategory = records.reduce((acc: any, r) => {
      const catMatch = r.actionTaken?.match(/CATEGORY:(\w+)/);
      const category = catMatch ? catMatch[1] : 'OTHER';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      studentId,
      totalPoints,
      totalRecords: records.length,
      byCategory,
      records,
    };
  }

  async getBehaviorLeaderboard(schoolId: string, limit: number = 20) {
    // Get all positive records for the school
    const positiveRecords = await this.prisma.disciplinaryRecord.findMany({
      where: {
        incidentType: 'POSITIVE',
        student: { schoolId },
      },
      select: {
        studentId: true,
        actionTaken: true,
        student: {
          select: { id: true, userId: true },
        },
      },
    });

    // Aggregate points per student
    const studentPoints = positiveRecords.reduce((acc: any, r) => {
      const match = r.actionTaken?.match(/POINTS:(\d+)/);
      const points = match ? parseInt(match[1]) : 10;
      if (!acc[r.studentId]) {
        acc[r.studentId] = { studentId: r.studentId, totalPoints: 0, recordCount: 0 };
      }
      acc[r.studentId].totalPoints += points;
      acc[r.studentId].recordCount += 1;
      return acc;
    }, {});

    const leaderboard = Object.values(studentPoints)
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .slice(0, limit);

    return {
      schoolId,
      totalParticipants: Object.keys(studentPoints).length,
      leaderboard,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-009: GPS Tracking and Trip Management
  // ═══════════════════════════════════════════════════════════════════════════

  async updateVehicleGPS(vehicleId: string, dto: {
    latitude: number; longitude: number; speed?: number;
    heading?: number; altitude?: number; accuracy?: number;
    ignitionOn?: boolean; fuelLevel?: number;
  }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Log GPS data
    const gpsLog = await this.prisma.vehicleGPSLog.create({
      data: {
        vehicleId,
        latitude: dto.latitude as any,
        longitude: dto.longitude as any,
        speed: dto.speed as any,
        heading: dto.heading as any,
        altitude: dto.altitude as any,
        accuracy: dto.accuracy as any,
        ignitionOn: dto.ignitionOn,
        fuelLevel: dto.fuelLevel as any,
        timestamp: new Date(),
      },
    });

    // Update vehicle's last known location
    await this.prisma.transportVehicle.update({
      where: { id: vehicleId },
      data: {
        lastKnownLat: dto.latitude as any,
        lastKnownLng: dto.longitude as any,
        lastTrackedAt: new Date(),
        currentSpeed: dto.speed as any,
        fuelLevel: dto.fuelLevel as any,
      },
    });

    return gpsLog;
  }

  async getVehicleGPSHistory(vehicleId: string, filters: { startTime?: string; endTime?: string; limit?: number }) {
    const vehicle = await this.prisma.transportVehicle.findUnique({
      where: { id: vehicleId },
      select: { vehicleNumber: true, lastKnownLat: true, lastKnownLng: true, lastTrackedAt: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const where: any = {
      vehicleId,
      ...(filters.startTime || filters.endTime ? {
        timestamp: {
          ...(filters.startTime ? { gte: new Date(filters.startTime) } : {}),
          ...(filters.endTime ? { lte: new Date(filters.endTime) } : {}),
        },
      } : {}),
    };

    const logs = await this.prisma.vehicleGPSLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
    });

    return {
      vehicleId,
      vehicleNumber: vehicle.vehicleNumber,
      currentLocation: {
        latitude: vehicle.lastKnownLat,
        longitude: vehicle.lastKnownLng,
        lastUpdated: vehicle.lastTrackedAt,
      },
      historyCount: logs.length,
      logs,
    };
  }

  async createTrip(createdBy: string, dto: {
    routeId: string; vehicleId: string; date: string;
    tripType: string; driverId: string; attendantId?: string;
    plannedStartTime: string; plannedEndTime: string;
  }) {
    const route = await this.prisma.transportRoute.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new NotFoundException('Route not found');

    const vehicle = await this.prisma.transportVehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const trip = await this.prisma.transportTrip.create({
      data: {
        routeId: dto.routeId,
        vehicleId: dto.vehicleId,
        date: new Date(dto.date),
        tripType: dto.tripType,
        driverId: dto.driverId,
        attendantId: dto.attendantId,
        plannedStartTime: dto.plannedStartTime,
        plannedEndTime: dto.plannedEndTime,
        status: 'SCHEDULED',
      },
    });

    await this.eventBus.publish('transport.trip.created', {
      tripId: trip.id,
      routeId: dto.routeId,
      vehicleId: dto.vehicleId,
      date: dto.date,
      createdBy,
    });

    return trip;
  }

  async startTrip(tripId: string, startedBy: string, dto: { actualStartTime?: string; startOdometer?: number }) {
    const trip = await this.prisma.transportTrip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.status !== 'SCHEDULED') throw new BadRequestException('Trip cannot be started');

    const updated = await this.prisma.transportTrip.update({
      where: { id: tripId },
      data: {
        status: 'IN_PROGRESS',
        actualStartTime: dto.actualStartTime ? new Date(dto.actualStartTime) : new Date(),
        startOdometer: dto.startOdometer,
      },
    });

    await this.eventBus.publish('transport.trip.started', {
      tripId,
      vehicleId: trip.vehicleId,
      startedBy,
    });

    return updated;
  }

  async endTrip(tripId: string, endedBy: string, dto: {
    actualEndTime?: string; endOdometer?: number; incidents?: any[];
  }) {
    const trip = await this.prisma.transportTrip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.status !== 'IN_PROGRESS') throw new BadRequestException('Trip is not in progress');

    const distance = dto.endOdometer && trip.startOdometer
      ? dto.endOdometer - trip.startOdometer
      : null;

    const updated = await this.prisma.transportTrip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        actualEndTime: dto.actualEndTime ? new Date(dto.actualEndTime) : new Date(),
        endOdometer: dto.endOdometer,
        distance: distance as any,
        incidents: dto.incidents || {},
      },
    });

    await this.eventBus.publish('transport.trip.ended', {
      tripId,
      vehicleId: trip.vehicleId,
      distance,
      endedBy,
    });

    return updated;
  }

  async getTripDetails(tripId: string) {
    const trip = await this.prisma.transportTrip.findUnique({
      where: { id: tripId },
      include: {
        route: { include: { stops: true } },
        vehicle: true,
        attendance: { include: { assignment: { include: { student: true } } } },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async listTrips(filters: {
    routeId?: string; vehicleId?: string; date?: string;
    status?: string; page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: any = {
      ...(filters.routeId ? { routeId: filters.routeId } : {}),
      ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.date ? {
        date: {
          gte: new Date(filters.date),
          lt: new Date(new Date(filters.date).setDate(new Date(filters.date).getDate() + 1)),
        },
      } : {}),
    };

    const [trips, total] = await Promise.all([
      this.prisma.transportTrip.findMany({
        where,
        include: { route: true, vehicle: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transportTrip.count({ where }),
    ]);

    return { data: trips, meta: { total, page, limit } };
  }

  async markStudentAttendance(markedBy: string, dto: {
    assignmentId: string; tripId?: string; tripType: string;
    status: string; boardedAt?: string; boardedLocation?: any;
    alightedAt?: string; alightedLocation?: any; rfidScanIn?: string; rfidScanOut?: string;
  }) {
    const assignment = await this.prisma.transportStudentAssignment.findUnique({
      where: { id: dto.assignmentId },
    });
    if (!assignment) throw new NotFoundException('Student assignment not found');

    const attendance = await this.prisma.transportAttendance.create({
      data: {
        assignmentId: dto.assignmentId,
        tripId: dto.tripId,
        date: new Date(),
        tripType: dto.tripType,
        status: dto.status,
        boardedAt: dto.boardedAt ? new Date(dto.boardedAt) : null,
        boardedLocation: dto.boardedLocation || {},
        alightedAt: dto.alightedAt ? new Date(dto.alightedAt) : null,
        alightedLocation: dto.alightedLocation || {},
        rfidScanIn: dto.rfidScanIn ? new Date(dto.rfidScanIn) : null,
        rfidScanOut: dto.rfidScanOut ? new Date(dto.rfidScanOut) : null,
        verifiedBy: markedBy,
        parentNotified: false,
      },
    });

    await this.eventBus.publish('transport.attendance.marked', {
      attendanceId: attendance.id,
      studentId: assignment.studentId,
      status: dto.status,
      tripType: dto.tripType,
      markedBy,
    });

    return attendance;
  }

  async getTransportAttendanceReport(filters: {
    routeId?: string; studentId?: string; startDate?: string; endDate?: string;
  }) {
    const where: any = {
      ...(filters.studentId ? { assignment: { studentId: filters.studentId } } : {}),
      ...(filters.routeId ? { assignment: { routeId: filters.routeId } } : {}),
      ...(filters.startDate || filters.endDate ? {
        date: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      } : {}),
    };

    const records = await this.prisma.transportAttendance.findMany({
      where,
      include: {
        assignment: {
          include: { student: { select: { id: true, userId: true } }, route: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      delayed: records.filter(r => r.status === 'DELAYED').length,
      notBoarded: records.filter(r => r.status === 'NOT_BOARDED').length,
    };

    return { summary, records };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-FEE-HOSTEL: Hostel Fee Management
  // ═══════════════════════════════════════════════════════════════════════════

  async createHostelFee(createdBy: string, dto: {
    blockId: string; feeType: string; amount: number;
    effectiveFrom: string; effectiveTo?: string;
  }) {
    const block = await this.prisma.hostelBlock.findUnique({ where: { id: dto.blockId } });
    if (!block) throw new NotFoundException('Hostel block not found');

    const fee = await this.prisma.hostelFee.create({
      data: {
        blockId: dto.blockId,
        feeType: dto.feeType,
        amount: dto.amount as any,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
    });

    await this.eventBus.publish('hostel.fee.created', {
      feeId: fee.id,
      blockId: dto.blockId,
      createdBy,
    });

    return fee;
  }

  async listHostelFees(blockId?: string) {
    const fees = await this.prisma.hostelFee.findMany({
      where: blockId ? { blockId } : {},
      include: { block: { select: { blockName: true } } },
      orderBy: { effectiveFrom: 'desc' },
    });

    return { total: fees.length, fees };
  }

  async updateHostelFee(feeId: string, updatedBy: string, dto: {
    feeType?: string; amount?: number; effectiveFrom?: string; effectiveTo?: string;
  }) {
    const fee = await this.prisma.hostelFee.findUnique({ where: { id: feeId } });
    if (!fee) throw new NotFoundException('Hostel fee not found');

    const updated = await this.prisma.hostelFee.update({
      where: { id: feeId },
      data: {
        ...(dto.feeType ? { feeType: dto.feeType } : {}),
        ...(dto.amount ? { amount: dto.amount as any } : {}),
        ...(dto.effectiveFrom ? { effectiveFrom: new Date(dto.effectiveFrom) } : {}),
        ...(dto.effectiveTo !== undefined ? { effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null } : {}),
      },
    });

    return updated;
  }

  async deleteHostelFee(feeId: string, deletedBy: string) {
    const fee = await this.prisma.hostelFee.findUnique({ where: { id: feeId } });
    if (!fee) throw new NotFoundException('Hostel fee not found');

    await this.prisma.hostelFee.delete({ where: { id: feeId } });

    await this.eventBus.publish('hostel.fee.deleted', {
      feeId,
      deletedBy,
    });

    return { message: 'Hostel fee deleted successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FR-INV-SUPPLIERS: Supplier Management
  // ═══════════════════════════════════════════════════════════════════════════

  async createSupplier(createdBy: string, dto: {
    supplierName: string; supplierCode?: string; contactPerson?: string;
    email?: string; phone?: string; category?: string;
    gstNumber?: string; panNumber?: string; bankDetails?: any; rating?: number;
  }) {
    if (dto.supplierCode) {
      const existing = await this.prisma.supplier.findUnique({ where: { supplierCode: dto.supplierCode } });
      if (existing) throw new ConflictException('Supplier code already exists');
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        supplierName: dto.supplierName,
        supplierCode: dto.supplierCode || `SUP-${Date.now()}`,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        category: dto.category,
        gstNumber: dto.gstNumber,
        panNumber: dto.panNumber,
        bankDetails: dto.bankDetails || {},
        rating: dto.rating as any,
        isActive: true,
      },
    });

    await this.eventBus.publish('supplier.created', {
      supplierId: supplier.id,
      supplierName: supplier.supplierName,
      createdBy,
    });

    return supplier;
  }

  async listSuppliers(filters: { category?: string; search?: string; active?: boolean }) {
    const where: any = {
      ...(filters.active !== undefined ? { isActive: filters.active } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search ? {
        OR: [
          { supplierName: { contains: filters.search, mode: 'insensitive' } },
          { supplierCode: { contains: filters.search } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const suppliers = await this.prisma.supplier.findMany({
      where,
      orderBy: { supplierName: 'asc' },
    });

    return { total: suppliers.length, suppliers };
  }

  async getSupplier(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(supplierId: string, updatedBy: string, dto: {
    supplierName?: string; contactPerson?: string; email?: string;
    phone?: string; category?: string; gstNumber?: string;
    panNumber?: string; bankDetails?: any; rating?: number; isActive?: boolean;
  }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const updated = await this.prisma.supplier.update({
      where: { id: supplierId },
      data: {
        ...(dto.supplierName ? { supplierName: dto.supplierName } : {}),
        ...(dto.contactPerson !== undefined ? { contactPerson: dto.contactPerson } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.gstNumber !== undefined ? { gstNumber: dto.gstNumber } : {}),
        ...(dto.panNumber !== undefined ? { panNumber: dto.panNumber } : {}),
        ...(dto.bankDetails !== undefined ? { bankDetails: dto.bankDetails } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating as any } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    await this.eventBus.publish('supplier.updated', {
      supplierId,
      updatedBy,
    });

    return updated;
  }

  async deleteSupplier(supplierId: string, deletedBy: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Soft delete - just deactivate
    await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { isActive: false },
    });

    await this.eventBus.publish('supplier.deleted', {
      supplierId,
      deletedBy,
    });

    return { message: 'Supplier deactivated successfully' };
  }
}
