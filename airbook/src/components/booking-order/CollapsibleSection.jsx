import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, User, Plane, Armchair } from 'lucide-react';
import { IndianRupee, CheckCircle, XCircle } from 'lucide-react';

const icons = {
  booking: Calendar,
  passenger: User,
  flight: Plane,
  seats: Armchair,
};

function CollapsibleSection({ 
  title, 
  sectionKey, 
  isOpen, 
  toggleSection, 
  icon: CustomIcon, 
  data // Now expects object { label: value } where value can be string, number, or JSX
}) {
  const Icon = CustomIcon || icons[sectionKey] || Calendar;

  const renderContent = () => {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return <p className="text-gray-500 text-center py-4">No details available</p>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <div className="text-sm text-gray-900 text-right max-w-[60%]">
              {typeof value === 'object' && value !== null && !React.isValidElement(value) ? (
                // Handle nested object (unlikely but safe)
                JSON.stringify(value)
              ) : (
                value
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Icon className="h-6 w-6 mr-3 text-blue-700" />
          {title}
        </h3>
        <span className="text-2xl font-light text-blue-700">
          {isOpen ? '−' : '+'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <div className="p-6 bg-white rounded-lg shadow-inner border border-blue-100">
          {renderContent()}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default CollapsibleSection;