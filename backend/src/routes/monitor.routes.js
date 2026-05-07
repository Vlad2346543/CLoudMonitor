const router = require('express').Router();
const ctrl = require('../controllers/monitor.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Monitor
 *   description: System and resource monitoring
 */

/**
 * @swagger
 * /monitor/overview:
 *   get:
 *     summary: Get system overview and stats
 *     tags: [Monitor]
 *     responses:
 *       200: { description: System overview }
 */
router.get('/overview', authenticate, ctrl.getOverview);

/**
 * @swagger
 * /monitor/metrics:
 *   get:
 *     summary: Get live metrics for all online resources
 *     tags: [Monitor]
 *     responses:
 *       200: { description: Resource metrics }
 */
router.get('/metrics', authenticate, ctrl.getResourceMetrics);

module.exports = router;
