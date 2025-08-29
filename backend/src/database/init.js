const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let db;

/**
 * Initialize database connection and create tables
 */
async function initializeDatabase() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(process.env.DATABASE_URL || './database/sewadar.db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    db = new Database(process.env.DATABASE_URL || './database/sewadar.db');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    createTables();
    
    // Seed initial data if tables are empty
    await seedInitialData();
    
    logger.info('Database initialized successfully');
    return db;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create all required database tables
 */
function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sewadars table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sewadars (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      age INTEGER,
      verificationId TEXT,
      verificationType TEXT CHECK (verificationType IN ('AADHAR', 'PAN', 'VOTER_ID', 'PASSPORT')),
      naamdanStatus BOOLEAN DEFAULT 0,
      naamdanId TEXT,
      badgeId TEXT,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      userId TEXT NOT NULL,
      entity TEXT NOT NULL,
      entityId TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sewadars_created_by ON sewadars(createdBy)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(userId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp)`);
}

/**
 * Seed initial data for development and testing
 */
async function seedInitialData() {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  // Check if users already exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    logger.info('Database already seeded, skipping initial data creation');
    return;
  }

  logger.info('Seeding initial database data...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const editorPassword = await bcrypt.hash('editor123', 12);
  const viewerPassword = await bcrypt.hash('viewer123', 12);

  // Create initial users
  const users = [
    {
      id: uuidv4(),
      email: 'admin@rssb.org',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    },
    {
      id: uuidv4(),
      email: 'editor@rssb.org',
      password: editorPassword,
      firstName: 'Editor',
      lastName: 'User',
      role: 'EDITOR'
    },
    {
      id: uuidv4(),
      email: 'viewer@rssb.org',
      password: viewerPassword,
      firstName: 'Viewer',
      lastName: 'User',
      role: 'VIEWER'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, firstName, lastName, role, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  users.forEach(user => {
    insertUser.run(user.id, user.email, user.password, user.firstName, user.lastName, user.role, 1);
  });

  const insertSewadar = db.prepare(`
    INSERT INTO sewadars (id, firstName, lastName, age, verificationId, verificationType, 
                         naamdanStatus, naamdanId, badgeId, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sewadars.forEach(sewadar => {
    insertSewadar.run(
      sewadar.id, sewadar.firstName, sewadar.lastName, sewadar.age,
      sewadar.verificationId, sewadar.verificationType, sewadar.naamdanStatus,
      sewadar.naamdanId, sewadar.badgeId, sewadar.createdBy
    );
  });

  // Create initial audit log entries
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, action, userId, entity, entityId, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(uuidv4(), 'SEED_DATA', adminUserId, 'SYSTEM', null, 'Initial database seeding completed');

  logger.info(`Seeded ${users.length} users and ${sewadars.length} sewadars`);
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    logger.info('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};