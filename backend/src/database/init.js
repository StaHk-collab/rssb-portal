const { Pool } = require('pg');
const path = require('path');

// Use PostgreSQL instead of SQLite
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing PostgreSQL database...');

    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'VIEWER',
        isActive BOOLEAN DEFAULT TRUE,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sewadars table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sewadars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        age INTEGER,
        verificationId VARCHAR(255) UNIQUE NOT NULL,
        verificationType VARCHAR(100) NOT NULL,
        naamdanStatus BOOLEAN DEFAULT false,
        naamdanId VARCHAR(255) UNIQUE,
        badgeId VARCHAR(255) UNIQUE,
        createdBy UUID REFERENCES users(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        userId UUID REFERENCES users(id),
        entity VARCHAR(100),
        entityId UUID,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully');

    // Create default admin user if not exists
    const adminExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@rssb.org']
    );

    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (firstName, lastName, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin', 'User', 'admin@rssb.org', hashedPassword, 'ADMIN']);
      
      console.log('✅ Default admin user created');
    }

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

const getDatabase = () => pool;

module.exports = { initializeDatabase, getDatabase };
