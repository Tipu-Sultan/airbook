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

function Book() {
  const { FlightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load Razorpay SDK
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
        setSelectedSeat(null);
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
    if (!seat.is_booked) {
      setSelectedSeat(seat.seat_number);
    }
  };

  const handleSubmit = async () => {
    if (!FlightId || !selectedSeat) {
      throw new Error('Please select a seat');
    }
    setBookingStatus('pending');
    try {
      const selectedSeatData = seats.find(
        (seat) => seat.seat_number === selectedSeat
      );
      const booking = await bookFlight({
        flightNumber: flight?.flight_number,
        flightId: FlightId,
        seatNumber: selectedSeat,
        seatClassName: selectedSeatData.class_name,
      });
      setBookingStatus(null);
      return booking;
    } catch (err) {
      setBookingStatus(null);
      throw new Error(err.message || 'Booking failed. Please try again.');
    }
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
      const className = seat.class_name.toLowerCase();
      if (!acc[className]) acc[className] = {};
      const row = seat.seat_number[0];
      if (!acc[className][row]) acc[className][row] = [];
      acc[className][row].push(seat);
      return acc;
    },
    { first: {}, business: {}, economy: {} }
  );

  const bookingData = {
    bookingId: '',
    userId: user.userId,
    userEmail: user.email,
    userPhone: user.phone || '9999999999',
    flightNumber: flight?.flight_number,
    flightId: FlightId,
    seatNumber: selectedSeat,
  };

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
                  className="text-red-600 text-sm sm:text-base mb-4 sm:mb-6 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
              {bookingStatus === 'confirmed' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm sm:text-base mb-4 sm:mb-6 text-center font-medium"
                >
                  Booking confirmed! Redirecting...
                </motion.p>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <FlightDetails flight={flight} />
              <SeatLegend />
            </div>
            <BookingForm
              onSubmit={handleSubmit}
              disabled={!FlightId || !selectedSeat || bookingStatus === 'pending'}
              bookingStatus={bookingStatus}
              bookingData={bookingData}
              navigate={navigate}
            >
              <div className="space-y-6 sm:space-y-8">
                {['first', 'business', 'economy'].map((classType) =>
                  Object.keys(seatsByClass[classType]).length > 0 ? (
                    <SeatSection
                      key={classType}
                      classType={classType}
                      seats={seatsByClass[classType]}
                      onSeatClick={handleSeatClick}
                      selectedSeat={selectedSeat}
                      basePrice={flight?.base_price || 0}
                    />
                  ) : null
                )}
                {!seats.length && (
                  <p className="text-gray-600 text-sm sm:text-base text-center">
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