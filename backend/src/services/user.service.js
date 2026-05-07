const prisma = require('../config/database');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

const updateUserRole = async (id, role) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw { status: 404, message: 'User not found' };
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw { status: 404, message: 'User not found' };
  await prisma.user.delete({ where: { id } });
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
