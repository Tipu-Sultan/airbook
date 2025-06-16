const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class FlightModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async findAll({ routeId, date, page, pageSize }, connection = null) {
    const offset = (page - 1) * pageSize;
    let query = `
      SELECT f.*, r.departure_city, r.arrival_city, r.distance_km, r.base_price 
      FROM flights f
      INNER JOIN routes r ON f.route_id = r.route_id
    `;
    let countQuery = 'SELECT COUNT(*) AS total FROM flights f INNER JOIN routes r ON f.route_id = r.route_id';
    const params = [];
    const conditions = [];

    if (routeId) {
      conditions.push('f.route_id = ?');
      params.push(routeId);
    }
    if (date) {
      conditions.push('DATE(f.departure_time) = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const db = connection || this.pool;
    const [flights] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, params.slice(0, -2));

    return { flights, total: countResult[0].total };
  }

  async findById(id, connection = null) {
    const db = connection || this.pool;
    const [flights] = await db.query(
      `
      SELECT f.*, r.departure_city, r.arrival_city, r.distance_km, r.base_price 
      FROM flights f
      INNER JOIN routes r ON f.route_id = r.route_id
      WHERE f.flight_id = ?
      `,
      [id]
    );
    if (!flights[0]) {
      throw new NotFoundError('Flight not found');
    }
    return flights[0];
  }

  async create(flightData, connection = null) {
    const db = connection || this.pool;
    try {
      const [result] = await db.query(
        `INSERT INTO flights (flight_number, route_id, departure_time, arrival_time, total_seats, available_seats, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          flightData.flight_number,
          flightData.route_id,
          flightData.departure_time,
          flightData.arrival_time,
          flightData.total_seats,
          flightData.total_seats,
          flightData.created_at || new Date(),
        ]
      );
      return { flight_id: result.insertId };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Flight number already exists');
      }
      throw error;
    }
  }

  async updateAvailableSeats(flightId, increment, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      'UPDATE flights SET available_seats = GREATEST(available_seats + ?, 0) WHERE flight_id = ?',
      [increment, flightId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError('Flight not found');
    }
  }
}

module.exports = new FlightModel(pool);