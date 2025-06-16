import React from 'react';
import { IndianRupee, Users, Plane } from 'lucide-react';

function FlightDetails({ flight }) {
  if (!flight) {
    return (
      <p className="text-gray-600 text-sm sm:text-base text-center">
        Flight details unavailable.
      </p>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
        <Plane className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
        Flight Details
      </h3>
      <p className="text-gray-700 text-sm sm:text-base">
        <span className="font-medium">Route:</span> {flight.departure_city} to{' '}
        {flight.arrival_city}
      </p>
      <p className="text-gray-700 text-sm sm:text-base">
        <span className="font-medium">Departure:</span>{' '}
        {new Date(flight.departure_time).toLocaleString()}
      </p>
      <p className="text-gray-700 text-sm sm:text-base">
        <span className="font-medium">Arrival:</span>{' '}
        {new Date(flight.arrival_time).toLocaleString()}
      </p>
      <p className="text-gray-700 text-sm sm:text-base flex items-center">
        <Users className="h-4 w-4 mr-1 text-blue-600" />
        <span className="font-medium">Available Seats:</span>{' '}
        {flight.available_seats}
      </p>
    </div>
  );
}

export default FlightDetails;