// Updated BookingForm.jsx - Single payment for multiple seats
// - Assumes backend now handles bulk booking (seats array in payload) and returns single booking_id for the group
// - Single order creation and single payment
// - Cleanup (delete group booking) on failure/dismiss
// - Toasts for success/error
// - Button shows total price

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createOrder, verifyPayment, deleteBooking } from "../../services/api";
import { toast } from "sonner";

function BookingForm({
  onSubmit,
  disabled,
  bookingStatus,
  children,
  navigate,
  flightNumber,
  count = 1,
  totalPrice = 0,
}) {
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePayment = (order, bookingId) => {
    return new Promise((resolve) => {
      const options = {
        key: "rzp_test_ioXrWPn61McM3g",
        amount: order.amount,
        currency: order.currency,
        name: "Airbook",
        description: `Payment for ${count} seat${
          count > 1 ? "s" : ""
        } on flight ${flightNumber}`,
        order_id: order.id,

        handler: async (response) => {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            await verifyPayment(bookingId, verificationData);

            toast.success("Payment Successful!", {
              description: `Your booking for ${count} seat${
                count > 1 ? "s" : ""
              } has been confirmed.`,
            });

            resolve({ status: "success" });
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
            setPaymentLoading(false);
            resolve({ status: "failed" }); // 👈 resolve, NOT reject
          }
        },

        prefill: {
          email: "user@example.com",
          contact: "9999999999",
        },

        theme: { color: "#2563eb" },

        modal: {
          ondismiss: async () => {
            toast.info("Payment cancelled. Seat released.");
            await deleteBooking(bookingId);
            setPaymentLoading(false);
            resolve({ status: "dismissed" }); // 👈 NO reject
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async () => {
        toast.error("Payment failed. Seat released.");
        setPaymentLoading(false);
        resolve({ status: "failed" }); // 👈 NO reject
      });

      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    try {
      setPaymentLoading(true);

      const booking = await onSubmit();
      const order = await createOrder(booking.booking.booking_id);

      const paymentResult = await handlePayment(
        order,
        booking.booking.booking_id
      );

      if (paymentResult.status === "success") {
        toast.success("All Seats Booked!", {
          description: `${count} seat${
            count > 1 ? "s" : ""
          } successfully booked.`,
        });

        navigate(`/booking-order/${booking.booking.booking_id}`);
      }

      // dismissed / failed → stay on same page
    } catch (err) {
      toast.error(err.message || "Booking failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {children}
      <Button
        type="submit"
        className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-lg shadow-lg text-lg"
        disabled={disabled || paymentLoading}
      >
        {paymentLoading ? (
          <span className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            Processing Payment...
          </span>
        ) : (
          <>Confirm Booking & Pay ₹{Math.round(totalPrice)}</>
        )}
      </Button>
    </form>
  );
}

export default BookingForm;
