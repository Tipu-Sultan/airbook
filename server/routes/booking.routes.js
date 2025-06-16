const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, BookingController.bookFlight.bind(BookingController));
router.get('/', authMiddleware, BookingController.getUserBookings.bind(BookingController));
router.get('/:id', authMiddleware, BookingController.getBookingById.bind(BookingController));
router.post('/:id/cancel', authMiddleware, BookingController.cancelBooking.bind(BookingController));
router.post('/:bookingId/create-order', authMiddleware, BookingController.createOrder.bind(BookingController));
router.post('/:bookingId/verify-payment', authMiddleware, BookingController.verifyPayment.bind(BookingController));
router.delete('/:bookingId', authMiddleware, BookingController.deleteBooking.bind(BookingController));

module.exports = router;