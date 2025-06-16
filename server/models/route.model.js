const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class RouteModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async create({ departureCity, arrivalCity, distanceKm, basePrice }, connection = null) {
    const db = connection || this.pool;
    try {
      const [result] = await db.query(
        'INSERT INTO routes (departure_city, arrival_city, distance_km, base_price) VALUES (?, ?, ?, ?)',
        [departureCity, arrivalCity, distanceKm, basePrice]
      );
      return { route_id: result.insertId, departure_city: departureCity, arrival_city: arrivalCity, distance_km: distanceKm, base_price: basePrice };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Route already exists');
      }
      throw error;
    }
  }

  async findByCities(departureCity, arrivalCity, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      'SELECT * FROM routes WHERE departure_city = ? AND arrival_city = ?',
      [departureCity, arrivalCity]
    );
    if (!rows[0]) {
      throw new NotFoundError('Route not found');
    }
    return rows[0];
  }

  async findAll(connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query('SELECT * FROM routes');
    return rows;
  }
}

module.exports = new RouteModel(pool);