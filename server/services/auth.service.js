const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NotFoundError, UnauthorizedError } = require('../utils/errors');
const UserModel = require('../models/user.model');
const BookingModel = require('../models/booking.model');
const { userIdGenerator } = require('../utils/userId');

class AuthService {
  constructor(userModel, bookingModel) {
    this.userModel = userModel;
    this.bookingModel = bookingModel;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  async register({ email, password, firstName, lastName }) {
    const userId = userIdGenerator(firstName);
    const existingUser = await this.userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const user = await this.userModel.create({ userId,email, password, firstName, lastName });
    return user;
  }

  async login({ email, password }) {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const isMatch = await this.bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const token = this.jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return { user: { userId: user.user_id, email, first_name: user.first_name, last_name: user.last_name }, token };
  }

  async getProfile(userId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const bookings = await this.bookingModel.findByUserId(userId);
    return { user, bookings };
  }
}

module.exports = new AuthService(UserModel, BookingModel);