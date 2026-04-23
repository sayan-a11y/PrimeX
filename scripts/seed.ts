import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding PrimeX database...\n');

  // Create test user if not exists
  const existingUser = await db.user.findUnique({ where: { username: 'primexuser' } });
  if (!existingUser) {
    await db.user.create({
      data: {
        username: 'primexuser',
        email: 'user@primex.com',
        password: await hashPassword('password123'),
        bio: '🌟 PrimeX User',
        isCreator: false,
      },
    });
    console.log('✅ Created test user: primexuser');
  } else {
    console.log('ℹ️ Test user already exists: primexuser');
  }

  // Create admin user if not exists
  const existingAdmin = await db.user.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        username: 'admin',
        email: 'admin@primex.com',
        password: await hashPassword('admin123'),
        bio: '🔧 PrimeX Administrator',
        role: 'admin',
        isCreator: true,
      },
    });
    console.log('✅ Created admin user: admin');
  } else {
    console.log('ℹ️ Admin user already exists: admin');
  }

  console.log('\n✅ Seed complete! No demo content created.');
  console.log('   Users can upload their own videos and reels.');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
