const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireEditor } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/* Field mapping middleware */
const mapSewadarFields = (req, res, next) => {
  if (req.body) {
    // Map frontend field names to backend field names
    if ('naamdanComplete' in req.body) {
      req.body.naamdanStatus = req.body.naamdanComplete;
      delete req.body.naamdanComplete;
    }
    
    console.log('📝 Mapped request body:', req.body);
  }
  next();
};

/**
 * @swagger
 * /sewadars:
 *   get:
 *     summary: Get all sewadars
 *     tags: [Sewadars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: naamdanStatus
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of sewadars retrieved successfully
 */
router.get('/', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      naamdanStatus,
      verificationType 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    // Build WHERE clause for filtering with proper PostgreSQL parameters
    if (search) {
      whereClause += ` AND (s.firstname LIKE $${paramIndex} OR s.lastname LIKE $${paramIndex + 1} OR s.verificationid LIKE $${paramIndex + 2})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 3;
    }
    
    if (naamdanStatus !== undefined && naamdanStatus !== '') {
      let statusValue;
      if (naamdanStatus === 'true' || naamdanStatus === 'Complete') {
        statusValue = true;
      } else if (naamdanStatus === 'false' || naamdanStatus === 'Pending') {
        statusValue = false;
      }
      
      if (statusValue !== undefined) {
        whereClause += ` AND s.naamdanstatus = $${paramIndex}`;
        params.push(statusValue);
        paramIndex++;
      }
    }
    
    if (verificationType) {
      whereClause += ` AND s.verificationtype = $${paramIndex}`;
      params.push(verificationType);
      paramIndex++;
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM sewadars s 
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);
    
    // Get sewadars with creator information
    const sewadarsQuery = `
      SELECT 
        s.*,
        s.firstname AS "firstName",
        s.lastname AS "lastName",
        s.verificationid AS "verificationId",
        s.verificationtype AS "verificationType",
        s.naamdanstatus AS "naamdanStatus",
        s.naamdanid AS "naamdanId",
        s.badgeid AS "badgeId",
        s.createdby AS "createdBy",
        s.createdat AS "createdAt",
        s.updatedat AS "updatedAt",
        u.firstname AS "createdByFirstName",
        u.lastname AS "createdByLastName"
      FROM sewadars s
      LEFT JOIN users u ON s.createdby = u.id
      ${whereClause}
      ORDER BY s.createdat DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const sewadarsResult = await db.query(sewadarsQuery, [...params, parseInt(limit), offset]);
    const sewadars = sewadarsResult.rows;
    
    res.json({
      success: true,
      data: sewadars,
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
 * /sewadars/export:
 *   get:
 *     summary: Export all sewadars to Excel (Admin/Editor only)
 */
const ExcelJS = require('exceljs');

router.get('/export', 
  authenticateToken,
  requireEditor,
  async (req, res) => {
    try {
      const db = getDatabase();
      
      const sewadarsResult = await db.query(`
        SELECT 
          s.id,
          s.firstname AS "firstName",
          s.lastname AS "lastName",
          s.age,
          s.verificationid AS "verificationId",
          s.verificationtype AS "verificationType",
          s.naamdanstatus AS "naamdanStatus",
          s.naamdanid AS "naamdanId",
          s.badgeid AS "badgeId",
          s.createdat AS "createdAt",
          s.updatedat AS "updatedAt",
          u.firstname AS "createdByFirstName",
          u.lastname AS "createdByLastName"
        FROM sewadars s
        LEFT JOIN users u ON s.createdby = u.id
        ORDER BY s.createdat DESC
      `);
      const sewadars = sewadarsResult.rows;
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sewadars Data');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Verification Type', key: 'verificationType', width: 20 },
        { header: 'Verification ID', key: 'verificationId', width: 25 },
        { header: 'Naamdan Status', key: 'naamdanStatus', width: 15 },
        { header: 'Naamdan ID', key: 'naamdanId', width: 20 },
        { header: 'Badge ID', key: 'badgeId', width: 20 },
        { header: 'Created By', key: 'createdBy', width: 25 },
        { header: 'Created Date', key: 'createdAt', width: 20 }
      ];
      
      sewadars.forEach(sewadar => {
        worksheet.addRow({
          id: sewadar.id,
          firstName: sewadar.firstName,
          lastName: sewadar.lastName,
          age: sewadar.age,
          verificationType: sewadar.verificationType,
          verificationId: sewadar.verificationId,
          naamdanStatus: sewadar.naamdanStatus ? 'Complete' : 'Pending',
          naamdanId: sewadar.naamdanId,
          badgeId: sewadar.badgeId,
          createdBy: sewadar.createdByFirstName && sewadar.createdByLastName 
            ? `${sewadar.createdByFirstName} ${sewadar.createdByLastName}` 
            : 'Unknown',
          createdAt: new Date(sewadar.createdAt).toLocaleDateString()
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sewadars_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
      
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        message: 'Export failed'
      });
    }
  }
);

/**
 * @swagger
 * /sewadars/{id}:
 *   get:
 *     summary: Get sewadar by ID
 */
router.get('/:id', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const sewadarResult = await db.query(`
      SELECT 
        s.*,
        s.firstname AS "firstName",
        s.lastname AS "lastName",
        s.verificationid AS "verificationId",
        s.verificationtype AS "verificationType",
        s.naamdanstatus AS "naamdanStatus",
        s.naamdanid AS "naamdanId",
        s.badgeid AS "badgeId",
        s.createdby AS "createdBy",
        s.createdat AS "createdAt",
        s.updatedat AS "updatedAt",
        u.firstname AS "createdByFirstName",
        u.lastname AS "createdByLastName",
        u.email AS "createdByEmail"
      FROM sewadars s
      LEFT JOIN users u ON s.createdby = u.id
      WHERE s.id = $1
    `, [id]);
    
    const sewadar = sewadarResult.rows[0];
    
    if (!sewadar) {
      return res.status(404).json({
        success: false,
        message: 'Sewadar not found'
      });
    }
    
    res.json({
      success: true,
      data: sewadar
    });
  })
);

/**
 * @swagger
 * /sewadars:
 *   post:
 *     summary: Create new sewadar
 */
router.post('/', 
  authenticateToken,
  requireEditor,
  mapSewadarFields,
  validate('sewadarCreate'),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const sewadarId = uuidv4();

    console.log('📝 Creating sewadar with data:', req.body);
    
    const {
      firstName,
      lastName,
      age,
      verificationId,
      verificationType,
      naamdanStatus,
      naamdanId,
      badgeId
    } = req.body;
    
    // Data conversion for PostgreSQL compatibility
    const cleanData = {
      id: sewadarId,
      firstName: firstName || null,
      lastName: lastName || null,
      age: age ? parseInt(age) : null,
      verificationId: verificationId || null,
      verificationType: verificationType || null,
      naamdanStatus: Boolean(naamdanStatus),
      naamdanId: naamdanId || null,
      badgeId: badgeId || null,
      createdBy: req.user.userId
    };
    
    // Insert new sewadar
    await db.query(`
      INSERT INTO sewadars (
        id, firstname, lastname, age, verificationid, verificationtype,
        naamdanstatus, naamdanid, badgeid, createdby
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      cleanData.id,
      cleanData.firstName,
      cleanData.lastName,
      cleanData.age,
      cleanData.verificationId,
      cleanData.verificationType,
      cleanData.naamdanStatus,
      cleanData.naamdanId,
      cleanData.badgeId,
      cleanData.createdBy
    ]);
    
    // Log the creation
    await db.query(`
      INSERT INTO audit_logs (id, action, userid, entity, entityid, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'CREATE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      sewadarId,
      `Created sewadar: ${firstName} ${lastName}`
    ]);
    
    // Fetch the created sewadar with creator info
    const createdResult = await db.query(`
      SELECT 
        s.*,
        s.firstname AS "firstName",
        s.lastname AS "lastName",
        s.verificationid AS "verificationId",
        s.verificationtype AS "verificationType",
        s.naamdanstatus AS "naamdanStatus",
        s.naamdanid AS "naamdanId",
        s.badgeid AS "badgeId",
        s.createdby AS "createdBy",
        s.createdat AS "createdAt",
        s.updatedat AS "updatedAt",
        u.firstname AS "createdByFirstName",
        u.lastname AS "createdByLastName"
      FROM sewadars s
      LEFT JOIN users u ON s.createdby = u.id
      WHERE s.id = $1
    `, [sewadarId]);
    
    const createdSewadar = createdResult.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Sewadar created successfully',
      data: createdSewadar
    });
  })
);

/**
 * @swagger
 * /sewadars/{id}:
 *   put:
 *     summary: Update sewadar
 */
router.put('/:id', 
  authenticateToken,
  requireEditor,
  mapSewadarFields,
  validate('sewadarUpdate'),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // Check if sewadar exists
    const existingResult = await db.query('SELECT * FROM sewadars WHERE id = $1', [id]);
    const existingSewadar = existingResult.rows[0];
    
    if (!existingSewadar) {
      throw new AppError('Sewadar not found', 404);
    }
    
    // Build dynamic update query with PostgreSQL parameter conversion
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    // Map camelCase to snake_case and handle data type conversions
    const fieldMap = {
      firstName: 'firstname',
      lastName: 'lastname',
      age: 'age',
      verificationId: 'verificationid',
      verificationType: 'verificationtype',
      naamdanStatus: 'naamdanstatus',
      naamdanId: 'naamdanid',
      badgeId: 'badgeid'
    };
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && fieldMap[key]) {
        const dbColumn = fieldMap[key];
        updates.push(`${dbColumn} = $${paramIndex}`);
        
        // Convert data types for PostgreSQL compatibility
        let value = req.body[key];
        if (key === 'naamdanStatus') {
          value = Boolean(value);
        } else if (key === 'age') {
          value = value ? parseInt(value) : null;
        } else if (value === '') {
          value = null;
        }
        
        values.push(value);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields provided for update', 400);
    }
    
    // Add updatedAt timestamp and id parameter
    updates.push(`updatedat = NOW()`);
    values.push(id);
    
    const updateQuery = `
      UPDATE sewadars 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;
    
    await db.query(updateQuery, values);
    
    // Log the update
    await db.query(`
      INSERT INTO audit_logs (id, action, userid, entity, entityid, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'UPDATE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      id,
      `Updated sewadar: ${existingSewadar.firstname} ${existingSewadar.lastname}`
    ]);
    
    // Fetch updated sewadar
    const updatedResult = await db.query(`
      SELECT 
        s.*,
        s.firstname AS "firstName",
        s.lastname AS "lastName",
        s.verificationid AS "verificationId",
        s.verificationtype AS "verificationType",
        s.naamdanstatus AS "naamdanStatus",
        s.naamdanid AS "naamdanId",
        s.badgeid AS "badgeId",
        s.createdby AS "createdBy",
        s.createdat AS "createdAt",
        s.updatedat AS "updatedAt",
        u.firstname AS "createdByFirstName",
        u.lastname AS "createdByLastName"
      FROM sewadars s
      LEFT JOIN users u ON s.createdby = u.id
      WHERE s.id = $1
    `, [id]);
    
    const updatedSewadar = updatedResult.rows[0];
    
    res.json({
      success: true,
      message: 'Sewadar updated successfully',
      data: updatedSewadar
    });
  })
);

/**
 * @swagger
 * /sewadars/{id}:
 *   delete:
 *     summary: Delete sewadar
 */
router.delete('/:id', 
  authenticateToken,
  requireEditor,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // Check if sewadar exists
    const existingResult = await db.query('SELECT * FROM sewadars WHERE id = $1', [id]);
    const existingSewadar = existingResult.rows[0];
    
    if (!existingSewadar) {
      throw new AppError('Sewadar not found', 404);
    }
    
    // Delete sewadar
    await db.query('DELETE FROM sewadars WHERE id = $1', [id]);
    
    // Log the deletion
    await db.query(`
      INSERT INTO audit_logs (id, action, userid, entity, entityid, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(), 
      'DELETE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      id,
      `Deleted sewadar: ${existingSewadar.firstname} ${existingSewadar.lastname}`
    ]);
    
    res.json({
      success: true,
      message: 'Sewadar deleted successfully'
    });
  })
);

/**
 * @swagger
 * /sewadars/stats/summary:
 *   get:
 *     summary: Get sewadar statistics
 */
router.get('/stats/summary', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    // Get total count
    const totalResult = await db.query('SELECT COUNT(*) as count FROM sewadars');
    const total = parseInt(totalResult.rows[0].count, 10);
    
    // Get naamdan complete count
    const completedResult = await db.query('SELECT COUNT(*) as count FROM sewadars WHERE naamdanstatus = TRUE');
    const naamdanStatus = parseInt(completedResult.rows[0].count, 10);
    
    // Get naamdan pending count
    const pendingResult = await db.query('SELECT COUNT(*) as count FROM sewadars WHERE naamdanstatus = FALSE');
    const naamdanPending = parseInt(pendingResult.rows[0].count, 10);
    
    // Get recently added count
    const recentResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM sewadars 
      WHERE createdat >= NOW() - INTERVAL '30 days'
    `);
    const recentlyAdded = parseInt(recentResult.rows[0].count, 10);
    
    // Get verification type breakdown
    const verificationResult = await db.query(`
      SELECT verificationtype, COUNT(*) as count 
      FROM sewadars 
      WHERE verificationtype IS NOT NULL 
      GROUP BY verificationtype
    `);
    
    const byVerificationType = {};
    verificationResult.rows.forEach(row => {
      byVerificationType[row.verificationtype] = parseInt(row.count, 10);
    });
    
    const stats = {
      total,
      naamdanStatus,
      naamdanPending,
      byVerificationType,
      recentlyAdded
    };
    
    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;
