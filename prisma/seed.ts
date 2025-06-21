import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Departments with lat & lng
  await prisma.department.createMany({
    data: [
      { name: 'Computer Science', lat: 26.1234, lng: 92.1234 },
      { name: 'Electronics', lat: 26.1235, lng: 92.1235 },
      { name: 'Mechanical Engineering', lat: 26.1236, lng: 92.1236 },
      { name: 'Admin Department', lat: 26.0000, lng: 92.0000 }, // optional for ADMIN fallback
    ],
    skipDuplicates: true,
  });

  // Seed Semesters
  await prisma.semester.createMany({
    data: Array.from({ length: 8 }, (_, i) => ({
      name: `Semester ${i + 1}`,
    })),
    skipDuplicates: true,
  });

  console.log('✅ Seeded departments and semesters');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
