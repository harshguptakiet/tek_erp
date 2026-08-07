import { apiClient } from '../lib/axios';

// Academic Service - Complete integration with backend API
export const academicService = {
  // ==================== BOARDS ====================
  createBoard: async (data: {
    name: string;
    abbreviation: string;
    country?: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/academic/boards', data);
    return response.data;
  },

  listBoards: async () => {
    const response = await apiClient.get('/academic/boards');
    return response.data;
  },

  // ==================== SUBJECTS ====================
  createSubject: async (data: {
    name: string;
    code: string;
    grade?: number;
    description?: string;
  }) => {
    const response = await apiClient.post('/academic/subjects', data);
    return response.data;
  },

  listSubjects: async (grade?: number) => {
    const response = await apiClient.get('/academic/subjects', {
      params: grade ? { grade } : {},
    });
    return response.data;
  },

  // ==================== SCHOOLS ====================
  createSchool: async (data: {
    organizationId: string;
    name: string;
    code: string;
    affiliationNumber?: string;
    boardId?: string;
    address?: any;
  }) => {
    const response = await apiClient.post('/academic/schools', data);
    return response.data;
  },

  listSchools: async (organizationId?: string) => {
    const response = await apiClient.get('/academic/schools', {
      params: organizationId ? { organizationId } : {},
    });
    return response.data;
  },

  getSchool: async (id: string) => {
    const response = await apiClient.get(`/academic/schools/${id}`);
    return response.data;
  },

  // ==================== ACADEMIC YEARS ====================
  createAcademicYear: async (data: {
    schoolId: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }) => {
    const response = await apiClient.post('/academic/academic-years', data);
    return response.data;
  },

  listAcademicYears: async (schoolId: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/academic-years`);
    return response.data;
  },

  // ==================== CLASSES ====================
  createClass: async (data: {
    schoolId: string;
    name: string;
    grade: number;
    academicYearId: string;
  }) => {
    const response = await apiClient.post('/academic/classes', data);
    return response.data;
  },

  createSection: async (data: {
    classId: string;
    name: string;
    maxStudents?: number;
    classTeacherId?: string;
  }) => {
    const response = await apiClient.post('/academic/sections', data);
    return response.data;
  },

  getClassStructure: async (schoolId: string, academicYearId?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/classes`, {
      params: academicYearId ? { academicYearId } : {},
    });
    return response.data;
  },

  // ==================== ENROLLMENTS ====================
  enrollStudent: async (data: {
    studentId: string;
    sectionId: string;
    academicYearId: string;
    rollNumber?: string;
  }) => {
    const response = await apiClient.post('/academic/enrollments', data);
    return response.data;
  },

  listEnrollments: async (sectionId: string) => {
    const response = await apiClient.get(`/academic/sections/${sectionId}/enrollments`);
    return response.data;
  },

  // ==================== TEACHERS ====================
  assignTeacher: async (sectionId: string, data: {
    teacherId: string;
    subjectId?: string;
    role: string;
  }) => {
    const response = await apiClient.post(`/academic/sections/${sectionId}/teachers`, data);
    return response.data;
  },

  listSectionTeachers: async (sectionId: string) => {
    const response = await apiClient.get(`/academic/sections/${sectionId}/teachers`);
    return response.data;
  },

  // ==================== STUDENT GROUPS ====================
  createStudentGroup: async (schoolId: string, data: {
    name: string;
    groupType: string;
    color?: string;
    description?: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/groups`, data);
    return response.data;
  },

  listStudentGroups: async (schoolId: string, groupType?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/groups`, {
      params: groupType ? { groupType } : {},
    });
    return response.data;
  },

  assignStudentToGroup: async (groupId: string, data: {
    studentId: string;
    position?: string;
  }) => {
    const response = await apiClient.post(`/academic/groups/${groupId}/students`, data);
    return response.data;
  },

  awardGroupPoints: async (data: {
    groupId: string;
    points: number;
    reason: string;
  }) => {
    const response = await apiClient.post('/academic/groups/points', data);
    return response.data;
  },

  getGroupLeaderboard: async (groupId: string) => {
    const response = await apiClient.get(`/academic/groups/${groupId}/leaderboard`);
    return response.data;
  },

  // ==================== ACADEMIC EVENTS ====================
  createAcademicEvent: async (schoolId: string, data: {
    title: string;
    eventType: string;
    startDate: string;
    endDate: string;
    description?: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/events`, data);
    return response.data;
  },

  listAcademicEvents: async (schoolId: string, filters?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
  }) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/events`, {
      params: filters,
    });
    return response.data;
  },

  getAcademicCalendar: async (schoolId: string, academicYearId: string, month?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/calendar`, {
      params: { academicYearId, month },
    });
    return response.data;
  },

  // ==================== LESSON PLANS ====================
  createLessonPlan: async (data: {
    teacherId: string;
    subjectId: string;
    sectionId: string;
    title: string;
    objectives: string;
    content: string;
    date: string;
  }) => {
    const response = await apiClient.post('/academic/lesson-plans', data);
    return response.data;
  },

  getLessonPlans: async (teacherId: string, filters?: {
    subjectId?: string;
    from?: string;
    to?: string;
  }) => {
    const response = await apiClient.get(`/academic/teachers/${teacherId}/lesson-plans`, {
      params: filters,
    });
    return response.data;
  },

  updateSyllabusProgress: async (data: {
    sectionId: string;
    subjectId: string;
    topicsCovered: string[];
    completionPercentage: number;
  }) => {
    const response = await apiClient.put('/academic/syllabus-progress', data);
    return response.data;
  },

  getSyllabusProgress: async (classId: string, subjectId?: string) => {
    const response = await apiClient.get(`/academic/classes/${classId}/syllabus-progress`, {
      params: subjectId ? { subjectId } : {},
    });
    return response.data;
  },

  // ==================== PARENT-TEACHER MEETINGS ====================
  createPTM: async (data: {
    schoolId: string;
    academicYearId: string;
    title: string;
    scheduledDate: string;
    timeFrom: string;
    timeTo: string;
  }) => {
    const response = await apiClient.post('/academic/ptm', data);
    return response.data;
  },

  listPTMs: async (schoolId: string, academicYearId?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/ptm`, {
      params: academicYearId ? { academicYearId } : {},
    });
    return response.data;
  },

  recordPTMAttendance: async (ptmId: string, data: {
    parentId: string;
    studentId: string;
    attended: boolean;
  }) => {
    const response = await apiClient.post(`/academic/ptm/${ptmId}/attendance`, data);
    return response.data;
  },

  // ==================== TRANSFERS ====================
  transferStudent: async (data: {
    studentId: string;
    fromSectionId: string;
    toSectionId: string;
    reason: string;
    effectiveDate: string;
  }) => {
    const response = await apiClient.post('/academic/transfers', data);
    return response.data;
  },

  getStudentTransfers: async (studentId: string) => {
    const response = await apiClient.get(`/academic/students/${studentId}/transfers`);
    return response.data;
  },

  // ==================== PROMOTIONS ====================
  bulkPromote: async (data: {
    academicYearId: string;
    fromClassId: string;
    toClassId: string;
    studentIds: string[];
  }) => {
    const response = await apiClient.post('/academic/promotions/bulk', data);
    return response.data;
  },

  manualPromotion: async (data: {
    studentId: string;
    academicYearId: string;
    status: string;
    reason?: string;
  }) => {
    const response = await apiClient.post('/academic/promotions/manual', data);
    return response.data;
  },

  getPromotionSummary: async (schoolId: string, filters?: {
    academicYearId?: string;
    classId?: string;
  }) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/promotions`, {
      params: filters,
    });
    return response.data;
  },

  // ==================== ID CARDS ====================
  createIDCardTemplate: async (data: {
    schoolId: string;
    cardType: string;
    templateName: string;
    layout: any;
  }) => {
    const response = await apiClient.post('/academic/id-card-templates', data);
    return response.data;
  },

  listIDCardTemplates: async (filters?: {
    schoolId?: string;
    cardType?: string;
  }) => {
    const response = await apiClient.get('/academic/id-card-templates', {
      params: filters,
    });
    return response.data;
  },

  generateIDCard: async (data: {
    studentId: string;
    templateId: string;
    academicYearId: string;
  }) => {
    const response = await apiClient.post('/academic/id-cards/generate', data);
    return response.data;
  },

  bulkGenerateIDCards: async (data: {
    sectionId: string;
    templateId: string;
    academicYearId: string;
  }) => {
    const response = await apiClient.post('/academic/id-cards/bulk-generate', data);
    return response.data;
  },

  getStudentIDCards: async (studentId: string) => {
    const response = await apiClient.get(`/academic/students/${studentId}/id-cards`);
    return response.data;
  },

  // ==================== SUBSTITUTE TEACHERS ====================
  assignSubstitute: async (data: {
    teacherId: string;
    substituteTeacherId: string;
    sectionId: string;
    date: string;
    period: number;
    reason: string;
  }) => {
    const response = await apiClient.post('/academic/substitutes', data);
    return response.data;
  },

  getSubstituteAssignments: async (teacherId: string) => {
    const response = await apiClient.get(`/academic/teachers/${teacherId}/substitutes`);
    return response.data;
  },

  // ==================== MAKEUP CLASSES ====================
  scheduleMakeupClass: async (data: {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    originalDate: string;
    makeupDate: string;
    reason: string;
  }) => {
    const response = await apiClient.post('/academic/makeup-classes', data);
    return response.data;
  },

  getMakeupClasses: async (sectionId: string) => {
    const response = await apiClient.get(`/academic/sections/${sectionId}/makeup-classes`);
    return response.data;
  },

  // ==================== ALUMNI ====================
  registerAlumni: async (schoolId: string, data: {
    userId: string;
    graduationYear: number;
    lastClass: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/alumni`, data);
    return response.data;
  },

  listAlumni: async (schoolId: string, year?: number) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/alumni`, {
      params: year ? { year } : {},
    });
    return response.data;
  },

  // ==================== RE-ADMISSION ====================
  submitReadmission: async (schoolId: string, data: {
    studentId: string;
    reason: string;
    previousClassId: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/readmission`, data);
    return response.data;
  },

  listReadmission: async (schoolId: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/readmission`);
    return response.data;
  },

  // ==================== SPECIAL PROGRAMS ====================
  createProgram: async (schoolId: string, data: {
    programName: string;
    programType: string;
    description?: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/programs`, data);
    return response.data;
  },

  listPrograms: async (schoolId: string, programType?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/programs`, {
      params: programType ? { programType } : {},
    });
    return response.data;
  },

  enrollInProgram: async (schoolId: string, programId: string, data: {
    studentId: string;
  }) => {
    const response = await apiClient.post(
      `/academic/schools/${schoolId}/programs/${programId}/enroll`,
      data
    );
    return response.data;
  },

  // ==================== COUNSELING ====================
  scheduleCounseling: async (schoolId: string, data: {
    studentId: string;
    counselorId: string;
    sessionDate: string;
    sessionType: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/counseling`, data);
    return response.data;
  },

  getCounseling: async (schoolId: string, studentId?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/counseling`, {
      params: studentId ? { studentId } : {},
    });
    return response.data;
  },

  // ==================== GRIEVANCES ====================
  submitGrievance: async (schoolId: string, data: {
    studentId: string;
    category: string;
    description: string;
  }) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/grievances`, data);
    return response.data;
  },

  listGrievances: async (schoolId: string, status?: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/grievances`, {
      params: status ? { status } : {},
    });
    return response.data;
  },

  updateGrievance: async (id: string, data: {
    status: string;
    resolution?: string;
  }) => {
    const response = await apiClient.put(`/academic/grievances/${id}/status`, data);
    return response.data;
  },

  // ==================== AUDIT REPORT ====================
  getAuditReport: async (schoolId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    actionType?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/audit-report`, {
      params: filters,
    });
    return response.data;
  },

  // ==================== GRADING SYSTEM ====================
  configureGradingSystem: async (schoolId: string, data: any) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/grading-system`, data);
    return response.data;
  },

  getGradingSystem: async (schoolId: string) => {
    const response = await apiClient.get(`/academic/schools/${schoolId}/grading-system`);
    return response.data;
  },

  // ==================== REPORT CARDS ====================
  createReportCardTemplate: async (schoolId: string, data: any) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/report-card-templates`, data);
    return response.data;
  },

  generateReportCard: async (studentId: string, academicYearId: string) => {
    const response = await apiClient.post(`/academic/students/${studentId}/report-cards/generate`, {
      academicYearId,
    });
    return response.data;
  },

  // ==================== LEAVES ====================
  applyStudentLeave: async (studentId: string, data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await apiClient.post(`/academic/students/${studentId}/leaves`, data);
    return response.data;
  },

  listStudentLeaves: async (studentId: string) => {
    const response = await apiClient.get(`/academic/students/${studentId}/leaves`);
    return response.data;
  },

  applyTeacherLeave: async (teacherId: string, data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await apiClient.post(`/academic/teachers/${teacherId}/leaves`, data);
    return response.data;
  },

  listTeacherLeaves: async (teacherId: string) => {
    const response = await apiClient.get(`/academic/teachers/${teacherId}/leaves`);
    return response.data;
  },

  // ==================== SIBLING DISCOUNTS ====================
  configureSiblingDiscount: async (schoolId: string, discountPercentage: number) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/sibling-discounts`, {
      discountPercentage,
    });
    return response.data;
  },

  // ==================== LEARNING PATHS ====================
  createLearningPath: async (schoolId: string, data: any) => {
    const response = await apiClient.post(`/academic/schools/${schoolId}/learning-paths`, data);
    return response.data;
  },

  assignLearningPath: async (studentId: string, pathId: string) => {
    const response = await apiClient.post(`/academic/students/${studentId}/learning-paths/assign`, {
      pathId,
    });
    return response.data;
  },
};
