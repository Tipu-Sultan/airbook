// controllers/admin.controller.js
const AdminService = require('../services/admin.service');
const { NotFoundError, ConflictError } = require('../utils/errors');

class AdminController {
  async getFlightStats(req, res) {
    try {
      const flights = await AdminService.getFlightStats();
      res.json({ data: flights });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to fetch flights' });
    }
  }

  async addFlight(req, res) {
    try {
      const flight = await AdminService.addFlight(req.body);
      res.status(201).json({ data: flight, message: 'Flight added successfully' });
    } catch (err) {
      if (err instanceof ConflictError) {
        return res.status(409).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to add flight' });
    }
  }

  async updateFlight(req, res) {
    try {
      const flight = await AdminService.updateFlight(req.params.id, req.body);
      res.json({ data: flight, message: 'Flight updated successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to update flight' });
    }
  }

  async deleteFlight(req, res) {
    try {
      await AdminService.deleteFlight(req.params.id);
      res.json({ message: 'Flight deleted successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to delete flight' });
    }
  }

  async getAllRoutes(req, res) {
    try {
      const routes = await AdminService.getAllRoutes();
      res.json({ data: routes });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to fetch routes' });
    }
  }

  async addRoute(req, res) {
    try {
      const route = await AdminService.addRoute(req.body);
      res.status(201).json({ data: route, message: 'Route added successfully' });
    } catch (err) {
      if (err instanceof ConflictError) {
        return res.status(409).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to add route' });
    }
  }

  async updateRoute(req, res) {
    try {
      const route = await AdminService.updateRoute(req.params.id, req.body);
      res.json({ data: route, message: 'Route updated successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to update route' });
    }
  }

  async deleteRoute(req, res) {
    try {
      await AdminService.deleteRoute(req.params.id);
      res.json({ message: 'Route deleted successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to delete route' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      res.json({ data: users });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to fetch users' });
    }
  }

  async getAllBookings(req, res) {
    try {
      const bookings = await AdminService.getAllBookings();
      res.json({ data: bookings });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to fetch bookings' });
    }
  }

  async deleteBooking(req, res) {
    try {
      await AdminService.deleteBooking(req.params.bookingId);
      res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Failed to delete booking' });
    }
  }

  async getAllSeatClasses(req, res) {
    try {
      const classes = await AdminService.getAllSeatClasses();
      res.json({ data: classes });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to fetch seat classes' });
    }
  }
}

module.exports = new AdminController();