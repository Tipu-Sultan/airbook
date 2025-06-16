import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function QRCodeDisplay({ bookingId }) {
  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Scan to Verify Booking</h3>
      <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <QRCodeSVG
          value={bookingId}
          size={128}
          level="H"
          className="mx-auto"
          data-testid="qrcode"
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">Booking ID: {bookingId}</p>
    </div>
  );
}

export default QRCodeDisplay;