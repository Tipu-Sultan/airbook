import React from 'react';
import { Armchair } from 'lucide-react';

function SeatLegend() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
        <Armchair className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
        Seat Legend
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-400 rounded mr-2" />
          <span className="text-gray-700">Economy Available</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-600 rounded mr-2" />
          <span className="text-gray-700">Economy Selected</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-green-400 rounded mr-2" />
          <span className="text-gray-700">Business Available</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-green-600 rounded mr-2" />
          <span className="text-gray-700">Business Selected</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-amber-400 rounded mr-2" />
          <span className="text-gray-700">First Available</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-amber-600 rounded mr-2" />
          <span className="text-gray-700">First Selected</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-300 rounded mr-2" />
          <span className="text-gray-700">Unavailable</span>
        </div>
      </div>
    </div>
  );
}

export default SeatLegend;