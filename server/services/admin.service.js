// services/admin.service.js
const FlightModel = require('../models/flight.model');
const SeatModel = require('../models/seat.model');
const RouteModel = require('../models/route.model');
const SeatClassModel = require('../models/seat_class.model');
const BookingModel = require('../models/booking.model');
const UserModel = require('../models/user.model'); // Assume you have this
const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class AdminService {
  async getFlightStats() {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) AS total_flights,
      COUNT(DISTINCT r.route_id) AS total_routes
    FROM flights f
    INNER JOIN routes r ON f.route_id = r.route_id
  `);
  return rows[0]; // { total_flights: X, total_routes: Y }
}

  async addFlight(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create flight
      const flightResult = await FlightModel.create(data, connection);
      const flightId = flightResult.flight_id;

      // Get seat class IDs (assume names are fixed)
      const economy = await SeatClassModel.findByName('Economy', connection);
      const business = await SeatClassModel.findByName('Business', connection);
      const first = await SeatClassModel.findByName('First', connection);

      const seatClassMapping = {
        Economy: economy.seat_class_id,
        Business: business.seat_class_id,
        First: first.seat_class_id,
      };

      // Create seats
      await SeatModel.createSeats(flightId, data.total_seats, seatClassMapping, connection);

      await connection.commit();

      return await FlightModel.findById(flightId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateFlight(id, data) {
    // Basic update (you can expand)
    const [result] = await pool.query(
      `UPDATE flights SET flight_number = ?, route_id = ?, departure_time = ?, arrival_time = ?, total_seats = ? WHERE flight_id = ?`,
      [data.flight_number, data.route_id, data.departure_time, data.arrival_time, data.total_seats, id]
    );
    if (result.affectedRows === 0) throw new NotFoundError('Flight not found');
    return await FlightModel.findById(id);
  }

  async deleteFlight(id) {
    const [result] = await pool.query('DELETE FROM flights WHERE flight_id = ?', [id]);
    if (result.affectedRows === 0) throw new NotFoundError('Flight not found');
  }

  async getAllRoutes() {
    return await RouteModel.findAll();
  }

  async addRoute(data) {
    return await RouteModel.create(data);
  }

  async updateRoute(id, data) {
    const [result] = await pool.query(
      `UPDATE routes SET departure_city = ?, arrival_city = ?, distance_km = ?, base_price = ? WHERE route_id = ?`,
      [data.departure_city, data.arrival_city, data.distance_km, data.base_price, id]
    );
    if (result.affectedRows === 0) throw new NotFoundError('Route not found');
    return { route_id: id, ...data };
  }

  async deleteRoute(id) {
    const [result] = await pool.query('DELETE FROM routes WHERE route_id = ?', [id]);
    if (result.affectedRows === 0) throw new NotFoundError('Route not found');
  }

  async getAllUsers() {
    const [rows] = await pool.query('SELECT user_id, email, first_name, last_name, created_at FROM users');
    return rows;
  }

  async getAllBookings() {
    const bookings = await BookingModel.findAll(); // You need to add findAll in BookingModel
    return bookings;
  }

  async deleteBooking(bookingId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await BookingModel.deleteByBookingId(bookingId, connection);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async getAllSeatClasses() {
    const [rows] = await pool.query('SELECT * FROM seat_classes');
    return rows;
  }
}

module.exports = new AdminService();