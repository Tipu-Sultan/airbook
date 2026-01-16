import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function TicketDownload({ bookingData }, ref) {
  const { booking, user, flight, seats = [] } = bookingData || {};

  if (!bookingData) {
    return null;
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      id="ticket-content"
      ref={ref}
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        width: '595px', // A4 width in pixels at 72 DPI
        padding: '40px',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          border: '3px solid #2563eb',
          borderRadius: '12px',
          height: '100%',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '32px', borderBottom: '2px dashed #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#2563eb',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '48px', marginRight: '16px' }}>✈</span>
              AirBook E-Ticket
            </h1>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
                Booking ID: {booking.booking_id}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>
                {formatDateTime(booking.booking_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            {/* Passenger & Flight Info */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1e40af' }}>
                Passenger Details
              </h2>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Name:</span> {user.first_name} {user.last_name}
              </p>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Email:</span> {user.email}
              </p>

              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '32px 0 16px', color: '#1e40af' }}>
                Flight Details
              </h2>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Flight:</span> {flight.flight_number}
              </p>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Route:</span> {flight.departure_city} → {flight.arrival_city}
              </p>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Departure:</span> {formatDateTime(flight.departure_time)}
              </p>
              <p style={{ fontSize: '16px', margin: '8px 0' }}>
                <span style={{ fontWeight: '600' }}>Arrival:</span> {formatDateTime(flight.arrival_time)}
              </p>
            </div>

            {/* Seats & Price */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1e40af' }}>
                Seat Details ({seats.length} Seat{seats.length > 1 ? 's' : ''})
              </h2>
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '16px' }}>
                {seats.map((seat, index) => (
                  <div
                    key={seat.seat_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < seats.length - 1 ? '1px solid #cbd5e1' : 'none',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{seat.seat_number}</p>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{seat.class_name} Class</p>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>
                      ₹{Math.round(seat.price)}
                    </p>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '2px solid #2563eb',
                    marginTop: '16px',
                  }}
                >
                  <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Total Amount</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                    ₹{Math.round(booking.total_price)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & QR Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
            <div>
              <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Booking Status</p>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: booking.status === 'confirmed' ? '#16a34a' : '#dc2626',
                  textTransform: 'capitalize',
                }}
              >
                {booking.status}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                Scan for Verification
              </p>
              <QRCodeSVG value={booking.booking_id} size={140} level="H" />
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '48px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            <p>Thank you for choosing AirBook! Have a safe and pleasant journey.</p>
            <p style={{ marginTop: '8px' }}>For support: support@airbook.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(TicketDownload);