const BookingService = require('../services/booking.service');
const { BookingIdGenerator } = require('../utils/BookingIdGenerator');
const { validateBooking } = require('../utils/validation');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');

class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  async bookFlight(req, res) {
    const { error } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const bookingId = BookingIdGenerator(req.body.flightNumber);
    if (!bookingId) {
      return res.status(500).json({ message: 'Failed to generate booking ID' });
    }
    const { flightId,flightNumber, seatNumber, seatClassName } = req.body;
    try {
      const booking = await this.bookingService.bookFlight(
        req.user.userId,
        flightId,
        seatNumber,
        flightNumber,
        bookingId,
        seatClassName
      );
      return res.status(201).json({ data: booking, message: 'Booking created successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      if (err instanceof ConflictError) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Booking failed. Please try again.' });
    }
  }

  async createOrder(req, res) {
    const { bookingId } = req.params;
    try {
      const order = await this.bookingService.createOrder(bookingId, req.user.userId);
      return res.status(201).json({ data: order, message: 'Order created successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      if (err instanceof ConflictError) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Failed to create order' });
    }
  }

  async verifyPayment(req, res) {
    const { bookingId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
      const booking = await this.bookingService.verifyPayment(bookingId, req.user.userId, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      return res.status(200).json({ data: booking, message: 'Payment verified and booking confirmed' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Payment verification failed' });
    }
  }

  async getUserBookings(req, res) {
    try {
      const bookings = await this.bookingService.getUserBookings(req.user.userId);
      return res.json({ data: bookings });
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  async getBookingById(req, res) {
    const { id } = req.params;
    try {
      const booking = await this.bookingService.getBookingById(id, req.user.userId);
      return res.json({ data: booking });
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  async cancelBooking(req, res) {
    const { id } = req.params;
    try {
      const booking = await this.bookingService.cancelBooking(id, req.user.userId);
      return res.json({ data: booking, message: 'Booking cancelled successfully' });
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  async deleteBooking(req, res) {
    const { bookingId } = req.params;
    try {
      const booking = await this.bookingService.deleteBooking(bookingId, req.user.userId);
      return res.json({ data: booking, message: 'Booking deleted successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Failed to delete booking' });
    }
  }
}

module.exports = new BookingController(require('../services/booking.service'));