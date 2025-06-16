import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, User, Plane, Armchair, CheckCircle, XCircle } from 'lucide-react';

const icons = {
  booking: Calendar,
  passenger: User,
  flight: Plane,
  seat: Armchair,
};

function CollapsibleSection({ title, sectionKey, isOpen, toggleSection, data }) {
  const Icon = icons[sectionKey];

  const renderContent = () => {
    switch (sectionKey) {
      case 'booking':
        return (
          <>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Booking ID</p>
              <p className="text-sm text-gray-900 font-semibold break-all">{data.booking_id}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Booking Date</p>
              <p className="text-sm text-gray-900">{new Date(data.booking_date).toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Booking Price</p>
              <p className="text-sm text-gray-900 font-semibold flex items-center">
                <span className="h-4 w-4 mr-1 text-green-600">₹</span>
                {data.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Booking Status</p>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  data.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {data.status === 'confirmed' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </span>
            </div>
          </>
        );
      case 'passenger':
        return (
          <>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-sm text-gray-900 font-semibold font-capitalize">
                {data.first_name.toUpperCase()} {data.last_name.toUpperCase()}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900">{data.email}</p>
            </div>
          </>
        );
      case 'flight':
        return (
          <>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Flight Number</p>
              <p className="text-sm text-gray-900 font-semibold">{data.flight_number}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Route</p>
              <p className="text-sm text-gray-900">
                {data.departure_city} to {data.arrival_city}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Departure</p>
              <p className="text-sm text-gray-900">{new Date(data.departure_time).toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-700">Arrival</p>
              <p className="text-sm text-gray-900">{new Date(data.arrival_time).toLocaleString()}</p>
            </div>
          </>
        );
      case 'seat':
        return (
          <>
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-700">Seat Number</p>
            <p className="text-sm text-gray-900 font-semibold">{data.seat_number}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-700">Seat Class</p>
            <p className={`text-sm text-gray-900 font-semibold `}>{data.class_name}</p>
          </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Icon className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <span className="text-sm text-gray-600">{isOpen ? 'Hide' : 'Show'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 space-y-3">{renderContent()}</CollapsibleContent>
    </Collapsible>
  );
}

export default CollapsibleSection;