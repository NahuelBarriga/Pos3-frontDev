import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Section({ title, icon, children, isExpanded, toggleExpand }) {
  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between bg-gray-50 p-4 text-left"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">{icon}</span>
          <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
