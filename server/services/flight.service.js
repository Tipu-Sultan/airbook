const { NotFoundError } = require('../utils/errors');
const BookingService = require('./booking.service');
const RouteModel = require('../models/route.model');
const SeatModel = require('../models/seat.model');
const SeatClassModel = require('../models/seat_class.model');
const FlightModel = require('../models/flight.model');

class FlightService {
  constructor(bookingService, routeModel, seatModel, seatClassModel, flightModel, dbPool) {
    this.bookingService = bookingService;
    this.routeModel = routeModel;
    this.seatModel = seatModel;
    this.seatClassModel = seatClassModel;
    this.flightModel = flightModel;
    this.pool = dbPool;
  }

  async getFlights({ departureCity, arrivalCity, date, page = 1, pageSize = 20 }) {
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw new Error('Invalid pagination parameters');
    }

    let routeId;
    if (departureCity && arrivalCity) {
      const route = await this.routeModel.findByCities(departureCity, arrivalCity);
      routeId = route.route_id;
    }

    const result = await this.flightModel.findAll({
      routeId,
      date,
      page,
      pageSize,
    });

    return {
      flights: result.flights,
      total: result.total,
    };
  }

  async getFlightById(flightId) {
    const flight = await this.flightModel.findById(flightId);
    return flight;
  }

  async getSeatsByFlightId(flightId) {
    const { flight, seats } = await this.seatModel.findByFlightId(flightId);
    if (!seats.length && !flight) {
      throw new NotFoundError('No seats found for this flight');
    }
    return { flight, seats };
  }

  async addFlight({flight_number, departure_city, arrival_city, departure_time, arrival_time, total_seats }) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Find route
      const route = await this.routeModel.findByCities(departure_city, arrival_city, connection);

      // Find all seat classes
      const economyClass = await this.seatClassModel.findByName('Economy', connection);
      const businessClass = await this.seatClassModel.findByName('Business', connection);
      const firstClass = await this.seatClassModel.findByName('First', connection);

      // Create seat class mapping
      const seatClassMapping = {
        Economy: economyClass.seat_class_id, // 1
        Business: businessClass.seat_class_id, // 2
        First: firstClass.seat_class_id, // 3
      };

      // Create flight
      const flightData = {
        flight_number,
        route_id: route.route_id,
        departure_time,
        arrival_time,
        total_seats,
      };

      const { flight_id } = await this.flightModel.create(flightData, connection);

      // Create seats with class assignments
      const seatsAdded = await this.seatModel.createSeats(flight_id, total_seats, seatClassMapping, connection);

      await connection.commit();
      return {
        flightId: flight_id,
        seatsAdded,
        message: 'Flight and seats added successfully',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async bookFlight(userId, flightId, seatNumber) {
    return await this.bookingService.bookFlight(userId, flightId, seatNumber);
  }
}

module.exports = new FlightService(
  require('./booking.service'),
  require('../models/route.model'),
  require('../models/seat.model'),
  require('../models/seat_class.model'),
  require('../models/flight.model'),
  require('../config/db')
);