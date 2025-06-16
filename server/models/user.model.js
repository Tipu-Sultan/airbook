const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { ConflictError, NotFoundError } = require('../utils/errors');

class UserModel {
  constructor(dbPool) {
    this.pool = dbPool;
    this.bcrypt = bcrypt;
  }

  async create({ userId,email, password, firstName, lastName }, connection = null) {
    const db = connection || this.pool;
    try {
      const hashedPassword = await this.bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (user_id, email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId,email, hashedPassword, firstName, lastName, new Date()]
      );
      return {
        user_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date(),
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  async findByEmail(email, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      'SELECT user_id, email, password, first_name, last_name, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  async findById(userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      'SELECT user_id, email, first_name, last_name, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    if (!rows[0]) {
      throw new NotFoundError('User not found');
    }
    return rows[0];
  }
}

module.exports = new UserModel(pool);