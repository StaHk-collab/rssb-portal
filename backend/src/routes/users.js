const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    const users = db.prepare(`
      SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt
      FROM users
      ORDER BY createdAt DESC
    `).all();
    
    res.json({
      success: true,
      data: users
    });
  })
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt
      FROM users 
      WHERE id = ?
    `).get(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get user's sewadar creation stats
    const stats = db.prepare(`
      SELECT COUNT(*) as sewadarsCreated
      FROM sewadars
      WHERE createdBy = ?
    `).get(id);
    
    res.json({
      success: true,
      data: {
        ...user,
        stats
      }
    });
  })
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EDITOR, VIEWER]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validate('userUpdate'),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prevent admin from deactivating themselves
    if (id === req.user.userId && req.body.isActive === false) {
      throw new AppError('Cannot deactivate your own account', 400);
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields provided for update', 400);
    }
    
    // Add updatedAt timestamp
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    db.prepare(updateQuery).run(...values);
    
    // Log the update
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      uuidv4(), 
      'UPDATE_USER', 
      req.user.userId, 
      'USER', 
      id,
      `Updated user: ${existingUser.email}`
    );
    
    // Fetch updated user
    const updatedUser = db.prepare(`
      SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt
      FROM users 
      WHERE id = ?
    `).get(id);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  })
);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset user password (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
    
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, id);
    
    // Log the password reset
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      uuidv4(), 
      'RESET_PASSWORD', 
      req.user.userId, 
      'USER', 
      id,
      `Password reset for user: ${existingUser.email}`
    );
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }
    
    // Check if user has created sewadars
    const sewadarCount = db.prepare('SELECT COUNT(*) as count FROM sewadars WHERE createdBy = ?').get(id);
    if (sewadarCount.count > 0) {
      throw new AppError(
        `Cannot delete user who has created ${sewadarCount.count} sewadar records. Please reassign or delete the records first.`,
        400
      );
    }
    
    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    // Log the deletion
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      uuidv4(), 
      'DELETE_USER', 
      req.user.userId, 
      'USER', 
      id,
      `Deleted user: ${existingUser.email}`
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

module.exports = router;