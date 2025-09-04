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
    
    const usersResult = await db.query(`
      SELECT 
        id, 
        email, 
        first_name AS "firstName", 
        last_name AS "lastName", 
        role, 
        is_active AS "isActive", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM users
      ORDER BY created_at DESC
    `);
    
    const users = usersResult.rows;
    
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
    
    const userResult = await db.query(`
      SELECT 
        id, 
        email, 
        first_name AS "firstName", 
        last_name AS "lastName", 
        role, 
        is_active AS "isActive", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM users 
      WHERE id = $1
    `, [id]);
    
    const user = userResult.rows[0];
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get user's sewadar creation stats
    const statsResult = await db.query(`
      SELECT COUNT(*) AS "sewadarsCreated"
      FROM sewadars
      WHERE created_by = $1
    `, [id]);
    
    const stats = statsResult.rows[0];
    
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
    const existingResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const existingUser = existingResult.rows[0];
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prevent admin from deactivating themselves
    if (id === req.user.userId && req.body.isActive === false) {
      throw new AppError('Cannot deactivate your own account', 400);
    }
    
    // Build dynamic update query with field mapping
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      isActive: 'is_active'
    };
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && fieldMap[key]) {
        const dbColumn = fieldMap[key];
        updates.push(`${dbColumn} = $${paramIndex}`);
        values.push(req.body[key]);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields provided for update', 400);
    }
    
    // Add updatedAt timestamp and id parameter
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;
    
    await db.query(updateQuery, values);
    
    // Log the update
    await db.query(`
      INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'UPDATE_USER', 
      req.user.userId, 
      'USER', 
      id,
      `Updated user: ${existingUser.email}`
    ]);
    
    // Fetch updated user
    const updatedResult = await db.query(`
      SELECT 
        id, 
        email, 
        first_name AS "firstName", 
        last_name AS "lastName", 
        role, 
        is_active AS "isActive", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM users 
      WHERE id = $1
    `, [id]);
    
    const updatedUser = updatedResult.rows[0];
    
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
    const existingResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const existingUser = existingResult.rows[0];
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );
    
    // Log the password reset
    await db.query(`
      INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'RESET_PASSWORD', 
      req.user.userId, 
      'USER', 
      id,
      `Password reset for user: ${existingUser.email}`
    ]);
    
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
    const existingResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const existingUser = existingResult.rows[0];
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }
    
    // Check if user has created sewadars
    const sewadarCountResult = await db.query(
      'SELECT COUNT(*) as count FROM sewadars WHERE created_by = $1', 
      [id]
    );
    const sewadarCount = sewadarCountResult.rows[0];
    
    if (parseInt(sewadarCount.count, 10) > 0) {
      throw new AppError(
        `Cannot delete user who has created ${sewadarCount.count} sewadar records. Please reassign or delete the records first.`,
        400
      );
    }
    
    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    // Log the deletion
    await db.query(`
      INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'DELETE_USER', 
      req.user.userId, 
      'USER', 
      id,
      `Deleted user: ${existingUser.email}`
    ]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

module.exports = router;
