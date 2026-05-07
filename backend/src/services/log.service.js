const prisma = require('../config/database');

const createLog = async ({ userId, action, details, ipAddress }) => {
  try {
    await prisma.log.create({
      data: { userId: userId || null, action, details, ipAddress },
    });
  } catch (err) {
    console.error('Failed to create log:', err.message);
  }
};

const getLogs = async ({ page = 1, limit = 50, userId, action } = {}) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    prisma.log.count({ where }),
  ]);

  return { logs, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
};

module.exports = { createLog, getLogs };
