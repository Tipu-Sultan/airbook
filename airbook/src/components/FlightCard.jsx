import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, DollarSign, Users, IndianRupee } from 'lucide-react';

function FlightCard({ flight }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-lg font-semibold text-blue-600 flex items-center">
          <Plane className="h-5 w-5 mr-2" />
          Flight {flight.flight_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Route:</span> {flight.departure_city} to {flight.arrival_city}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Departure:</span> {new Date(flight.departure_time).toLocaleString()}
          </p>
          <p className="text-gray-700 flex items-center">
            <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
            
            <span className="font-medium">Price: </span> {flight.price}
          </p>
          <p className="text-gray-700 flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">Available Seats:</span> {flight.available_seats}
          </p>
          <p className="text-gray-700 flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">Total Seats:</span> {flight.total_seats}
          </p>
        </div>
        <Link to={`/book/${flight.flight_id}`}>
          <Button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
          >
            Book Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default FlightCard;