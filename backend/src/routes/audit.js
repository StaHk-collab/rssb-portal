const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/audit-logs
router.get('/', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 50, 
      action = '', 
      userId = '',
      entity = '',
      search = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtering
    if (action) {
      whereClause += ' AND LOWER(a.action) LIKE ?';
      params.push(`%${action.toUpperCase()}%`);
    }
    if (userId) {
      whereClause += ' AND a.userId = ?';
      params.push(userId);
    }
    if (entity) {
      whereClause += ' AND a.entity = ?';
      params.push(entity);
    }
    if (search) {
      whereClause += ' AND (a.details LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }
    if (startDate) {
      whereClause += ' AND DATE(a.timestamp) >= DATE(?)';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(a.timestamp) <= DATE(?)';
      params.push(endDate);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`;
    const { total } = db.prepare(countQuery).get(...params);

    // Get paginated logs with user
    const auditQuery = `
      SELECT 
        a.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail,
        -- Add computed fullName for display convenience
        CASE
          WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL THEN u.firstName || ' ' || u.lastName
          WHEN u.firstName IS NOT NULL THEN u.firstName
          WHEN u.email IS NOT NULL THEN u.email
          ELSE 'Unknown User'
        END as userFullName
      FROM audit_logs a
      LEFT JOIN users u ON a.userId = u.id
      ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const auditLogs = db.prepare(auditQuery).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  })
);

/**
 * @swagger
 * /audit/stats:
 *   get:
 *     summary: Get audit statistics (Admin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 */
router.get('/stats', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    const stats = {
      totalActions: db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count,
      todaysActions: db.prepare(`
        SELECT COUNT(*) as count 
        FROM audit_logs 
        WHERE date(timestamp) = date('now')
      `).get().count,
      thisWeekActions: db.prepare(`
        SELECT COUNT(*) as count 
        FROM audit_logs 
        WHERE timestamp >= datetime('now', '-7 days')
      `).get().count,
      byAction: {},
      byUser: [],
      recentActions: db.prepare(`
        SELECT 
          a.*,
          u.firstName as userFirstName,
          u.lastName as userLastName,
          u.email as userEmail
        FROM audit_logs a
        LEFT JOIN users u ON a.userId = u.id
        ORDER BY a.timestamp DESC
        LIMIT 10
      `).all()
    };
    
    // Get action breakdown
    const actionStats = db.prepare(`
      SELECT action, COUNT(*) as count 
      FROM audit_logs 
      GROUP BY action 
      ORDER BY count DESC
    `).all();
    
    actionStats.forEach(row => {
      stats.byAction[row.action] = row.count;
    });
    
    // Get user activity stats
    stats.byUser = db.prepare(`
      SELECT 
        u.firstName,
        u.lastName,
        u.email,
        COUNT(a.id) as actionCount
      FROM users u
      LEFT JOIN audit_logs a ON u.id = a.userId
      WHERE u.isActive = 1
      GROUP BY u.id
      ORDER BY actionCount DESC
      LIMIT 10
    `).all();
    
    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;