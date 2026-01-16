import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthContext } from '../context/AuthContext';
import { cancelBooking, getBookingDetails } from '../services/api';
import { Loader2, Plane, Users, IndianRupee, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import BookingStatusTimeline from '../components/booking-order/BookingStatusTimeline';
import CollapsibleSection from '../components/booking-order/CollapsibleSection';
import BookingActions from '../components/booking-order/BookingActions';
import QRCodeDisplay from '../components/booking-order/QRCodeDisplay';
import TicketDownload from '../components/booking-order/TicketDownload';

function BookingOrderDetails() {
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const ticketRef = useRef(null);

  const [openSections, setOpenSections] = useState({
    booking: true,
    passenger: true,
    flight: true,
    seats: true,
  });

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/booking-order/${bookingId}`);
      return;
    }
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const data = await getBookingDetails(bookingId);
        if (!data.booking) {
          throw new Error('Booking not found');
        }
        setBookingData(data);
      } catch (err) {
        setError(err.message || 'Error fetching booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token, navigate, bookingId]);

  const handleCancelBooking = async () => {
    setCancelLoading(true);
    try {
      await cancelBooking(bookingId);
      setBookingData((prev) => ({
        ...prev,
        booking: { ...prev.booking, status: 'canceled' },
      }));
      toast({
        title: 'Booking Cancelled',
        description: `Booking ${bookingId} has been successfully cancelled.`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Cancellation Failed',
        description: err.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) {
      toast({ title: 'Error', description: 'Ticket content not ready', variant: 'destructive' });
      return;
    }
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Airbook_Ticket_${bookingId}.pdf`);
      toast({ title: 'Success', description: 'Ticket downloaded successfully!', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <motion.div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="bg-red-600 text-white">
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-6">{error || 'Invalid booking ID'}</p>
            <Button asChild>
              <Link to="/profile">Back to My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const { booking, user, flight, seats = [] } = bookingData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 px-4 lg:px-8 bg-gray-50 min-h-screen"
    >
      <Card className="max-w-4xl mx-auto shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
              <Plane className="h-8 w-8 mr-3" />
              Booking #{booking.booking_id}
            </CardTitle>
            <div className="text-right">
              <p className="text-3xl font-bold flex items-center justify-end">
                <IndianRupee className="h-7 w-7 mr-1" />
                {Math.round(booking.total_price)}
              </p>
              <p className="text-sm opacity-90">{seats.length} Seat{seats.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-10 space-y-8">
          <BookingStatusTimeline status={booking.status} />

          <CollapsibleSection
            title="Booking Details"
            sectionKey="booking"
            isOpen={openSections.booking}
            toggleSection={toggleSection}
            icon={Calendar}
            data={{
              'Booking ID': booking.booking_id,
              'Booking Date': formatDate(booking.booking_date),
              'Status': booking.status,
              'Total Amount': `₹${Math.round(booking.total_price)}`,
            }}
          />

          <CollapsibleSection
            title="Passenger Details"
            sectionKey="passenger"
            isOpen={openSections.passenger}
            toggleSection={toggleSection}
            icon={Users}
            data={{
              Name: `${user.first_name} ${user.last_name}`,
              Email: user.email,
            }}
          />

          <CollapsibleSection
            title="Flight Details"
            sectionKey="flight"
            isOpen={openSections.flight}
            toggleSection={toggleSection}
            icon={Plane}
            data={{
              'Flight Number': flight.flight_number,
              Route: (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {flight.departure_city} → {flight.arrival_city}
                </div>
              ),
              Departure: (
                <div>
                  <p className="font-medium">{formatDate(flight.departure_time)}</p>
                  <p className="text-sm text-gray-600">{formatTime(flight.departure_time)}</p>
                </div>
              ),
              Arrival: (
                <div>
                  <p className="font-medium">{formatDate(flight.arrival_time)}</p>
                  <p className="text-sm text-gray-600">{formatTime(flight.arrival_time)}</p>
                </div>
              ),
            }}
          />

          {/* Custom Seats Section - handles multiple seats */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('seats')}
              className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 transition flex justify-between items-center font-semibold text-lg"
            >
              <span className="flex items-center">
                <Plane className="h-5 w-5 mr-3 text-blue-700" />
                Seat Details ({seats.length} Seat{seats.length > 1 ? 's' : ''})
              </span>
              <span className="text-2xl">{openSections.seats ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {openSections.seats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {seats.map((seat, index) => (
                      <div
                        key={seat.seat_id}
                        className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-lg">Seat {seat.seat_number}</p>
                          <p className="text-gray-600">{seat.class_name} Class</p>
                        </div>
                        <p className="text-xl font-bold text-blue-700 flex items-center">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          {Math.round(seat.price)}
                        </p>
                      </div>
                    ))}
                    <div className="border-t-2 border-blue-300 pt-4 text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        Total: ₹{Math.round(booking.total_price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <QRCodeDisplay bookingId={booking.booking_id} />

          <BookingActions
            status={booking.status}
            cancelLoading={cancelLoading}
            handleCancelBooking={handleCancelBooking}
            handleDownloadTicket={handleDownloadTicket}
          />
        </CardContent>
      </Card>

      <div className="hidden">
        <TicketDownload bookingData={bookingData} ref={ticketRef} />
      </div>
    </motion.div>
  );
}

export default BookingOrderDetails;