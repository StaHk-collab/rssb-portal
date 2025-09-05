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
    let paramIndex = 1;

    // ✅ FIXED: Build dynamic WHERE clause with proper PostgreSQL parameters
    // if (action) {
    //   whereClause += ` AND LOWER(a.action) LIKE $${paramIndex}`;
    //   params.push(`%${action.toUpperCase()}%`);
    //   paramIndex++;
    // }
    // if (action) {
    //   const actions = action.split(',').map(s => s.trim().toUpperCase());
    //   whereClause += ` AND a.action = ANY($${paramIndex})`;
    //   params.push(actions);
    //   paramIndex++;
    // }
    if (action) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM unnest(string_to_array($${paramIndex}, ',')) AS act(action) 
        WHERE a.action ILIKE '%' || trim(act.action) || '%'
      )`;
      params.push(action.toUpperCase());
      paramIndex++;
    }
    if (userId) {
      whereClause += ` AND a.userid = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    if (entity) {
      whereClause += ` AND a.entity = $${paramIndex}`;
      params.push(entity);
      paramIndex++;
    }
    if (search) {
      whereClause += ` AND (a.details LIKE $${paramIndex} OR u.firstname LIKE $${paramIndex + 1} OR u.lastname LIKE $${paramIndex + 2})`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
      paramIndex += 3;
    }
    if (startDate) {
      whereClause += ` AND a.timestamp::date >= $${paramIndex}::date`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND a.timestamp::date <= $${paramIndex}::date`;
      params.push(endDate);
      paramIndex++;
    }

    // ✅ FIXED: Get total count with proper column names
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // ✅ FIXED: Get paginated logs with proper column names and parameters
    const auditQuery = `
      SELECT 
        a.*,
        u.firstname AS "userFirstName",
        u.lastname AS "userLastName",
        u.email AS "userEmail",
        CASE
          WHEN u.firstname IS NOT NULL AND u.lastname IS NOT NULL THEN u.firstname || ' ' || u.lastname
          WHEN u.firstname IS NOT NULL THEN u.firstname
          WHEN u.email IS NOT NULL THEN u.email
          ELSE 'Unknown User'
        END AS "userFullName"
      FROM audit_logs a
      LEFT JOIN users u ON a.userid = u.id
      ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const auditResult = await db.query(auditQuery, [...params, parseInt(limit), offset]);
    const auditLogs = auditResult.rows;

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

// GET /api/audit-logs/stats
router.get('/stats', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    const stats = {};

    // ✅ FIXED: All stats queries converted to PostgreSQL
    const totalResult = await db.query('SELECT COUNT(*) AS count FROM audit_logs');
    stats.totalActions = parseInt(totalResult.rows[0].count, 10);

    const todayResult = await db.query(`
      SELECT COUNT(*) AS count 
      FROM audit_logs 
      WHERE timestamp::date = CURRENT_DATE
    `);
    stats.todaysActions = parseInt(todayResult.rows[0].count, 10);

    const weekResult = await db.query(`
      SELECT COUNT(*) AS count 
      FROM audit_logs 
      WHERE timestamp >= NOW() - INTERVAL '7 days'
    `);
    stats.thisWeekActions = parseInt(weekResult.rows[0].count, 10);

    // Initialize containers
    stats.byAction = {};
    stats.byUser = [];

    // Recent 10 actions with user info
    const recentResult = await db.query(`
      SELECT 
        a.*,
        u.firstname AS "userFirstName",
        u.lastname AS "userLastName",
        u.email AS "userEmail"
      FROM audit_logs a
      LEFT JOIN users u ON a.userid = u.id
      ORDER BY a.timestamp DESC
      LIMIT 10
    `);
    stats.recentActions = recentResult.rows;

    // Actions grouped by type
    const actionResult = await db.query(`
      SELECT action, COUNT(*) AS count 
      FROM audit_logs 
      GROUP BY action 
      ORDER BY count DESC
    `);

    actionResult.rows.forEach(row => {
      stats.byAction[row.action] = parseInt(row.count, 10);
    });

    // User activity stats
    const userResult = await db.query(`
      SELECT 
        u.firstname,
        u.lastname,
        u.email,
        COUNT(a.id) AS "actionCount"
      FROM users u
      LEFT JOIN audit_logs a ON u.id = a.userid
      WHERE u.isActive = TRUE
      GROUP BY u.id, u.firstname, u.lastname, u.email
      ORDER BY "actionCount" DESC
      LIMIT 10
    `);
    stats.byUser = userResult.rows;
    
    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;