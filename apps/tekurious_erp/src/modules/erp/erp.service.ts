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
}
