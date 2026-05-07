const router = require('express').Router();
const ctrl = require('../controllers/resource.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Cloud resource management
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ONLINE, OFFLINE, MAINTENANCE, UNKNOWN] }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of resources }
 */
router.get('/', authenticate, ctrl.getAll);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Resource details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, ctrl.getById);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *               region: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Resource created }
 */
router.post('/', authenticate, authorize('ADMIN', 'USER'), ctrl.create);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/:id', authenticate, authorize('ADMIN', 'USER'), ctrl.update);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove);

module.exports = router;
