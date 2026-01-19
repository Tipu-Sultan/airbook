// admin.routes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
// Assume you have admin middleware
const { adminMiddleware } = require('../middleware/auth');


router.get('/flights', AdminController.getFlightStats);
router.post('/flights', AdminController.addFlight);
router.put('/flights/:id', AdminController.updateFlight);
router.delete('/flights/:id', AdminController.deleteFlight);

router.get('/routes', AdminController.getAllRoutes);
router.post('/routes', AdminController.addRoute);
router.put('/routes/:id', AdminController.updateRoute);
router.delete('/routes/:id', AdminController.deleteRoute);

router.get('/users', AdminController.getAllUsers);

router.get('/bookings', AdminController.getAllBookings);
router.delete('/bookings/:bookingId', AdminController.deleteBooking); // Hard delete if needed

router.get('/seat-classes', AdminController.getAllSeatClasses);

module.exports = router;