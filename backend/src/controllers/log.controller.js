const { getLogs } = require('../services/log.service');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, userId, action } = req.query;
    const result = await getLogs({ page, limit, userId, action });
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getAll };
