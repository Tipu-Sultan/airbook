const FlightService = require('../services/flight.service');
const { validateFlightQuery, validateFlight } = require('../utils/validation');

class FlightController {
  constructor(flightService) {
    this.flightService = flightService;
  }

  async getFlights(req, res) {
    const { departureCity, arrivalCity, date, page } = req.query;
    const result = await this.flightService.getFlights({
      departureCity,
      arrivalCity,
      date,
      page: parseInt(page) || 1,
    });
    return res.json({
      data: {
        flights: result.flights,
        total: result.total,
        page: parseInt(page) || 1,
        pageSize: 20,
        totalPages: Math.ceil(result.total / 20),
      },
    });
  }

  async getFlightById(req, res) {
    const { id } = req.params;
    const flight = await this.flightService.getFlightById(id);
    return res.json({ data: flight });
  }

  async getSeatsByFlightId(req, res) {
    const { id } = req.params;
    const { flight, seats } = await this.flightService.getSeatsByFlightId(id);
    return res.json({ data: { flight, seats } });
  }

  async addFlight(req, res) {
    const { error } = validateFlight(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const flight = await this.flightService.addFlight(req.body);
    return res.status(201).json({ data: flight, message: 'Flight added successfully' });
  }
}

module.exports = new FlightController(require('../services/flight.service'));