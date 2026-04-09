import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Trình gieo mầm dữ liệu (Seeding)...');

  const password = await bcrypt.hash('demo123', 10);

  // 1. Create Homeowner Demo
  const h1 = await prisma.user.upsert({
    where: { email: 'homeowner@demo.com' },
    update: {},
    create: {
      email: 'homeowner@demo.com',
      password,
      role: 'HOMEOWNER',
      projects: {
        create: [
          {
            name: 'Căn hộ Studio Mini',
            designData: {
              walls: [
                { id: 'w1', start: { x: 2, y: 2 }, end: { x: 8, y: 2 }, thickness: 0.2, height: 2.7 },
                { id: 'w2', start: { x: 8, y: 2 }, end: { x: 8, y: 8 }, thickness: 0.2, height: 2.7 },
                { id: 'w3', start: { x: 8, y: 8 }, end: { x: 2, y: 8 }, thickness: 0.2, height: 2.7 },
                { id: 'w4', start: { x: 2, y: 8 }, end: { x: 2, y: 2 }, thickness: 0.2, height: 2.7 },
              ],
              furniture: [
                { id: 'f1', type: 'sofa', label: 'Sofa Phòng Khách', position: [5, 0, 3], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#7c3aed' }
              ],
              sceneMaterial: { floor: 'wood', wallPaint: '#c7d2fe' }
            }
          }
        ]
      }
    }
  });

  // 2. Create Contractor Demo
  await prisma.user.upsert({
    where: { email: 'contractor@demo.com' },
    update: {},
    create: {
      email: 'contractor@demo.com',
      password,
      role: 'CONTRACTOR',
    }
  });

  console.log('✅ Đã tạo tài khoản demo:');
  console.log('- Homeowner: homeowner@demo.com / demo123');
  console.log('- Contractor: contractor@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
