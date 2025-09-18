import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Hash passwords for demo users ---
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);

  // --- Create Users ---
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'Student User',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  const verifier = await prisma.user.upsert({
    where: { email: 'verifier@example.com' },
    update: {},
    create: {
      name: 'Verifier User',
      email: 'verifier@example.com',
      password: hashedPassword,
      role: 'VERIFIER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // --- Create Profile for Student ---
  const profile = await prisma.profile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      slug: 'tanmaya',
      bio: 'Aspiring AI engineer passionate about defence tech.',
      headline: 'AI & Defence Intern',
      isPublic: true,
    },
  });

  // --- Create 3 Entries (1 project, 1 internship, 1 certification) ---
  const [project, internship, cert] = await Promise.all([
    prisma.entry.create({
      data: {
        profileId: profile.id,
        type: 'PROJECT',
        title: 'AI Drone Navigation',
        description: 'Developed autonomous drone navigation algorithms.',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-07-01'),
        tags: ['ai', 'defence'],
        status: 'PUBLISHED',
      },
    }),
    prisma.entry.create({
      data: {
        profileId: profile.id,
        type: 'INTERNSHIP',
        title: 'Defence Lab Internship',
        description: 'Worked on computer vision for UAVs.',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-10-01'),
        tags: ['internship', 'defence'],
        status: 'PUBLISHED',
      },
    }),
    prisma.entry.create({
      data: {
        profileId: profile.id,
        type: 'CERT',
        title: 'Machine Learning Certification',
        description: 'Completed an ML course with distinction.',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-04-01'),
        tags: ['ai', 'certification'],
        status: 'PUBLISHED',
      },
    }),
  ]);

  // --- Add a Verification for one entry ---
  await prisma.verification.create({
    data: {
      entryId: internship.id,
      verifierId: verifier.id,
      status: 'APPROVED',
      note: 'Great work during internship!',
    },
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
