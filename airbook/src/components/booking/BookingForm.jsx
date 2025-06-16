import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createOrder, verifyPayment, deleteBooking } from '../../services/api';
import { toast } from '@/hooks/use-toast';

function BookingForm({ onSubmit, disabled, bookingStatus, children, bookingData, navigate }) {
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePayment = async (order, bookingId) => {
    const options = {
      key: 'rzp_test_ioXrWPn61McM3g', // Razorpay test key
      amount: order.amount,
      currency: order.currency,
      name: 'Airbook',
      description: `Booking for Flight ${bookingData.flightNumber}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          setPaymentLoading(true);
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const result = await verifyPayment(bookingId, verificationData);
          toast({
            title: 'Payment Successful',
            description: 'Your booking has been confirmed!',
            variant: 'success',
          });
          console.log('Payment verified:', result);
          navigate(`/booking-order/${result.booking.booking_id}`);
        } catch (err) {
          toast({
            title: 'Payment Verification Failed',
            description: err.message || 'Please try again.',
            variant: 'destructive',
          });
          try {
            await deleteBooking(bookingId);
          } catch (deleteErr) {
            console.error('Failed to delete booking:', deleteErr.message);
          }
        } finally {
          setPaymentLoading(false);
        }
      },
      prefill: {
        email: bookingData.userEmail || 'user@example.com',
        contact: bookingData.userPhone || '9999999999',
      },
      theme: {
        color: '#2563eb',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async () => {
      toast({
        title: 'Payment Failed',
        description: 'Payment was not successful. Booking has been canceled.',
        variant: 'destructive',
      });
      try {
        await deleteBooking(bookingId);
      } catch (deleteErr) {
        console.error('Failed to delete booking:', deleteErr.message);
      }
    });
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    try {
      setPaymentLoading(true);
      const booking = await onSubmit(); // Create booking (pending status)
      const order = await createOrder(booking.booking_id);
      await handlePayment(order, booking.booking_id);
    } catch (err) {
      toast({
        title: 'Booking Error',
        description: err.message || 'Failed to initiate booking.',
        variant: 'destructive',
      });
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {children}
      <Button
        type="submit"
        className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg shadow-md transition-all text-sm sm:text-base"
        disabled={disabled || paymentLoading || bookingStatus === 'pending'}
      >
        {paymentLoading || bookingStatus === 'pending' ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
            Processing...
          </span>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </form>
  );
}

export default BookingForm;