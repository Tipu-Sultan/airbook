import React from 'react';
import SeatButton from './SeatButton';

function SeatGrid({ seats, classType, onSeatClick, selectedSeat, basePrice }) {
  const rows = Object.keys(seats).sort();
  const maxCols = Math.max(...rows.map((row) => seats[row].length), 4);
  const isPremium = classType === 'first' || classType === 'business';

  return (
    <div className="space-y-2 sm:space-y-3">
      {rows.map((row) => (
        <div
          key={row}
          className={`flex items-center justify-center gap-1 sm:gap-2 ${
            isPremium ? 'gap-2 sm:gap-4' : ''
          }`}
        >
          {/* Left side seats */}
          {seats[row]
            .slice(0, Math.ceil(maxCols / 2))
            .map((seat) => (
              <SeatButton
                key={seat.seat_id}
                seat={seat}
                classType={classType}
                onClick={() => onSeatClick(seat)}
                isSelected={selectedSeat === seat.seat_number}
                isPremium={isPremium}
                basePrice={basePrice}
              />
            ))}
          {/* Aisle */}
          <div
            className={`w-2 sm:w-4 ${isPremium ? 'w-4 sm:w-8' : ''}`}
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
                isSelected={selectedSeat === seat.seat_number}
                isPremium={isPremium}
                basePrice={basePrice}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export default SeatGrid;