const Joi = require('joi');

   const validateRegister = (data) => {
     const schema = Joi.object({
       email: Joi.string().email().required(),
       password: Joi.string().min(6).required(),
       firstName: Joi.string().min(1).required(),
       lastName: Joi.string().min(1).required(),
     });
     return schema.validate(data);
   };

   const validateLogin = (data) => {
     const schema = Joi.object({
       email: Joi.string().email().required(),
       password: Joi.string().required(),
     });
     return schema.validate(data);
   };

   const validateFlightQuery = (data) => {
     const schema = Joi.object({
       departureCity: Joi.string().min(1),
       arrivalCity: Joi.string().min(1),
       date: Joi.date().iso(),
       page: Joi.number().integer().min(1),
     });
     return schema.validate(data);
   };

   const validateFlight = (data) => {
     const schema = Joi.object({
       flight_number: Joi.string().required(),
       departure_city: Joi.string().min(1).required(),
       arrival_city: Joi.string().min(1).required(),
       departure_time: Joi.date().iso().required(),
       arrival_time: Joi.date().iso().required(),
       total_seats: Joi.number().integer().min(1).required(),
       available_seats: Joi.number().integer().min(0).required(),
     });
     return schema.validate(data);
   };

   const validateBooking = (data) => {
     const schema = Joi.object({
       flightId: Joi.number().integer().required(),
       seatNumber: Joi.string().pattern(/^[A-Z][1-9][0-9]?$/).required(),
       seatClassName: Joi.string().valid('Economy', 'Business', 'First').required(),
       flightNumber: Joi.string().required(),
     });
     return schema.validate(data);
   };

   module.exports = { validateRegister, validateLogin, validateFlightQuery, validateFlight, validateBooking };