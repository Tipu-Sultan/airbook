const Razorpay = require("razorpay");
const crypto = require("crypto");
const BookingModel = require("../models/booking.model");
const FlightModel = require("../models/flight.model");
const SeatModel = require("../models/seat.model");
const SeatClassModel = require("../models/seat_class.model");
const UserModel = require("../models/user.model");
const PaymentModel = require("../models/payment.model");
const {
  NotFoundError,
  ConflictError,
  BadRequestError,
} = require("../utils/errors");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class BookingService {
  constructor(
    bookingModel,
    flightModel,
    seatModel,
    seatClassModel,
    userModel,
    paymentModel,
    dbPool
  ) {
    this.bookingModel = bookingModel;
    this.flightModel = flightModel;
    this.seatModel = seatModel;
    this.seatClassModel = seatClassModel;
    this.userModel = userModel;
    this.paymentModel = paymentModel;
    this.pool = dbPool;
  }

  async bookFlight(userId, flightId, seatsData, flightNumber, bookingId) {
    // seatsData = array of {seatNumber, seatClassName}
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const user = await this.userModel.findById(userId, connection);
      if (!user) throw new NotFoundError("User not found");

      const flight = await this.flightModel.findById(flightId, connection);
      if (!flight) throw new NotFoundError("Flight not found");

      let totalPrice = 0;
      const bookedSeats = [];

      for (const { seatNumber, seatClassName } of seatsData) {
        const seat = await this.seatModel.findAvailableByFlightIdAndSeatNumber(
          flightId,
          seatNumber,
          connection
        );
        if (
          !seat ||
          seat.class_name.toLowerCase() !== seatClassName.toLowerCase()
        ) {
          throw new ConflictError(
            `Seat ${seatNumber} is unavailable or class mismatch`
          );
        }

        const seatClass = await this.seatClassModel.findById(
          seat.seat_class_id,
          connection
        );
        const price = flight.base_price * seatClass.price_multiplier;
        totalPrice += price;

        await this.seatModel.updateBookingStatus(
          seat.seat_id,
          true,
          connection
        );
        bookedSeats.push({ seat, price });
      }


      await this.bookingModel.createGroup(
        {
          bookingId,
          userId,
          flightId,
          totalPrice,
        },
        connection
      );

      for (const { seat, price } of bookedSeats) {
        await this.bookingModel.createBookingSeat(
          {
            bookingId,
            seatId: seat.seat_id,
            seatNumber: seat.seat_number,
            seatClassId: seat.seat_class_id,
            price,
          },
          connection
        );
      }

      await connection.commit();

      return await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        connection
      );
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

      const booking = await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        connection
      );
      if (booking.booking.status !== "pending") {
        throw new ConflictError("Booking is not in pending status");
      }

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
          `${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`
        )
        .digest("hex");

      if (generatedSignature !== paymentData.razorpay_signature) {
        await this.deleteBooking(bookingId, userId, connection);
        throw new BadRequestError("Invalid payment signature");
      }

      await this.paymentModel.updatePaymentDetails(
        paymentData.razorpay_order_id,
        {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          status: "captured",
        },
        connection
      );

      await this.bookingModel.updateStatus(bookingId, "confirmed", connection);

      const seats = await this.bookingModel.getBookingSeats(
        bookingId,
        connection
      );
      await this.flightModel.updateAvailableSeats(
        booking.booking.flight_id,
        -seats.length,
        connection
      );

      await connection.commit();
      return await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        connection
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteBooking(bookingId, userId, connection = null) {
    const dbConn = connection || (await this.pool.getConnection());
    const isExternalConn = !!connection;
    try {
      if (!isExternalConn) await dbConn.beginTransaction();

      const booking = await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        dbConn
      );

      const seats = await this.bookingModel.getBookingSeats(bookingId, dbConn);
      for (const seat of seats) {
        await this.seatModel.updateBookingStatus(seat.seat_id, false, dbConn);
      }

      await this.bookingModel.deleteByBookingId(bookingId, dbConn);

      if (!isExternalConn) await dbConn.commit();
      return booking.booking;
    } catch (error) {
      if (!isExternalConn) await dbConn.rollback();
      throw error;
    } finally {
      if (!isExternalConn) dbConn.release();
    }
  }

  async createOrder(bookingId, userId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate booking
      const booking = await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        connection
      );

      if (!booking) {
        throw new NotFoundError("Booking not found");
      }
      if (booking.booking.status !== "pending") {
        throw new ConflictError("Booking is not in pending status");
      }

      // Create Razorpay order (await is required as it returns a Promise)
      const order = await razorpay.orders.create({
        amount: Math.round(booking.booking.total_price * 100), // Convert to paise, use total_price
        currency: "INR",
        receipt: bookingId,
        payment_capture: 1, // Auto-capture payment
      });

      // Create payment record
      await this.paymentModel.create(
        {
          booking_id: bookingId,
          razorpay_order_id: order.id,
          amount: booking.booking.total_price,
          currency: "INR",
          status: "created",
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

  async getUserBookings(userId) {
    const bookings = await this.bookingModel.findByUserId(userId);
    if (!bookings.length) {
      throw new NotFoundError("No bookings found for this user");
    }
    return bookings;
  }

  async getBookingById(bookingId, userId) {
    const booking = await this.bookingModel.findGroupByIdAndUserId(
      bookingId,
      userId
    );
    if (!booking) {
      throw new NotFoundError("Booking not found or access denied");
    }
    return booking;
  }

  async cancelBooking(bookingId, userId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const bookingData = await this.bookingModel.findByIdForCancellation(
        bookingId,
        userId,
        connection
      );

      // bookingData includes seats array
      const { booking, seats } = bookingData;

      if (!booking || booking.status !== "confirmed") {
        throw new NotFoundError(
          "Booking not found or not eligible for cancellation"
        );
      }

      // Update booking status to canceled
      await this.bookingModel.updateStatus(bookingId, "canceled", connection);

      // Release all seats (set is_booked = false)
      for (const seat of seats) {
        await this.seatModel.updateBookingStatus(
          seat.seat_id,
          false,
          connection
        );
      }

      // Increment available seats in flight by the number of canceled seats
      await this.flightModel.updateAvailableSeats(
        booking.flight_id,
        seats.length,
        connection
      );

      await connection.commit();

      // Return updated booking data
      return await this.bookingModel.findGroupByIdAndUserId(
        bookingId,
        userId,
        connection
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new BookingService(
  require("../models/booking.model"),
  require("../models/flight.model"),
  require("../models/seat.model"),
  require("../models/seat_class.model"),
  require("../models/user.model"),
  require("../models/payment.model"),
  require("../config/db")
);
