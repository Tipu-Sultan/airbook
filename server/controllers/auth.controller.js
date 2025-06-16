const AuthService = require('../services/auth.service');
const { validateRegister, validateLogin } = require('../utils/validation');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res) {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    try {
      const user = await this.authService.register(req.body);
      return res.status(201).json({ data: user, message: 'User registered successfully' });
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  }

  async login(req, res) {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    try {
      const { user, token } = await this.authService.login(req.body);
      return res.json({ data: { user, token }, message: 'Login successful' });
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await this.authService.getProfile(req.user.userId);
      return res.json({ data: profile, message: 'Profile fetched successfully' });
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  }
}

module.exports = new AuthController(require('../services/auth.service'));