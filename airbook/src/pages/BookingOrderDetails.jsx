import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthContext } from '../context/AuthContext';
import { cancelBooking, getBookingDetails } from '../services/api';
import { Loader2, Plane } from 'lucide-react';
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
    seat: true,
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
        className: 'bg-green-50 text-green-800 border-green-200',
      });
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      if (!ticketRef.current) {
        console.error('Ticket ref is null');
        throw new Error('Ticket content not found');
      }
      console.log('Capturing ticket content...');
      const element = ticketRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: true,
      });
      console.log('Canvas created:', canvas);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`ticket_${bookingId}.pdf`);
      toast({
        title: 'Ticket Downloaded',
        description: 'Your ticket has been successfully downloaded.',
        className: 'bg-green-50 text-green-800 border-green-200',
      });
    } catch (err) {
      console.error('Error downloading ticket:', err);
      toast({
        title: 'Error',
        description: 'Failed to download ticket. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!token) return null;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-64"
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </motion.div>
    );
  }

  if (!bookingData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        <Card className="shadow-xl max-w-2xl mx-auto bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Plane className="h-6 w-6 mr-2" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-600 text-sm mb-6 text-center font-medium"
              >
                {error || 'Booking not found'}
              </motion.p>
            </AnimatePresence>
            <Link to="/profile">
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
              >
                Back to Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const { booking, user, flight, seat } = bookingData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen"
    >
      <Card className="shadow-xl max-w-3xl mx-auto bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Plane className="h-6 w-6 mr-2" />
            Booking #{booking.booking_id}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-600 text-sm mb-6 text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <BookingStatusTimeline status={booking.status} />
          <div className="space-y-4">
            <CollapsibleSection
              title="Booking Details"
              sectionKey="booking"
              isOpen={openSections.booking}
              toggleSection={toggleSection}
              data={booking}
            />
            <CollapsibleSection
              title="Passenger Details"
              sectionKey="passenger"
              isOpen={openSections.passenger}
              toggleSection={toggleSection}
              data={user}
            />
            <CollapsibleSection
              title="Flight Details"
              sectionKey="flight"
              isOpen={openSections.flight}
              toggleSection={toggleSection}
              data={flight}
            />
            <CollapsibleSection
              title="Seat Details"
              sectionKey="seat"
              isOpen={openSections.seat}
              toggleSection={toggleSection}
              data={seat}
            />
          </div>
          <QRCodeDisplay bookingId={booking.booking_id} />
          <BookingActions
            bookingId={booking.booking_id}
            status={booking.status}
            cancelLoading={cancelLoading}
            handleCancelBooking={handleCancelBooking}
            handleDownloadTicket={handleDownloadTicket}
          />
        </CardContent>
      </Card>
      <TicketDownload bookingData={bookingData} ref={ticketRef} />
    </motion.div>
  );
}

export default BookingOrderDetails;