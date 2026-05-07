const prisma = require('../config/database');

const getAllResources = async ({ page = 1, limit = 20, status, type } = {}) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { accesses: true } } },
    }),
    prisma.resource.count({ where }),
  ]);

  return { resources, total, page: Number(page), limit: Number(limit) };
};

const getResourceById = async (id) => {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      accesses: {
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      },
    },
  });
  if (!resource) throw { status: 404, message: 'Resource not found' };
  return resource;
};

const createResource = async (data) => {
  return await prisma.resource.create({ data });
};

const updateResource = async (id, data) => {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw { status: 404, message: 'Resource not found' };
  return await prisma.resource.update({ where: { id }, data });
};

const deleteResource = async (id) => {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw { status: 404, message: 'Resource not found' };
  await prisma.resource.delete({ where: { id } });
};

const updateMetrics = async (id, { cpuUsage, ramUsage }) => {
  return await prisma.resource.update({
    where: { id },
    data: { cpuUsage, ramUsage, updatedAt: new Date() },
  });
};

module.exports = { getAllResources, getResourceById, createResource, updateResource, deleteResource, updateMetrics };
