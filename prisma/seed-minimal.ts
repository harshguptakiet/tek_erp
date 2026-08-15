/**
 * Minimal Database Seeder - Just enough to make login work
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
  console.log('🌱 Starting minimal seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Platform Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Admin:', admin.email);

  // Create Teacher
  const teacher = await prisma.user.upsert({
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
    },
  });
  console.log('✅ Teacher:', teacher.email);

  // Create Student
  const student = await prisma.user.upsert({
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
    },
  });
  console.log('✅ Student:', student.email);

  // Create Parent
  const parent = await prisma.user.upsert({
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
    },
  });
  console.log('✅ Parent:', parent.email);

  console.log('\n🎉 Minimal seed complete!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('All users password: password123\n');
  console.log('Admin: admin@example.com');
  console.log('Teacher: teacher@demo.com');
  console.log('Student: student@demo.com');
  console.log('Parent: parent@demo.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
