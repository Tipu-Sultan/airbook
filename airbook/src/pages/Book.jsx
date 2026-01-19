// Updated Book.jsx - Single booking request with seats array in payload
// - Assumes backend handles seats: [...] and creates a group booking (single booking_id, total price)
// - Single payment flow
// - Re-checks availability before booking
// - Passes count and totalPrice to BookingForm

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plane } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getSeatsByFlightId, bookFlight } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import FlightDetails from '../components/booking/FlightDetails';
import SeatLegend from '../components/booking/SeatLegend';
import SeatSection from '../components/booking/SeatSection';
import BookingForm from '../components/booking/BookingForm';
import { toast } from 'sonner';

function Book() {
  const { FlightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!FlightId || isNaN(FlightId)) {
        setError('Invalid or missing flight ID');
        setLoading(false);
        return;
      }
      try {
        const data = await getSeatsByFlightId(FlightId);
        if (!data.flight) {
          throw new Error('Flight not found');
        }
        setFlight(data.flight);
        setSeats(data.seats || []);
        setSelectedSeats([]);
      } catch (err) {
        setError(
          err.message.includes('404')
            ? 'Flight or seats not found'
            : err.message || 'Failed to load flight or seats'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [FlightId]);

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;
    setError('');
    const num = seat.seat_number;
    if (selectedSeats.includes(num)) {
      setSelectedSeats(prev => prev.filter(s => s !== num));
    } else {
      if (selectedSeats.length >= 5) {
        setError('You can select a maximum of 5 seats');
        toast.error('You can select a maximum of 5 seats');
        setTimeout(() => setError(''), 5000);
        return;
      }
      setSelectedSeats(prev => [...prev, num]);
    }
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      throw new Error('Please select at least one seat');
    }

    const seatsData = selectedSeats.map(seatNum => {
      const seat = seats.find(s => s.seat_number === seatNum);
      if (!seat || seat.is_booked) {
        throw new Error(`Seat ${seatNum} is no longer available`);
      }
      return {
        seatNumber: seatNum,
        seatClassName: seat.class_name,
      };
    });

    const booking = await bookFlight({
      flightNumber: flight?.flight_number,
      flightId: FlightId,
      seats: seatsData,
    });

    return booking;
  };

  if (!token || !user) {
    const redirectUrl = `/book/${FlightId}`;
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const seatsByClass = seats.reduce(
    (acc, seat) => {
      if (!seat || !seat.seat_number || !seat.class_name) {
        return acc;
      }
      const className = seat.class_name.toLowerCase().trim();
      const normalizedClass = ['first', 'business', 'economy'].includes(className)
        ? className
        : 'economy';

      if (!acc[normalizedClass]) acc[normalizedClass] = {};

      const rowMatch = seat.seat_number.match(/^\d+/);
      const row = rowMatch ? rowMatch[0] : (seat.seat_number[0] || '1');

      if (!acc[normalizedClass][row]) acc[normalizedClass][row] = [];
      acc[normalizedClass][row].push(seat);
      return acc;
    },
    { first: {}, business: {}, economy: {} }
  );

  let totalAvailableSeats = seats.filter(seat => !seat.is_booked).length;

  const totalPrice = selectedSeats.reduce((sum, num) => {
    const seat = seats.find(s => s.seat_number === num);
    return seat ? sum + (flight?.base_price || 0) * seat.price_multiplier : sum;
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="max-w-6xl mx-auto shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center">
              <Plane className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Book Your Flight
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-600 text-sm sm:text-base mb-4 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FlightDetails flight={flight} totalAvailableSeats={totalAvailableSeats} />
              <SeatLegend />
            </div>

            <BookingForm
              onSubmit={handleBookSeats}
              disabled={selectedSeats.length === 0}
              bookingStatus={null}
              navigate={navigate}
              flightNumber={flight?.flight_number}
              count={selectedSeats.length}
              totalPrice={totalPrice}
            >
              {selectedSeats.length > 0 && (
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">
                    Selected Seats ({selectedSeats.length}/5)
                  </h3>
                  <div className="space-y-3">
                    {selectedSeats.map((seatNum) => {
                      const seat = seats.find(s => s.seat_number === seatNum);
                      if (!seat) return null;
                      const price = Math.round((flight?.base_price || 0) * seat.price_multiplier);
                      return (
                        <div key={seatNum} className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {seatNum} <span className="text-gray-600">({seat.class_name})</span>
                          </span>
                          <span className="font-bold text-blue-700">₹{price}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t-2 border-blue-300 mt-6 pt-4">
                    <div className="text-right text-2xl font-bold text-blue-900">
                      Total: ₹{Math.round(totalPrice)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Click on a selected seat again to deselect it.
                  </p>
                </div>
              )}

              {selectedSeats.length === 0 && (
                <p className="text-center text-gray-500 my-8 text-lg">
                  Select up to 5 seats to proceed
                </p>
              )}

              <div className="space-y-8">
                {['first', 'business', 'economy'].map((classType) =>
                  Object.keys(seatsByClass[classType]).length > 0 ? (
                    <SeatSection
                      key={classType}
                      classType={classType}
                      seats={seatsByClass[classType]}
                      onSeatClick={handleSeatClick}
                      selectedSeats={selectedSeats}
                      basePrice={flight?.base_price || 0}
                    />
                  ) : null
                )}
                {!seats.length && (
                  <p className="text-gray-600 text-center">
                    No seats available for this flight.
                  </p>
                )}
              </div>
            </BookingForm>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Book;