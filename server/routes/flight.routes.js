const express = require('express');
const router = express.Router();
const FlightController = require('../controllers/flight.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', FlightController.getFlights.bind(FlightController));
router.get('/:id', FlightController.getFlightById.bind(FlightController));
router.get('/:id/seats', FlightController.getSeatsByFlightId.bind(FlightController)); // New endpoint
router.post('/',  FlightController.addFlight.bind(FlightController));

module.exports = router;