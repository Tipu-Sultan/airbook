// example id : SG908061325
exports.BookingIdGenerator = (flightNumber) =>{
  const prefix = flightNumber;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random part
  return `${prefix}-${randomPart}`; // Combine parts to form the booking ID
}

