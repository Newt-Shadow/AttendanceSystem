import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Departments with lat & lng
  await prisma.department.createMany({
    data: [
      { name: 'Computer Science', lat: 20.2706, lng: 85.8334 },
      { name: 'Electronics', lat: 20.2706, lng: 85.8334 },
      { name: 'Mechanical Engineering', lat: 20.2706, lng: 85.8334 },
      { name: 'Admin Department', lat: 20.2706, lng: 85.8334 }, // optional for ADMIN fallback
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
