const resourceService = require('../services/resource.service');
const { createLog } = require('../services/log.service');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, status, type } = req.query;
    const result = await resourceService.getAllResources({ page, limit, status, type });
    res.json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    res.json(resource);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, type, status, region, description } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const resource = await resourceService.createResource({ name, type, status, region, description });
    await createLog({ userId: req.user.id, action: 'RESOURCE_CREATE', details: `Created: ${name} (${type})`, ipAddress: req.ip });

    res.status(201).json(resource);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const resource = await resourceService.updateResource(req.params.id, req.body);
    await createLog({ userId: req.user.id, action: 'RESOURCE_UPDATE', details: `Updated: ${resource.name}`, ipAddress: req.ip });
    res.json(resource);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await resourceService.deleteResource(req.params.id);
    await createLog({ userId: req.user.id, action: 'RESOURCE_DELETE', details: `Deleted resource: ${req.params.id}`, ipAddress: req.ip });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
