const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.log.deleteMany();
  await prisma.access.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cloudguard.io',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@cloudguard.io',
      password: userPassword,
      name: 'Alice Johnson',
      role: 'USER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@cloudguard.io',
      password: userPassword,
      name: 'Bob Smith',
      role: 'VIEWER',
    },
  });

  // Create resources
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        name: 'prod-web-server-01',
        type: 'EC2',
        status: 'ONLINE',
        region: 'us-east-1',
        description: 'Primary production web server',
        cpuUsage: 42.5,
        ramUsage: 68.2,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'prod-database-primary',
        type: 'RDS',
        status: 'ONLINE',
        region: 'us-east-1',
        description: 'Primary PostgreSQL database',
        cpuUsage: 28.1,
        ramUsage: 75.4,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'static-assets-bucket',
        type: 'S3',
        status: 'ONLINE',
        region: 'us-east-1',
        description: 'Static assets storage',
        cpuUsage: null,
        ramUsage: null,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'auth-lambda-fn',
        type: 'LAMBDA',
        status: 'ONLINE',
        region: 'eu-west-1',
        description: 'Authentication microservice',
        cpuUsage: 5.2,
        ramUsage: 22.8,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'staging-web-server',
        type: 'EC2',
        status: 'OFFLINE',
        region: 'us-west-2',
        description: 'Staging environment server',
        cpuUsage: 0,
        ramUsage: 0,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'cdn-distribution',
        type: 'CLOUDFRONT',
        status: 'MAINTENANCE',
        region: 'global',
        description: 'CloudFront CDN distribution',
        cpuUsage: null,
        ramUsage: null,
      },
    }),
  ]);

  // Create access entries
  await prisma.access.createMany({
    data: [
      { userId: admin.id, resourceId: resources[0].id, role: 'OWNER' },
      { userId: admin.id, resourceId: resources[1].id, role: 'OWNER' },
      { userId: alice.id, resourceId: resources[0].id, role: 'EDITOR' },
      { userId: alice.id, resourceId: resources[2].id, role: 'EDITOR' },
      { userId: bob.id, resourceId: resources[0].id, role: 'VIEWER' },
      { userId: bob.id, resourceId: resources[3].id, role: 'VIEWER' },
    ],
  });

  // Create initial logs
  await prisma.log.createMany({
    data: [
      { userId: admin.id, action: 'USER_LOGIN', details: 'Initial system setup', ipAddress: '127.0.0.1' },
      { userId: admin.id, action: 'RESOURCE_CREATE', details: `Created resource: prod-web-server-01`, ipAddress: '127.0.0.1' },
      { userId: admin.id, action: 'ACCESS_GRANT', details: `Granted access to alice@cloudguard.io`, ipAddress: '127.0.0.1' },
      { userId: alice.id, action: 'USER_LOGIN', details: 'User logged in', ipAddress: '192.168.1.10' },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('👤 Admin: admin@cloudguard.io / admin123');
  console.log('👤 User:  alice@cloudguard.io / user123');
  console.log('👤 Viewer: bob@cloudguard.io / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
