
CREATE DATABASE airbook;
USE airbook;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT UNIQUE,
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table for route distances and base prices
CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    distance_km DECIMAL(10, 2) NOT NULL, -- Distance in kilometers
    base_price DECIMAL(10, 2) NOT NULL, -- Base price for the route
    UNIQUE (departure_city, arrival_city)
);

-- Seat Classes table for seat categories
CREATE TABLE seat_classes (
    seat_class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE, -- e.g., Economy, Business
    price_multiplier DECIMAL(5, 2) NOT NULL -- Multiplier for base price (e.g., 1.0 for Economy, 2.5 for Business)
);

-- Flights table
CREATE TABLE flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    route_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE RESTRICT
);

-- Seats table
CREATE TABLE seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    seat_class_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_class_id) REFERENCES seat_classes(seat_class_id) ON DELETE RESTRICT,
    UNIQUE (flight_id, seat_number)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT UNIQUE,
    booking_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    flight_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'canceled', 'pending') DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL, -- Final price at booking time
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    UNIQUE (flight_id)
);

-- First, create the new table to record multiple seats for a single booking (group booking)
CREATE TABLE booking_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL,
    seat_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE RESTRICT,
    FOREIGN KEY (seat_class_id) REFERENCES seat_classes(seat_class_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_seat_in_booking (booking_id, seat_id)
);

-- Indexes for performance
CREATE INDEX idx_routes_departure_city ON routes(departure_city);
CREATE INDEX idx_routes_arrival_city ON routes(arrival_city);
CREATE INDEX idx_flights_route_id ON flights(route_id);
CREATE INDEX idx_seats_flight_id ON seats(flight_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);