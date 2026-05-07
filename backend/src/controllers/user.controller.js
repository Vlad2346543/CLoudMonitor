const userService = require('../services/user.service');
const { createLog } = require('../services/log.service');

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const user = await userService.updateUserRole(req.params.id, role);
    await createLog({ userId: req.user.id, action: 'USER_ROLE_UPDATE', details: `Changed role for ${user.email} to ${role}`, ipAddress: req.ip });
    res.json(user);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await userService.deleteUser(req.params.id);
    await createLog({ userId: req.user.id, action: 'USER_DELETE', details: `Deleted user: ${req.params.id}`, ipAddress: req.ip });
    res.json({ message: 'User deleted' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { getAll, getById, updateRole, remove };
