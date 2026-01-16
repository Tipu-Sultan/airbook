const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class SeatModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async findByFlightId(flightId, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      `
      SELECT 
        s.seat_id, s.seat_number, s.is_booked, s.seat_class_id,
        sc.class_name, sc.price_multiplier,
        f.flight_number, f.route_id, f.departure_time, f.arrival_time, f.total_seats, f.available_seats,
        r.departure_city, r.arrival_city, r.base_price
      FROM seats s 
      INNER JOIN flights f ON f.flight_id = s.flight_id
      INNER JOIN routes r ON f.route_id = r.route_id
      INNER JOIN seat_classes sc ON s.seat_class_id = sc.seat_class_id
      WHERE f.flight_id = ?
      `,
      [flightId]
    );

    if (!rows.length) {
      throw new NotFoundError('Flight or seats not found');
    }

    const flight = {
      flight_id: flightId,
      flight_number: rows[0].flight_number,
      route_id: rows[0].route_id,
      departure_city: rows[0].departure_city,
      arrival_city: rows[0].arrival_city,
      departure_time: rows[0].departure_time,
      arrival_time: rows[0].arrival_time,
      total_seats: rows[0].total_seats,
      available_seats: rows[0].available_seats,
      base_price: rows[0].base_price,
    };

    const seats = rows.map((row) => ({
      seat_id: row.seat_id,
      seat_number: row.seat_number,
      is_booked: row.is_booked,
      seat_class_id: row.seat_class_id,
      class_name: row.class_name,
      price_multiplier: row.price_multiplier,
    }));

    return { flight, seats };
  }

  async createSeats(flightId, totalSeats, seatClassMapping, connection = null) {
    const db = connection || this.pool;
    try {
      const seatValues = [];
      for (let i = 1; i <= totalSeats; i++) {
        const rowLetter = String.fromCharCode(65 + Math.floor((i - 1) / 10)); // A, B, C, ...
        const seatNumber = `${rowLetter}${i % 10 || 10}`; // A1, A2, ..., A10, B1, ...
        let seatClassId;

        // Assign seat class based on seat number
        if (seatNumber.match(/^A[1-9]|A10$/)) {
          seatClassId = seatClassMapping.First; // First Class (seat_class_id: 3)
        } else if (seatNumber.match(/^B[1-9]|B10$/)) {
          seatClassId = seatClassMapping.Business; // Business Class (seat_class_id: 2)
        } else {
          seatClassId = seatClassMapping.Economy; // Economy Class (seat_class_id: 1)
        }

        seatValues.push([flightId, seatClassId, seatNumber, false]);
      }
      if (seatValues.length > 0) {
        await db.query(
          `INSERT INTO seats (flight_id, seat_class_id, seat_number, is_booked) VALUES ?`,
          [seatValues]
        );
      }
      return seatValues.length;
    } catch (error) {
      throw error;
    }
  }

  async findAvailableByFlightIdAndSeatNumber(flightId, seatNumber, connection = null) {
    const db = connection || this.pool;
    const [seats] = await db.query(
      `
      SELECT s.seat_id, s.seat_number, s.is_booked, s.seat_class_id, sc.class_name, sc.price_multiplier
      FROM seats s
      INNER JOIN seat_classes sc ON s.seat_class_id = sc.seat_class_id
      WHERE s.flight_id =? AND s.seat_number =? AND s.is_booked = FALSE;
      `,
      [flightId, seatNumber]
    );
    if (!seats[0]) {
      throw new ConflictError('Seat is unavailable or does not exist');
    }
    return seats[0];
  }

  async updateBookingStatus(seatId, isBooked, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      'UPDATE seats SET is_booked = ? WHERE seat_id = ?',
      [isBooked, seatId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError('Seat not found');
    }
  }
}

module.exports = new SeatModel(pool);