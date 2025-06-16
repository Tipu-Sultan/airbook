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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              onClick={onClick}
              className={`${
                isPremium ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-8 w-8 sm:h-10 sm:w-10'
              } p-0 text-xs sm:text-sm font-medium rounded-md transition-all ${
                seat.is_booked
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : isSelected
                  ? config.selected
                  : config.available
              }`}
              disabled={seat.is_booked}
              aria-label={`Seat ${seat.seat_number} in ${classType} class`}
            >
              {seat.seat_number}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 sm:p-3 rounded-md shadow-lg max-w-xs">
          <p className="text-xs sm:text-sm font-semibold">
            Seat {seat.seat_number}
          </p>
          <p className="text-xs sm:text-sm">
            Class: {seat.class_name}
          </p>
          <p className="text-xs sm:text-sm flex items-center">
            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Price: ₹{price}
          </p>
          <p className="text-xs sm:text-sm">
            Status: {seat.is_booked ? 'Unavailable' : 'Available'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SeatButton;