exports.userIdGenerator = function (firstName) {
    const prefix = firstName.slice(0, 2).toUpperCase(); // Take first two letters of first name
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random part
    return `${prefix}${randomPart}`; // Combine parts to form the user ID
  
}

