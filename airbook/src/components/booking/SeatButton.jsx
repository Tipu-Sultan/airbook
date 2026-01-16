// Updated SeatButton.jsx - Larger touch targets for better mobile UX

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

function SeatButton({ seat, classType, onClick, isSelected, isPremium, basePrice }) {
  const classConfig = {
    first: {
      available: 'bg-amber-400 hover:bg-amber-500 text-white',
      selected: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    business: {
      available: 'bg-green-400 hover:bg-green-500 text-white',
      selected: 'bg-green-600 hover:bg-green-700 text-white',
    },
    economy: {
      available: 'bg-blue-400 hover:bg-blue-500 text-white',
      selected: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const config = classConfig[classType];
  const price = (basePrice * seat.price_multiplier).toFixed(2);

  const sizeClass = isPremium
    ? 'h-12 w-12 sm:h-14 sm:w-14'
    : 'h-11 w-11 sm:h-12 sm:w-12'; // Minimum ~44px for touch

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              onClick={onClick}
              className={`${sizeClass} p-0 text-sm sm:text-base font-semibold rounded-lg transition-all ${
                seat.is_booked
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : isSelected
                  ? config.selected
                  : config.available
              }`}
              disabled={seat.is_booked}
              aria-label={`Seat ${seat.seat_number} in ${classType} class`}
            >
              {seat.seat_number.replace(/^\d+/, '')} {/* Show only letter for cleaner look */}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-3 rounded-md shadow-lg">
          <p className="font-semibold">Seat {seat.seat_number}</p>
          <p>Class: {seat.class_name}</p>
          <p className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            Price: ₹{price}
          </p>
          <p>Status: {seat.is_booked ? 'Unavailable' : 'Available'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SeatButton;