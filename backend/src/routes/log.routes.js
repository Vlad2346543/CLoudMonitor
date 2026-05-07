const router = require('express').Router();
const { getAll } = require('../controllers/log.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity logs
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get activity logs (Admin only)
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *     responses:
 *       200: { description: Logs list }
 */
router.get('/', authenticate, authorize('ADMIN'), getAll);

module.exports = router;
