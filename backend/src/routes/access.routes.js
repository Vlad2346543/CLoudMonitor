const router = require('express').Router();
const ctrl = require('../controllers/access.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Access
 *   description: Access control management
 */

/**
 * @swagger
 * /access:
 *   get:
 *     summary: Get all access records (Admin only)
 *     tags: [Access]
 *     responses:
 *       200: { description: All access records }
 */
router.get('/', authenticate, authorize('ADMIN'), ctrl.getAll);

/**
 * @swagger
 * /access/resource/{resourceId}:
 *   get:
 *     summary: Get all users with access to a resource
 *     tags: [Access]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Access list }
 */
router.get('/resource/:resourceId', authenticate, authorize('ADMIN', 'USER'), ctrl.getByResource);

/**
 * @swagger
 * /access/user/{userId}:
 *   get:
 *     summary: Get all resources a user has access to
 *     tags: [Access]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User's access list }
 */
router.get('/user/:userId', authenticate, ctrl.getByUser);

/**
 * @swagger
 * /access/grant:
 *   post:
 *     summary: Grant access to a resource
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, resourceId]
 *             properties:
 *               userId: { type: string }
 *               resourceId: { type: string }
 *               role: { type: string, enum: [OWNER, EDITOR, VIEWER] }
 *     responses:
 *       201: { description: Access granted }
 */
router.post('/grant', authenticate, authorize('ADMIN'), ctrl.grant);

/**
 * @swagger
 * /access/revoke:
 *   post:
 *     summary: Revoke access from a resource
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, resourceId]
 *             properties:
 *               userId: { type: string }
 *               resourceId: { type: string }
 *     responses:
 *       200: { description: Access revoked }
 */
router.post('/revoke', authenticate, authorize('ADMIN'), ctrl.revoke);

module.exports = router;
