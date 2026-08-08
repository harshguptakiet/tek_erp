/**
 * Database Seeder
 * Creates test data for development
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Create PostgreSQL connection pool with proper config
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tekurious_db';
const pool = new Pool({ 
  connectionString,
  // Ensure password is treated as string
  ssl: false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password once for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      type: 'SCHOOL_CHAIN',
      email: 'contact@demo-org.com',
      phone: '+1-555-0100',
      website: 'https://demo-org.com',
      status: 'ACTIVE',
      settings: {},
      address: {
        create: {
          street: '123 Education Street',
          city: 'Demo City',
          state: 'DC',
          postalCode: '12345',
          country: 'USA',
          type: 'PRIMARY',
        },
      },
    },
  });
  console.log('✅ Created Organization:', organization.name);

  // Create School
  const school = await prisma.school.upsert({
    where: { code: 'DEMO-001' },
    update: {},
    create: {
      code: 'DEMO-001',
      name: 'Demo High School',
      organizationId: organization.id,
      email: 'info@demohigh.edu',
      phone: '+1-555-0101',
      website: 'https://demohigh.edu',
      type: 'HIGH_SCHOOL',
      status: 'ACTIVE',
      establishedDate: new Date('2000-01-01'),
      settings: {},
      address: {
        create: {
          street: '456 School Avenue',
          city: 'Demo City',
          state: 'DC',
          postalCode: '12345',
          country: 'USA',
          type: 'PRIMARY',
        },
      },
    },
  });
  console.log('✅ Created School:', school.name);

  // Create School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'schooladmin@demo.com' },
    update: {},
    create: {
      email: 'schooladmin@demo.com',
      passwordHash: hashedPassword,
      firstName: 'School',
      lastName: 'Administrator',
      role: 'SCHOOL_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      organizationId: organization.id,
      schoolId: school.id,
    },
  });
  console.log('✅ Created School Admin:', schoolAdmin.email);

  // Create Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Teacher',
      role: 'TEACHER',
      status: 'ACTIVE',
      emailVerified: true,
      organizationId: organization.id,
      schoolId: school.id,
    },
  });
  console.log('✅ Created Teacher User:', teacherUser.email);

  // Create Teacher Profile
  const teacher = await prisma.teacher.upsert({
    where: { employeeId: 'TCH-001' },
    update: {},
    create: {
      employeeId: 'TCH-001',
      userId: teacherUser.id,
      schoolId: school.id,
      firstName: 'John',
      lastName: 'Teacher',
      email: 'teacher@demo.com',
      phone: '+1-555-0201',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'MALE',
      joiningDate: new Date('2020-08-01'),
      status: 'ACTIVE',
      qualification: 'M.Ed',
      specialization: 'Mathematics',
      experience: 10,
    },
  });
  console.log('✅ Created Teacher Profile:', teacher.employeeId);

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { code: 'AY-2024-25' },
    update: {},
    create: {
      code: 'AY-2024-25',
      name: '2024-2025',
      schoolId: school.id,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-07-31'),
      currentYear: true,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Academic Year:', academicYear.name);

  // Create Grade
  const grade = await prisma.grade.upsert({
    where: { code: 'GRADE-10' },
    update: {},
    create: {
      code: 'GRADE-10',
      name: 'Grade 10',
      schoolId: school.id,
      level: 10,
      description: 'Tenth Grade',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Grade:', grade.name);

  // Create Section
  const section = await prisma.section.upsert({
    where: { code: 'SEC-10A' },
    update: {},
    create: {
      code: 'SEC-10A',
      name: 'Section A',
      gradeId: grade.id,
      schoolId: school.id,
      capacity: 40,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Section:', section.name);

  // Create Class
  const classEntity = await prisma.class.upsert({
    where: { code: 'CLS-10A-2024' },
    update: {},
    create: {
      code: 'CLS-10A-2024',
      name: 'Grade 10 - Section A (2024-25)',
      gradeId: grade.id,
      sectionId: section.id,
      schoolId: school.id,
      academicYearId: academicYear.id,
      classTeacherId: teacher.id,
      capacity: 40,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Class:', classEntity.name);

  // Create Student User
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Student',
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
      organizationId: organization.id,
      schoolId: school.id,
    },
  });
  console.log('✅ Created Student User:', studentUser.email);

  // Create Student Profile
  const student = await prisma.student.upsert({
    where: { admissionNumber: 'STU-2024-001' },
    update: {},
    create: {
      admissionNumber: 'STU-2024-001',
      rollNumber: '001',
      userId: studentUser.id,
      schoolId: school.id,
      currentClassId: classEntity.id,
      firstName: 'Jane',
      lastName: 'Student',
      email: 'student@demo.com',
      phone: '+1-555-0301',
      dateOfBirth: new Date('2009-03-20'),
      gender: 'FEMALE',
      bloodGroup: 'O+',
      enrollmentDate: new Date('2024-08-01'),
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Student Profile:', student.admissionNumber);

  // Create Subject
  const subject = await prisma.subject.upsert({
    where: { code: 'MATH-10' },
    update: {},
    create: {
      code: 'MATH-10',
      name: 'Mathematics',
      schoolId: school.id,
      description: 'Advanced Mathematics for Grade 10',
      type: 'CORE',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Subject:', subject.name);

  // Create Parent User
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      email: 'parent@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Robert',
      lastName: 'Parent',
      role: 'PARENT',
      status: 'ACTIVE',
      emailVerified: true,
      organizationId: organization.id,
      schoolId: school.id,
    },
  });
  console.log('✅ Created Parent User:', parentUser.email);

  // Create Parent Profile
  const parent = await prisma.parent.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      userId: parentUser.id,
      schoolId: school.id,
      firstName: 'Robert',
      lastName: 'Parent',
      email: 'parent@demo.com',
      phone: '+1-555-0401',
      relationship: 'FATHER',
      occupation: 'Engineer',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Parent Profile:', parent.email);

  // Link Parent to Student
  await prisma.studentParent.upsert({
    where: {
      studentId_parentId: {
        studentId: student.id,
        parentId: parent.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      parentId: parent.id,
      relationship: 'FATHER',
      isPrimary: true,
    },
  });
  console.log('✅ Linked Parent to Student');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:');
  console.log('  Email: admin@example.com');
  console.log('  Password: password123');
  console.log('\nSchool Admin:');
  console.log('  Email: schooladmin@demo.com');
  console.log('  Password: password123');
  console.log('\nTeacher:');
  console.log('  Email: teacher@demo.com');
  console.log('  Password: password123');
  console.log('\nStudent:');
  console.log('  Email: student@demo.com');
  console.log('  Password: password123');
  console.log('\nParent:');
  console.log('  Email: parent@demo.com');
  console.log('  Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
