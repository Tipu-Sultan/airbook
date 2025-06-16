import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

function Home() {
  const departureCityRef = useRef(null);
  const arrivalCityRef = useRef(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Swap departure and arrival cities
  const handleSwapCities = () => {
    const departure = departureCityRef.current.value;
    const arrival = arrivalCityRef.current.value;
    departureCityRef.current.value = arrival;
    arrivalCityRef.current.value = departure;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    const departureCity = departureCityRef.current?.value.trim() || '';
    const arrivalCity = arrivalCityRef.current?.value.trim() || '';
    const formattedDepartureDate = departureDate ? format(departureDate, 'yyyy-MM-dd') : '';
    const formattedReturnDate = isRoundTrip && returnDate ? format(returnDate, 'yyyy-MM-dd') : '';

    if (!departureCity || !arrivalCity || !formattedDepartureDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (departureCity === arrivalCity) {
      setError('Departure and arrival cities cannot be the same');
      return;
    }

    if (isRoundTrip && !formattedReturnDate) {
      setError('Please select a return date for round-trip');
      return;
    }

    if (isRoundTrip && returnDate < departureDate) {
      setError('Return date cannot be before departure date');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set('departureCity', departureCity);
      params.set('arrivalCity', arrivalCity);
      params.set('departureDate', formattedDepartureDate);
      if (isRoundTrip && formattedReturnDate) {
        params.set('returnDate', formattedReturnDate);
      }
      params.set('tripType', isRoundTrip ? 'round-trip' : 'one-way');
      params.set('page', '1');
      navigate(`/flights?${params.toString()}`);
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-3xl shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Find Your Flight</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-600 text-sm mb-4 text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="departure" className="text-sm font-semibold text-gray-700">
                Departure City
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  id="departure"
                  ref={departureCityRef}
                  placeholder="e.g., Delhi"
                  className="pl-10 h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                />
              </div>
            </div>
            <div className="flex items-center justify-center md:mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapCities}
                className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                aria-label="Swap cities"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="arrival" className="text-sm font-semibold text-gray-700">
                Arrival City
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  id="arrival"
                  ref={arrivalCityRef}
                  placeholder="e.g., Mumbai"
                  className="pl-10 h-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="text-sm font-semibold text-gray-700">
                Departure Date
              </Label>
              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                minDate={new Date()}
                placeholderText="Select date"
                className="w-full h-10 px-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                wrapperClassName="w-full"
                aria-required="true"
              />
            </div>

            <div className="md:col-span-5">
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Search Flights
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Home;