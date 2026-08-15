/**
 * Database Seeder
 * Creates test data for development
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tekurious_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Super / Platform Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
    },
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

  // 2. Create School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'schooladmin@demo.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
    },
    create: {
      email: 'schooladmin@demo.com',
      passwordHash: hashedPassword,
      firstName: 'School',
      lastName: 'Administrator',
      role: 'SCHOOL_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created School Admin:', schoolAdmin.email);

  // 3. Create Teacher User
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
    },
    create: {
      email: 'teacher@demo.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Teacher',
      role: 'TEACHER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created Teacher User:', teacherUser.email);

  // 4. Create Main Demo Student User (Jane Student)
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Student',
      phone: '+919876543210',
      gender: 'FEMALE',
      dateOfBirth: new Date('2008-05-15'),
      status: 'ACTIVE',
      tenantId: 'tenant-demo-school-1',
      emailVerified: true,
    },
    create: {
      email: 'student@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Student',
      middleName: 'Marie',
      phone: '+919876543210',
      gender: 'FEMALE',
      dateOfBirth: new Date('2008-05-15'),
      role: 'STUDENT',
      status: 'ACTIVE',
      tenantId: 'tenant-demo-school-1',
      emailVerified: true,
    },
  });
  console.log('✅ Created Demo Student User:', studentUser.email);

  // 4b. Create Additional Demo Students
  const demoStudentsData = [
    {
      email: 'alex.rivera@demo.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      gender: 'MALE',
      phone: '+919876543211',
      dob: new Date('2008-08-22'),
    },
    {
      email: 'priya.patel@demo.com',
      firstName: 'Priya',
      lastName: 'Patel',
      gender: 'FEMALE',
      phone: '+919876543212',
      dob: new Date('2009-01-10'),
    },
    {
      email: 'rahul.sharma@demo.com',
      firstName: 'Rahul',
      lastName: 'Sharma',
      gender: 'MALE',
      phone: '+919876543213',
      dob: new Date('2008-11-04'),
    },
    {
      email: 'sarah.connor@demo.com',
      firstName: 'Sarah',
      lastName: 'Connor',
      gender: 'FEMALE',
      phone: '+919876543214',
      dob: new Date('2008-03-30'),
    },
  ];

  for (const std of demoStudentsData) {
    const created = await prisma.user.upsert({
      where: { email: std.email },
      update: {
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        tenantId: 'tenant-demo-school-1',
      },
      create: {
        email: std.email,
        passwordHash: hashedPassword,
        firstName: std.firstName,
        lastName: std.lastName,
        phone: std.phone,
        gender: std.gender,
        dateOfBirth: std.dob,
        role: 'STUDENT',
        status: 'ACTIVE',
        tenantId: 'tenant-demo-school-1',
        emailVerified: true,
      },
    });
    console.log(`✅ Created Demo Student: ${created.firstName} ${created.lastName} (${created.email})`);
  }

  // 4c. Create Independent / Self-Study Students (Not associated with any school or tenant)
  const independentStudent1 = await prisma.user.upsert({
    where: { email: 'independent.student@demo.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      tenantId: null,
    },
    create: {
      email: 'independent.student@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Leo',
      lastName: 'Solo',
      phone: '+919876543299',
      gender: 'MALE',
      dateOfBirth: new Date('2007-12-12'),
      role: 'STUDENT',
      status: 'ACTIVE',
      tenantId: null, // Independent student, unassociated with any school/tenant
      emailVerified: true,
    },
  });
  console.log('✅ Created Independent Student:', independentStudent1.email);

  const independentStudent2 = await prisma.user.upsert({
    where: { email: 'solo.student@demo.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      tenantId: null,
    },
    create: {
      email: 'solo.student@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Maya',
      lastName: 'Freelancer',
      phone: '+919876543298',
      gender: 'FEMALE',
      dateOfBirth: new Date('2006-06-20'),
      role: 'STUDENT',
      status: 'ACTIVE',
      tenantId: null, // Independent student, unassociated with any school/tenant
      emailVerified: true,
    },
  });
  console.log('✅ Created Independent Student:', independentStudent2.email);

  // 5. Create Parent User
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@demo.com' },
    update: {
      passwordHash: hashedPassword,
      status: 'ACTIVE',
    },
    create: {
      email: 'parent@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Robert',
      lastName: 'Parent',
      phone: '+919876543220',
      role: 'PARENT',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created Parent User:', parentUser.email);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Password for all users: password123\n');
  console.log('Super Admin:  admin@example.com');
  console.log('School Admin: schooladmin@demo.com');
  console.log('Teacher:      teacher@demo.com');
  console.log('Student:      student@demo.com');
  console.log('Parent:       parent@demo.com');
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
