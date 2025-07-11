import React from 'react';

export const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-naranja"></div>
  </div>
);

export const NoDataMessage = ({ message = "No hay datos disponibles" }) => (
  <div className="h-64 flex flex-col items-center justify-center text-gray-400">
    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <p>{message}</p>
  </div>
);

export const ensureArray = (data) => {
  return Array.isArray(data) ? data : [];
};
