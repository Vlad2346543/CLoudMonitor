const authService = require('../services/auth.service');
const { createLog } = require('../services/log.service');

const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await authService.register({ email, password, name, role });
    await createLog({ userId: user.id, action: 'USER_REGISTER', details: `New user registered: ${email}`, ipAddress: req.ip });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login({ email, password });
    await createLog({ userId: result.user.id, action: 'USER_LOGIN', details: `Login from ${req.ip}`, ipAddress: req.ip });

    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
