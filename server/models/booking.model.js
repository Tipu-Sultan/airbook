const pool = require('../config/db');
const { NotFoundError } = require('../utils/errors');

class BookingModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async findByIdAndUserId(bookingId, userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.seat_id, b.seat_number, b.seat_class_id, b.booking_date, b.status, b.price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price,
        sc.class_name, sc.price_multiplier,
        s.seat_number AS seat_number_from_seats
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      INNER JOIN seats s ON b.seat_id = s.seat_id
      INNER JOIN seat_classes sc ON b.seat_class_id = sc.seat_class_id
      WHERE b.booking_id = ? AND b.user_id = ?
      `,
      [bookingId, userId]
    );

    if (!rows[0]) {
      throw new NotFoundError('Booking not found');
    }

    return {
      booking: {
        booking_id: rows[0].booking_id,
        user_id: rows[0].user_id,
        flight_id: rows[0].flight_id,
        seat_id: rows[0].seat_id,
        seat_number: rows[0].seat_number,
        seat_class_id: rows[0].seat_class_id,
        booking_date: rows[0].booking_date,
        status: rows[0].status,
        price: rows[0].price,
      },
      user: {
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
      },
      flight: {
        flight_number: rows[0].flight_number,
        route_id: rows[0].route_id,
        departure_city: rows[0].departure_city,
        arrival_city: rows[0].arrival_city,
        departure_time: rows[0].departure_time,
        arrival_time: rows[0].arrival_time,
        base_price: rows[0].base_price,
      },
      seat: {
        seat_number: rows[0].seat_number_from_seats,
        class_name: rows[0].class_name,
        price_multiplier: rows[0].price_multiplier,
      },
    };
  }

  async findByUserId(userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.seat_id, b.seat_number, b.seat_class_id, b.booking_date, b.status, b.price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price,
        sc.class_name, sc.price_multiplier,
        s.seat_number AS seat_number_from_seats
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      INNER JOIN seats s ON b.seat_id = s.seat_id
      INNER JOIN seat_classes sc ON b.seat_class_id = sc.seat_class_id
      WHERE b.user_id = ?
      `,
      [userId]
    );

    return rows.map((row) => ({
      booking: {
        booking_id: row.booking_id,
        user_id: row.user_id,
        flight_id: row.flight_id,
        seat_id: row.seat_id,
        seat_number: row.seat_number,
        seat_class_id: row.seat_class_id,
        booking_date: row.booking_date,
        status: row.status,
        price: row.price,
      },
      user: {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      },
      flight: {
        flight_number: row.flight_number,
        route_id: row.route_id,
        departure_city: row.departure_city,
        arrival_city: row.arrival_city,
        departure_time: row.departure_time,
        arrival_time: row.arrival_time,
        base_price: row.base_price,
      },
      seat: {
        seat_number: row.seat_number_from_seats,
        class_name: row.class_name,
        price_multiplier: row.price_multiplier,
      },
    }));
  }

  async create(booking, connection = null) {
    const db = connection || this.pool;
    const query = `
      INSERT INTO bookings (booking_id, user_id, flight_id, seat_id, seat_number, seat_class_id, booking_date, status, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      booking.bookingId,
      booking.userId,
      booking.flightId,
      booking.seatId,
      booking.seatNumber,
      booking.seatClassId,
      new Date(),
      booking.status || 'pending',
      booking.price,
    ]);
    return {
      booking_id: booking.bookingId,
      user_id: booking.userId,
      flight_id: booking.flightId,
      seat_id: booking.seatId,
      seat_number: booking.seatNumber,
      seat_class_id: booking.seatClassId,
      booking_date: new Date(),
      status: booking.status || 'pending',
      price: booking.price,
    };
  }

  async findByIdForCancellation(bookingId, userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.seat_id, b.seat_number, b.seat_class_id, b.booking_date, b.status, b.price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price,
        sc.class_name, sc.price_multiplier,
        s.seat_number AS seat_number_from_seats
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      INNER JOIN seats s ON b.seat_id = s.seat_id
      INNER JOIN seat_classes sc ON b.seat_class_id = sc.seat_class_id
      WHERE b.booking_id = ? AND b.user_id = ? AND b.status = 'confirmed'
      `,
      [bookingId, userId]
    );
    if (!rows[0]) {
      throw new NotFoundError('Booking not found or not eligible for cancellation');
    }
    return {
      booking: {
        booking_id: rows[0].booking_id,
        user_id: rows[0].user_id,
        flight_id: rows[0].flight_id,
        seat_id: rows[0].seat_id,
        seat_number: rows[0].seat_number,
        seat_class_id: rows[0].seat_class_id,
        booking_date: rows[0].booking_date,
        status: rows[0].status,
        price: rows[0].price,
      },
      user: {
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
      },
      flight: {
        flight_number: rows[0].flight_number,
        route_id: rows[0].route_id,
        departure_city: rows[0].departure_city,
        arrival_city: rows[0].arrival_city,
        departure_time: rows[0].departure_time,
        arrival_time: rows[0].arrival_time,
        base_price: rows[0].base_price,
      },
      seat: {
        seat_number: rows[0].seat_number_from_seats,
        class_name: rows[0].class_name,
        price_multiplier: rows[0].price_multiplier,
      },
    };
  }

  async updateStatus(bookingId, status, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, bookingId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError('Booking not found');
    }
  }

  async deleteByBookingId(bookingId, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      'DELETE FROM bookings WHERE booking_id = ?',
      [bookingId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError('Booking not found');
    }
  }

  async findById(bookingId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.seat_id, b.seat_number, b.seat_class_id, b.booking_date, b.status, b.price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price,
        sc.class_name, sc.price_multiplier,
        s.seat_number AS seat_number_from_seats
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      INNER JOIN seats s ON b.seat_id = s.seat_id
      INNER JOIN seat_classes sc ON b.seat_class_id = sc.seat_class_id
      WHERE b.booking_id = ?
      `,
      [bookingId]
    );

    if (!rows[0]) {
      throw new NotFoundError('Booking not found');
    }

    return {
      booking: {
        booking_id: rows[0].booking_id,
        user_id: rows[0].user_id,
        flight_id: rows[0].flight_id,
        seat_id: rows[0].seat_id,
        seat_number: rows[0].seat_number,
        seat_class_id: rows[0].seat_class_id,
        booking_date: rows[0].booking_date,
        status: rows[0].status,
        price: rows[0].price,
      },
      user: {
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
      },
      flight: {
        flight_number: rows[0].flight_number,
        route_id: rows[0].route_id,
        departure_city: rows[0].departure_city,
        arrival_city: rows[0].arrival_city,
        departure_time: rows[0].departure_time,
        arrival_time: rows[0].arrival_time,
        base_price: rows[0].base_price,
      },
      seat: {
        seat_number: rows[0].seat_number_from_seats,
        class_name: rows[0].class_name,
        price_multiplier: rows[0].price_multiplier,
      },
    };
  }
}

module.exports = new BookingModel(pool);