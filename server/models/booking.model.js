const pool = require("../config/db");
const { NotFoundError } = require("../utils/errors");

class BookingModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async createGroup(data, connection = null) {
    const db = connection || this.pool;
    const query = `
      INSERT INTO bookings (booking_id, user_id, flight_id, total_price)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(query, [
      data.bookingId,
      data.userId,
      data.flightId,
      data.totalPrice
    ]);

    return {
      booking_id: data.bookingId,
      total_price: data.totalPrice,
      status: "pending",
    };
  }

  async createBookingSeat(data, connection = null) {
    const db = connection || this.pool;
    const query = `
      INSERT INTO booking_seats (booking_id, seat_id, seat_number, seat_class_id, price)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      data.bookingId,
      data.seatId,
      data.seatNumber,
      data.seatClassId,
      data.price,
    ]);
  }

  async getBookingSeats(bookingId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        bs.seat_id, bs.seat_number, bs.price,
        sc.class_name, sc.price_multiplier
      FROM booking_seats bs
      INNER JOIN seat_classes sc ON bs.seat_class_id = sc.seat_class_id
      WHERE bs.booking_id = ?
      `,
      [bookingId]
    );
    return rows.map((row) => ({
      seat_id: row.seat_id,
      seat_number: row.seat_number,
      class_name: row.class_name,
      price_multiplier: row.price_multiplier,
      price: row.price,
    }));
  }

  async findGroupByIdAndUserId(bookingId, userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.booking_date, b.status, b.total_price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      WHERE b.booking_id = ? AND b.user_id = ?
      `,
      [bookingId, userId]
    );

    if (!rows[0]) {
      throw new NotFoundError("Booking not found");
    }

    const seats = await this.getBookingSeats(bookingId, connection);

    return {
      booking: {
        booking_id: rows[0].booking_id,
        user_id: rows[0].user_id,
        flight_id: rows[0].flight_id,
        booking_date: rows[0].booking_date,
        status: rows[0].status,
        total_price: rows[0].total_price,
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
      seats,
    };
  }

  async findByUserId(userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.booking_date, b.status, b.total_price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
      `,
      [userId]
    );

    if (rows.length === 0) {
      throw new NotFoundError("No bookings found for this user");
    }

    const bookings = [];
    for (const row of rows) {
      const seats = await this.getBookingSeats(row.booking_id, connection);
      bookings.push({
        booking: {
          booking_id: row.booking_id,
          user_id: row.user_id,
          flight_id: row.flight_id,
          booking_date: row.booking_date,
          status: row.status,
          total_price: row.total_price,
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
        seats,
      });
    }

    return bookings;
  }

  async updateStatus(bookingId, status, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE booking_id = ?",
      [status, bookingId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError("Booking not found");
    }
  }

  async deleteByBookingId(bookingId, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      "DELETE FROM bookings WHERE booking_id = ?",
      [bookingId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError("Booking not found");
    }
  }

  async findByIdForCancellation(bookingId, userId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
        `
      SELECT 
        b.booking_id, b.user_id, b.flight_id, b.booking_date, b.status, b.total_price,
        u.first_name, u.last_name, u.email,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time,
        r.departure_city, r.arrival_city, r.base_price
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.user_id
      INNER JOIN flights f ON b.flight_id = f.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      WHERE b.booking_id = ? AND b.user_id = ? AND b.status = 'confirmed'
      `,
        [bookingId, userId]
      );

    if (!rows[0]) {
      throw new NotFoundError(
        "Booking not found or not eligible for cancellation"
      );
    }

    const seats = await this.getBookingSeats(bookingId, connection);

    return {
      booking: {
        booking_id: rows[0].booking_id,
        user_id: rows[0].user_id,
        flight_id: rows[0].flight_id,
        booking_date: rows[0].booking_date,
        status: rows[0].status,
        total_price: rows[0].total_price,
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
      seats,
    };
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
      throw new NotFoundError("Booking not found");
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
