const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const username = 'admin';
  const email = 'admin@primex.com';
  const password = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.upsert({
      where: { username },
      update: {
        role: 'admin',
      },
      create: {
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        isCreator: true,
      },
    });
    console.log('Admin user created/updated:', admin.username);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
