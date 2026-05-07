const prisma = require('../config/database');

const grantAccess = async ({ userId, resourceId, role }) => {
  // Check both exist
  const [user, resource] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.resource.findUnique({ where: { id: resourceId } }),
  ]);
  if (!user) throw { status: 404, message: 'User not found' };
  if (!resource) throw { status: 404, message: 'Resource not found' };

  return await prisma.access.upsert({
    where: { userId_resourceId: { userId, resourceId } },
    update: { role },
    create: { userId, resourceId, role },
    include: {
      user: { select: { id: true, email: true, name: true } },
      resource: { select: { id: true, name: true, type: true } },
    },
  });
};

const revokeAccess = async ({ userId, resourceId }) => {
  const access = await prisma.access.findUnique({
    where: { userId_resourceId: { userId, resourceId } },
  });
  if (!access) throw { status: 404, message: 'Access record not found' };
  await prisma.access.delete({ where: { userId_resourceId: { userId, resourceId } } });
};

const getAccessByResource = async (resourceId) => {
  return await prisma.access.findMany({
    where: { resourceId },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
    orderBy: { grantedAt: 'desc' },
  });
};

const getAccessByUser = async (userId) => {
  return await prisma.access.findMany({
    where: { userId },
    include: { resource: { select: { id: true, name: true, type: true, status: true } } },
    orderBy: { grantedAt: 'desc' },
  });
};

const getAllAccess = async () => {
  return await prisma.access.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      resource: { select: { id: true, name: true, type: true, status: true } },
    },
    orderBy: { grantedAt: 'desc' },
  });
};

module.exports = { grantAccess, revokeAccess, getAccessByResource, getAccessByUser, getAllAccess };
