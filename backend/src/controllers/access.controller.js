const accessService = require('../services/access.service');
const { createLog } = require('../services/log.service');

const getAll = async (req, res, next) => {
  try {
    const accesses = await accessService.getAllAccess();
    res.json(accesses);
  } catch (err) { next(err); }
};

const getByResource = async (req, res, next) => {
  try {
    const accesses = await accessService.getAccessByResource(req.params.resourceId);
    res.json(accesses);
  } catch (err) { next(err); }
};

const getByUser = async (req, res, next) => {
  try {
    const accesses = await accessService.getAccessByUser(req.params.userId);
    res.json(accesses);
  } catch (err) { next(err); }
};

const grant = async (req, res, next) => {
  try {
    const { userId, resourceId, role } = req.body;
    if (!userId || !resourceId) return res.status(400).json({ error: 'userId and resourceId are required' });

    const access = await accessService.grantAccess({ userId, resourceId, role });
    await createLog({
      userId: req.user.id,
      action: 'ACCESS_GRANT',
      details: `Granted ${role || 'VIEWER'} access to user ${userId} on resource ${resourceId}`,
      ipAddress: req.ip,
    });
    res.status(201).json(access);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const revoke = async (req, res, next) => {
  try {
    const { userId, resourceId } = req.body;
    if (!userId || !resourceId) return res.status(400).json({ error: 'userId and resourceId are required' });

    await accessService.revokeAccess({ userId, resourceId });
    await createLog({
      userId: req.user.id,
      action: 'ACCESS_REVOKE',
      details: `Revoked access for user ${userId} on resource ${resourceId}`,
      ipAddress: req.ip,
    });
    res.json({ message: 'Access revoked' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { getAll, getByResource, getByUser, grant, revoke };
