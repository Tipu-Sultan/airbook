// Corrected SeatSection.jsx (updated for multiple seat selection)
// Props changed: selectedSeat → selectedSeats (array of seat_number strings)
// This matches the multiple selection implementation

import React from 'react';
import SeatGrid from './SeatGrid';

function SeatSection({ classType, seats, onSeatClick, selectedSeats = [], basePrice }) {
  const classConfig = {
    first: {
      bg: 'bg-amber-50',
      border: 'bg-amber-400',
      text: 'text-amber-800',
      title: 'First Class',
    },
    business: {
      bg: 'bg-green-50',
      border: 'bg-green-400',
      text: 'text-green-800',
      title: 'Business Class',
    },
    economy: {
      bg: 'bg-blue-50',
      border: 'bg-blue-400',
      text: 'text-blue-800',
      title: 'Economy Class',
    },
  };

  const config = classConfig[classType] || classConfig.economy; // fallback

  return (
    <div className={`relative ${config.bg} p-4 sm:p-6 rounded-lg`}>
      <h3
        className={`text-lg sm:text-xl font-bold ${config.text} mb-4 text-center`}
      >
        {config.title}
      </h3>
      <div className="flex justify-center">
        <SeatGrid
          seats={seats}
          classType={classType}
          onSeatClick={onSeatClick}
          selectedSeats={selectedSeats}
          basePrice={basePrice}
        />
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-1 ${config.border}`}
      />
    </div>
  );
}

export default SeatSection;