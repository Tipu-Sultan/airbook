import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, XCircle } from 'lucide-react';

function BookingActions({ bookingId, status, cancelLoading, handleCancelBooking, handleDownloadTicket }) {
  return (
    <div className="mt-8 space-y-4 bg-grey-900 p-6 rounded-lg shadow-md">
      {status === 'confirmed' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={cancelLoading}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              {cancelLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Cancelling...
                </span>
              ) : (
                <span className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Cancel Booking
                </span>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to cancel booking #{bookingId}? This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex gap-4">
        <Link to="/profile" className="flex-1">
          <Button
            variant="outline"
            className="w-full h-12 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
          >
            Back to Profile
          </Button>
        </Link>
        <Button
          onClick={handleDownloadTicket}
          className="flex-1 h-12 bg-blue-600 text-white hover:bg-blue-700 transition-all"
          data-testid="download-ticket-button"
        >
          <span className="h-5 w-5 mr-2">↓</span>
          Download Ticket
        </Button>
      </div>
    </div>
  );
}

export default BookingActions;