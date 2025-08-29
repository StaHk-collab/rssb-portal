const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireEditor } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/*Field mapping middleware */
const mapSewadarFields = (req, res, next) => {
  if (req.body) {
    // Map frontend field names to backend field names
    if ('naamdanComplete' in req.body) {
      req.body.naamdanStatus = req.body.naamdanComplete;
      delete req.body.naamdanComplete;
    }
    
    console.log('📝 Mapped request body:', req.body); // Debug log
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Sewadar:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         age:
 *           type: integer
 *         verificationId:
 *           type: string
 *         verificationType:
 *           type: string
 *           enum: [AADHAR, PAN, OTHER]
 *         naamdanStatus:
 *           type: boolean
 *         naamdanId:
 *           type: string
 *         badgeId:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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
    
    // Build WHERE clause for filtering
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (search) {
      whereClause += ' AND (s.firstName LIKE ? OR s.lastName LIKE ? OR s.verificationId LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (naamdanStatus !== undefined && naamdanStatus !== '') {
      // Parse boolean query parameter correctly
      let statusValue;
      if (naamdanStatus === 'true' || naamdanStatus === 'Complete') {
        statusValue = 1;
      } else if (naamdanStatus === 'false' || naamdanStatus === 'Pending') {
        statusValue = 0;
      }
      
      if (statusValue !== undefined) {
        whereClause += ' AND s.naamdanStatus = ?';
        params.push(statusValue);
      }
    }
    
    if (verificationType) {
      whereClause += ' AND s.verificationType = ?';
      params.push(verificationType);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM sewadars s 
      ${whereClause}
    `;
    const { total } = db.prepare(countQuery).get(...params);
    
    // Get sewadars with creator information
    const sewadarsQuery = `
      SELECT 
        s.*,
        u.firstName as createdByFirstName,
        u.lastName as createdByLastName
      FROM sewadars s
      LEFT JOIN users u ON s.createdBy = u.id
      ${whereClause}
      ORDER BY s.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const sewadars = db.prepare(sewadarsQuery).all(...params, parseInt(limit), offset);
    
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
 *     tags: [Sewadars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Insufficient permissions
 */
const ExcelJS = require('exceljs');

router.get('/export', 
  authenticateToken,
  requireEditor, // This already includes ADMIN and EDITOR
  async (req, res) => {
    try {
      const db = getDatabase();
      
      const sewadars = db.prepare(`
        SELECT 
          s.id,
          s.firstName,
          s.lastName,
          s.age,
          s.verificationId,
          s.verificationType,
          s.naamdanStatus,
          s.naamdanId,
          s.badgeId,
          s.createdAt,
          s.updatedAt,
          u.firstName as createdByFirstName,
          u.lastName as createdByLastName
        FROM sewadars s
        LEFT JOIN users u ON s.createdBy = u.id
        ORDER BY s.createdAt DESC
      `).all();
      
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
 *     tags: [Sewadars]
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
 *         description: Sewadar retrieved successfully
 *       404:
 *         description: Sewadar not found
 */
router.get('/:id', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const sewadar = db.prepare(`
      SELECT 
        s.*,
        u.firstName as createdByFirstName,
        u.lastName as createdByLastName,
        u.email as createdByEmail
      FROM sewadars s
      LEFT JOIN users u ON s.createdBy = u.id
      WHERE s.id = ?
    `).get(id);
    
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
 *     tags: [Sewadars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               age:
 *                 type: integer
 *               verificationId:
 *                 type: string
 *               verificationType:
 *                 type: string
 *                 enum: [AADHAR, PAN, OTHER]
 *               naamdanStatus:
 *                 type: boolean
 *               naamdanId:
 *                 type: string
 *               badgeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sewadar created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', 
  authenticateToken,
  requireEditor,
  mapSewadarFields,
  validate('sewadarCreate'),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const sewadarId = uuidv4();

    console.log('📝 Creating sewadar with data:', req.body)
    
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
    
    // Data type conversion for SQLite compatibility
    const cleanData = {
      id: sewadarId,
      firstName: firstName || null,
      lastName: lastName || null,
      age: age ? parseInt(age) : null,
      verificationId: verificationId || null,
      verificationType: verificationType || null,
      naamdanStatus: naamdanStatus ? 1 : 0, // Convert boolean to integer
      naamdanId: naamdanId || null,
      badgeId: badgeId || null,
      createdBy: req.user.userId
    };
    
    // Insert new sewadar
    const insertStmt = db.prepare(`
      INSERT INTO sewadars (
        id, firstName, lastName, age, verificationId, verificationType,
        naamdanStatus, naamdanId, badgeId, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
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
    );
    
    // Log the creation
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      uuidv4(), 
      'CREATE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      sewadarId,
      `Created sewadar: ${firstName} ${lastName}`
    );
    
    // Fetch the created sewadar with creator info
    const createdSewadar = db.prepare(`
      SELECT 
        s.*,
        u.firstName as createdByFirstName,
        u.lastName as createdByLastName
      FROM sewadars s
      LEFT JOIN users u ON s.createdBy = u.id
      WHERE s.id = ?
    `).get(sewadarId);
    
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
 *     tags: [Sewadars]
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
 *               age:
 *                 type: integer
 *               verificationId:
 *                 type: string
 *               verificationType:
 *                 type: string
 *                 enum: [AADHAR, PAN, OTHER]
 *               naamdanStatus:
 *                 type: boolean
 *               naamdanId:
 *                 type: string
 *               badgeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sewadar updated successfully
 *       404:
 *         description: Sewadar not found
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
    const existingSewadar = db.prepare('SELECT * FROM sewadars WHERE id = ?').get(id);
    if (!existingSewadar) {
      throw new AppError('Sewadar not found', 404);
    }
    
    // Build dynamic update query with data type conversion
    const updates = [];
    const values = [];
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        
        // Convert data types for SQLite compatibility
        let value = req.body[key];
        if (key === 'naamdanStatus') {
          value = value ? 1 : 0; // Convert boolean to integer
        } else if (key === 'age') {
          value = value ? parseInt(value) : null;
        } else if (value === '') {
          value = null; // Convert empty strings to null
        }
        
        values.push(value);
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields provided for update', 400);
    }
    
    // Add updatedAt timestamp
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const updateQuery = `
      UPDATE sewadars 
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
      'UPDATE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      id,
      `Updated sewadar: ${existingSewadar.firstName} ${existingSewadar.lastName}`
    );
    
    // Fetch updated sewadar
    const updatedSewadar = db.prepare(`
      SELECT 
        s.*,
        u.firstName as createdByFirstName,
        u.lastName as createdByLastName
      FROM sewadars s
      LEFT JOIN users u ON s.createdBy = u.id
      WHERE s.id = ?
    `).get(id);
    
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
 *     tags: [Sewadars]
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
 *         description: Sewadar deleted successfully
 *       404:
 *         description: Sewadar not found
 */
router.delete('/:id', 
  authenticateToken,
  requireEditor,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // Check if sewadar exists
    const existingSewadar = db.prepare('SELECT * FROM sewadars WHERE id = ?').get(id);
    if (!existingSewadar) {
      throw new AppError('Sewadar not found', 404);
    }
    
    // Delete sewadar
    db.prepare('DELETE FROM sewadars WHERE id = ?').run(id);
    
    // Log the deletion
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      uuidv4(), 
      'DELETE_SEWADAR', 
      req.user.userId, 
      'SEWADAR', 
      id,
      `Deleted sewadar: ${existingSewadar.firstName} ${existingSewadar.lastName}`
    );
    
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
 *     tags: [Sewadars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats/summary', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    const stats = {
      total: db.prepare('SELECT COUNT(*) as count FROM sewadars').get().count,
      naamdanStatus: db.prepare('SELECT COUNT(*) as count FROM sewadars WHERE naamdanStatus = 1').get().count,
      naamdanPending: db.prepare('SELECT COUNT(*) as count FROM sewadars WHERE naamdanStatus = 0').get().count,
      byVerificationType: {},
      recentlyAdded: db.prepare(`
        SELECT COUNT(*) as count 
        FROM sewadars 
        WHERE createdAt >= datetime('now', '-30 days')
      `).get().count
    };
    
    // Get verification type breakdown
    const verificationTypes = db.prepare(`
      SELECT verificationType, COUNT(*) as count 
      FROM sewadars 
      WHERE verificationType IS NOT NULL 
      GROUP BY verificationType
    `).all();
    
    verificationTypes.forEach(row => {
      stats.byVerificationType[row.verificationType] = row.count;
    });
    
    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;