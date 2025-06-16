import React from 'react';
import { CheckCircle } from 'lucide-react';

function BookingStatusTimeline({ status }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
        Booking Status
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <div
            className={`h-3 w-3 rounded-full ${
              status === 'confirmed' ? 'bg-green-600' : 'bg-gray-300'
            } mx-auto mb-2`}
            data-testid="confirmed-dot"
          ></div>
          <p className="text-sm font-medium text-gray-700">Confirmed</p>
        </div>
        <div className="flex-1 h-1 bg-gray-200"></div>
        <div className="flex-1 text-center">
          <div
            className={`h-3 w-3 rounded-full ${
              status === 'cancelled' ? 'bg-red-600' : 'bg-gray-300'
            } mx-auto mb-2`}
            data-testid="canceled-dot"
          ></div>
          <p className="text-sm font-medium text-gray-700">Cancelled</p>
        </div>
      </div>
    </div>
  );
}

export default BookingStatusTimeline;