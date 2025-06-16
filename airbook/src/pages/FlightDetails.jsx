import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFlightById } from '../services/api';

function FlightDetails() {
  const { FlightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const data = await getFlightById(FlightId);
        setFlight(data);
      } catch (err) {
        setError(err.message || 'Error fetching flight');
      }
    };
    fetchFlight();
  }, [FlightId]);

  if (!flight) {
    return <p className="text-center">{error || 'Loading...'}</p>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Flight {flight.flight_number}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p><strong>Route:</strong> {flight.departure_city} to {flight.arrival_city}</p>
        <p><strong>Departure:</strong> {new Date(flight.departure_time).toLocaleString()}</p>
        <p><strong>Arrival:</strong> {new Date(flight.arrival_time).toLocaleString()}</p>
        <p><strong>Price:</strong> ${flight.price}</p>
        <p><strong>Available Seats:</strong> {flight.available_seats}</p>
        <Button onClick={() => navigate(`/book/${FlightId}`)} className="mt-4 bg-blue-600 hover:bg-blue-700">
          Book This Flight
        </Button>
      </CardContent>
    </Card>
  );
}

export default FlightDetails;