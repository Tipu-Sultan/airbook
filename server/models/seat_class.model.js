const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class SeatClassModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async create({ className, priceMultiplier }, connection = null) {
    const db = connection || this.pool;
    try {
      const [result] = await db.query(
        'INSERT INTO seat_classes (class_name, price_multiplier) VALUES (?, ?)',
        [className, priceMultiplier]
      );
      return { seat_class_id: result.insertId, class_name: className, price_multiplier: priceMultiplier };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Seat class already exists');
      }
      throw error;
    }
  }

  async findById(seatClassId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query('SELECT * FROM seat_classes WHERE seat_class_id = ?', [seatClassId]);
    if (!rows[0]) {
      throw new NotFoundError('Seat class not found');
    }
    return rows[0];
  }

  async findByName(className, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query('SELECT * FROM seat_classes WHERE class_name = ?', [className]);
    if (!rows[0]) {
      throw new NotFoundError('Seat class not found');
    }
    return rows[0];
  }
}

module.exports = new SeatClassModel(pool);