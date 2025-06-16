import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlightCard from '../components/FlightCard';
import { getFlights } from '../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

function Flights() {
  const [flights, setFlights] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const departureCityRef = useRef(null);
  const arrivalCityRef = useRef(null);
  const dateRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page')) || 1;
    setPage(pageParam);

    const fetchFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const filters = {
          departureCity: params.get('departureCity') || '',
          arrivalCity: params.get('arrivalCity') || '',
          date: params.get('date') || '',
        };
        const data = await getFlights({ page: pageParam, ...filters });
        setFlights(data.flights || []);
        setTotalPages(data.totalPages || 1);

        if (departureCityRef.current) departureCityRef.current.value = filters.departureCity;
        if (arrivalCityRef.current) arrivalCityRef.current.value = filters.arrivalCity;
        if (dateRef.current) dateRef.current.value = filters.date;
      } catch (err) {
        setError(err.message || 'Error fetching flights');
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [location.search]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      departureCity: departureCityRef.current?.value || '',
      arrivalCity: arrivalCityRef.current?.value || '',
      date: dateRef.current?.value || '',
    };

    if (!newFilters.departureCity && !newFilters.arrivalCity && !newFilters.date) {
      setError('Please provide at least one filter criterion');
      return;
    }

    const params = new URLSearchParams();
    if (newFilters.departureCity) params.set('departureCity', newFilters.departureCity);
    if (newFilters.arrivalCity) params.set('arrivalCity', newFilters.arrivalCity);
    if (newFilters.date) params.set('date', newFilters.date);
    params.set('page', '1');
    navigate(`/flights?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(location.search);
      params.set('page', newPage.toString());
      navigate(`/flights?${params.toString()}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Flights</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureCity" className="text-sm font-medium text-gray-700">
              Departure City
            </Label>
            <Input
              id="departureCity"
              name="departureCity"
              ref={departureCityRef}
              placeholder="Enter departure city"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalCity" className="text-sm font-medium text-gray-700">
              Arrival City
            </Label>
            <Input
              id="arrivalCity"
              name="arrivalCity"
              ref={arrivalCityRef}
              placeholder="Enter arrival city"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              ref={dateRef}
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
            >
              Apply Filters
            </Button>
          </div>
        </form>
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center animate-fade-in">{error}</p>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : flights.length === 0 ? (
        <p className="text-gray-500 text-center">No flights found.</p>
      ) : (
        <div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {flights.map((flight) => (
              <FlightCard key={flight.flight_id} flight={flight} />
            ))}
          </div>
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
            >
              Previous
            </Button>
            <span className="self-center text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flights;