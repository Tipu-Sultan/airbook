import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../services/api';
import { Button } from '@/components/ui/button';
import { Loader2, User, Plane, Calendar, IndianRupee } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function Profile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        setUser(data.user);
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || 'Error fetching profile or bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  if (!token) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Your Profile</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
                <User className="h-7 w-7 mr-3" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {error && (
                <p className="text-red-600 text-center font-medium mb-6 bg-red-50 p-4 rounded-lg">
                  {error}
                </p>
              )}
              {user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="font-bold text-gray-900">{user.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">Unable to load profile details.</p>
              )}
            </CardContent>
          </Card>

          {/* Booking History */}
          <Card className="shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
                <Plane className="h-7 w-7 mr-3" />
                Booking History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-6">No bookings found yet.</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/">Search Flights</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Flight</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((bookingData) => {
                        const { booking, flight, seats = [] } = bookingData;
                        const seatNumbers = seats.map((s) => s.seat_number).join(', ');
                        const seatCount = seats.length;

                        return (
                          <TableRow key={booking.booking_id} className="hover:bg-gray-50 transition">
                            <TableCell className="font-medium">{booking.booking_id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{flight.flight_number}</p>
                                <p className="text-sm text-gray-600">
                                  {flight.departure_city} → {flight.arrival_city}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                {formatDate(flight.departure_time)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{seatNumbers}</p>
                                <p className="text-sm text-gray-600">
                                  {seatCount} seat{seatCount > 1 ? 's' : ''}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end text-lg font-bold text-green-700">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {Math.round(booking.total_price || 0)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                                className={
                                  booking.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Link to={`/booking-order/${booking.booking_id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Profile;