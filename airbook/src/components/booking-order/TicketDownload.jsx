import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function TicketDownload({ bookingData }, ref) {
  const { booking, user, flight, seat } = bookingData;

  return (
    <div
      id="ticket-content"
      ref={ref}
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        width: '595px',
        height: '842px',
        padding: '32px',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          border: '2px solid rgb(37, 99, 235)',
          borderRadius: '8px',
          padding: '24px',
          height: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'rgb(37, 99, 235)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ marginRight: '8px' }}>✈</span>
          AirBook Ticket
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Booking Details</h2>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Booking ID:</span> {booking.booking_id}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Date:</span> {new Date(booking.booking_date).toLocaleString()}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Status:</span>{' '}
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Passenger</h2>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Name:</span> {user.first_name} {user.last_name}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Email:</span> {user.email}
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Flight</h2>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Flight Number:</span> {flight.flight_number}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Route:</span> {flight.departure_city} to {flight.arrival_city}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Departure:</span>{' '}
              {new Date(flight.departure_time).toLocaleString()}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Arrival:</span> {new Date(flight.arrival_time).toLocaleString()}
            </p>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Price:</span> ₹{flight.price}
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Seat</h2>
            <p style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '500' }}>Seat Number:</span> {seat.seat_number}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Verification QR Code</h2>
          <QRCodeSVG value={booking.booking_id} size={100} level="H" />
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(TicketDownload);