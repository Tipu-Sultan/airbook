// Updated SeatGrid.jsx - Added horizontal scroll, row labels, larger gaps, numeric row sort support (handled in Book)

import React from 'react';
import SeatButton from './SeatButton';

function SeatGrid({ seats, classType, onSeatClick, selectedSeats, basePrice }) {
  const rows = Object.keys(seats).sort((a, b) => Number(a) - Number(b));
  const maxCols = Math.max(...rows.map((row) => seats[row].length), 4);
  const isPremium = classType === 'first' || classType === 'business';

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-block min-w-full">
        <div className="space-y-4 sm:space-y-6">
          {rows.map((row) => (
            <div
              key={row}
              className={`flex items-center justify-center gap-3 sm:gap-5 ${
                isPremium ? 'gap-5 sm:gap-8' : ''
              }`}
            >
              <div className="w-10 text-center font-bold text-gray-700 text-lg">
                {row}
              </div>
              {/* Left side seats */}
              {seats[row]
                .slice(0, Math.ceil(maxCols / 2))
                .map((seat) => (
                  <SeatButton
                    key={seat.seat_id}
                    seat={seat}
                    classType={classType}
                    onClick={() => onSeatClick(seat)}
                    isSelected={selectedSeats.includes(seat.seat_number)}
                    isPremium={isPremium}
                    basePrice={basePrice}
                  />
                ))}
              {/* Aisle */}
              <div
                className={`w-10 sm:w-20 ${isPremium ? 'w-16 sm:w-32' : ''}`}
              />
              {/* Right side seats */}
              {seats[row]
                .slice(Math.ceil(maxCols / 2))
                .map((seat) => (
                  <SeatButton
                    key={seat.seat_id}
                    seat={seat}
                    classType={classType}
                    onClick={() => onSeatClick(seat)}
                    isSelected={selectedSeats.includes(seat.seat_number)}
                    isPremium={isPremium}
                    basePrice={basePrice}
                  />
                ))}
              <div className="w-10 text-center font-bold text-gray-700 text-lg">
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeatGrid;