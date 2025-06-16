const Razorpay = require('razorpay');
const crypto = require('crypto');
const BookingModel = require('../models/booking.model');
const FlightModel = require('../models/flight.model');
const SeatModel = require('../models/seat.model');
const SeatClassModel = require('../models/seat_class.model');
const UserModel = require('../models/user.model');
const PaymentModel = require('../models/payment.model');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
require('dotenv').config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret:  process.env.RAZORPAY_KEY_SECRET,
});

class BookingService {
  constructor(bookingModel, flightModel, seatModel, seatClassModel, userModel, paymentModel, dbPool) {
    this.bookingModel = bookingModel;
    this.flightModel = flightModel;
    this.seatModel = seatModel;
    this.seatClassModel = seatClassModel;
    this.userModel = userModel;
    this.paymentModel = paymentModel;
    this.pool = dbPool;
  }

  async bookFlight(userId, flightId,seatNumber,flightNumber, bookingId, seatClassName) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate user
      const user = await this.userModel.findById(userId, connection);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate seat

      const seat = await this.seatModel.findAvailableByFlightIdAndSeatNumber(flightId, seatNumber, connection);
      console.log('seat');
      if (!seat || seat.class_name !== seatClassName) {
        throw new ConflictError('Seat is unavailable or class mismatch');
      }

      // Validate flight
      const flight = await this.flightModel.findById(flightId, connection);
      if (!flight) {
        throw new NotFoundError('Flight not found');
      }

      // Validate seat class
      const seatClass = await this.seatClassModel.findById(seat.seat_class_id, connection);
      if (!seatClass) {
        throw new NotFoundError('Seat class not found');
      }

      // Calculate price
      const price = flight.base_price * seatClass.price_multiplier;

      // Create booking with pending status
      const booking = await this.bookingModel.create(
        {
          bookingId,
          userId,
          flightId,
          seatId: seat.seat_id,
          seatNumber: seat.seat_number,
          seatClassId: seat.seat_class_id,
          price,
          status: 'pending',
        },
        connection
      );

      await connection.commit();
      return booking;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createOrder(bookingId, userId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate booking
      const booking = await this.bookingModel.findByIdAndUserId(bookingId, userId, connection);
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }
      if (booking.booking.status !== 'pending') {
        throw new ConflictError('Booking is not in pending status');
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: Math.round(booking.booking.price * 100), // Convert to paise
        currency: 'INR',
        receipt: bookingId,
        payment_capture: 1, // Auto-capture payment
      });

      // Create payment record
      await this.paymentModel.create(
        {
          booking_id: bookingId,
          razorpay_order_id: order.id,
          amount: booking.booking.price,
          currency: 'INR',
          status: 'created',
        },
        connection
      );

      await connection.commit();
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async verifyPayment(bookingId, userId, paymentData) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate booking
      const booking = await this.bookingModel.findByIdAndUserId(bookingId, userId, connection);
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }
      if (booking.booking.status !== 'pending') {
        throw new ConflictError('Booking is not in pending status');
      }

      // Verify payment signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== paymentData.razorpay_signature) {
        // Update payment status to failed
        await this.paymentModel.updatePaymentDetails(
          paymentData.razorpay_order_id,
          {
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
            status: 'failed',
          },
          connection
        );
        // Delete booking (cascades to payment due to ON DELETE CASCADE)
        await this.bookingModel.deleteByBookingId(bookingId, connection);
        throw new BadRequestError('Invalid payment signature');
      }

      // Update payment status to captured
      await this.paymentModel.updatePaymentDetails(
        paymentData.razorpay_order_id,
        {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          status: 'captured',
        },
        connection
      );

      // Update booking status to confirmed
      await this.bookingModel.updateStatus(bookingId, 'confirmed', connection);

      // Update seat status
      await this.seatModel.updateBookingStatus(booking.booking.seat_id, true, connection);

      // Update flight available seats
      await this.flightModel.updateAvailableSeats(booking.booking.flight_id, -1, connection);

      await connection.commit();
      return await this.bookingModel.findById(bookingId, connection);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteBooking(bookingId, userId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate booking
      const booking = await this.bookingModel.findByIdAndUserId(bookingId, userId, connection);
      if (!booking) {
        throw new NotFoundError('Booking not found or access denied');
      }

      // Delete booking (cascades to payment due to ON DELETE CASCADE)
      await this.bookingModel.deleteByBookingId(bookingId, connection);

      await connection.commit();
      return booking.booking;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserBookings(userId) {
    const bookings = await this.bookingModel.findByUserId(userId);
    if (!bookings.length) {
      throw new NotFoundError('No bookings found for this user');
    }
    return bookings;
  }

  async getBookingById(bookingId, userId) {
    const booking = await this.bookingModel.findByIdAndUserId(bookingId, userId);
    if (!booking) {
      throw new NotFoundError('Booking not found or access denied');
    }
    return booking;
  }

  async cancelBooking(bookingId, userId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const bookingData = await this.bookingModel.findByIdForCancellation(bookingId, userId, connection);
      if (!bookingData) {
        throw new NotFoundError('Booking not found or not eligible for cancellation');
      }
      const booking = bookingData.booking;

      await this.bookingModel.updateStatus(bookingId, 'canceled', connection);
      await this.seatModel.updateBookingStatus(booking.seat_id, false, connection);
      await this.flightModel.updateAvailableSeats(booking.flight_id, 1, connection);

      await connection.commit();
      return await this.bookingModel.findByIdAndUserId(bookingId, userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new BookingService(
  require('../models/booking.model'),
  require('../models/flight.model'),
  require('../models/seat.model'),
  require('../models/seat_class.model'),
  require('../models/user.model'),
  require('../models/payment.model'),
  require('../config/db')
);