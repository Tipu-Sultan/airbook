const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const flightService = require('../services/flight.service');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/db');

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await userService.register(email, password, firstName, lastName);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get('/flights', async (req, res) => {
  try {
    const { departureCity, arrivalCity, date, page = 1 } = req.query;
    const pageSize = 20;
    const result = await flightService.getFlights(departureCity, arrivalCity, date, parseInt(page), pageSize);
    res.json({
      flights: result.flights,
      total: result.total,
      page: parseInt(page),
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/flights/:id', async (req, res) => {
  try {
    const [flights] = await pool.query('SELECT * FROM flights WHERE flight_id = ? OR flight_number = ?', [req.params.id, req.params.id]);
    if (flights.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flights[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/seats/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;

    // Fetch flight details
    const [flights] = await pool.query(
      `
      SELECT flight_id, flight_number, departure_city, arrival_city, 
             departure_time, arrival_time, total_seats, available_seats, price
      FROM flights
      WHERE flight_id = ?
      `,
      [flightId]
    );

    if (flights.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Fetch seats for the flight
    const [seats] = await pool.query(
      `
      SELECT seat_id, seat_number, is_booked
      FROM seats
      WHERE flight_id = ?
      `,
      [flightId]
    );

    res.json({
      flight: flights[0],
      seats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch flight or seats' });
  }
});

router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { flightId, seatNumber } = req.body;
    const booking = await flightService.bookFlight(req.user.user_id, flightId, seatNumber);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.booking_id, f.flight_number, b.status
       FROM bookings b
       JOIN flights f ON b.flight_id = f.flight_id
       WHERE b.user_id = ?`,
      [req.user.user_id]
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.booking_id, f.flight_number, f.departure_city, f.arrival_city, 
              f.departure_time, s.seat_number, b.status, f.price
       FROM bookings b
       JOIN flights f ON b.flight_id = f.flight_id
       JOIN seats s ON b.seat_id = s.seat_id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [req.params.id, req.user.user_id]
    );
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(bookings[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/bookings/:id/cancel', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const bookingId = req.params.id;
    const userId = req.user.user_id;

    // Start transaction
    await connection.beginTransaction();

    // Check if booking exists and belongs to user
    const [bookings] = await connection.query(
      `
      SELECT b.booking_id, b.flight_id, b.seat_id, b.status
      FROM bookings b
      WHERE b.booking_id = ? AND b.user_id = ? AND b.status = 'confirmed'
      `,
      [bookingId, userId],
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found or not eligible for cancellation' });
    }

    const { flight_id, seat_id } = bookings[0];

    // Update booking status to cancelled
    await connection.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE booking_id = ?
      `,
      [bookingId]
    );

    // Mark seat as available
    await connection.query(
      `
      UPDATE seats
      SET is_booked = FALSE
      WHERE seat_id = ?
      `,
      [seat_id]
    );

    // Increment available seats in flights
    await connection.query(
      `
      UPDATE flights
      SET available_seats = available_seats + 1
      WHERE flight_id = ?
      `,
      [flight_id]
    );

    // Commit transaction
    await connection.commit();

    // Fetch updated booking details to return
    const [updatedBooking] = await connection.query(
      `
      SELECT b.booking_id, f.flight_number, f.departure_city, f.arrival_city, 
             f.departure_time, s.seat_number, b.status, f.price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN seats s ON b.seat_id = s.seat_id
      WHERE b.booking_id = ?
      `,
      [bookingId]
    );

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking[0],
    });
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    res.status(500).json({ message: error.message || 'Failed to cancel booking' });
  } finally {
    connection.release();
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ?', [req.user.user_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;