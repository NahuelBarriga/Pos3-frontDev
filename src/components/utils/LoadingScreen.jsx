import React from 'react';

const LoadingScreen = ({ title = "Pos3", subtitle = "Preparando tu experiencia..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Coffee Cup Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto relative">
            {/* Coffee Cup */}
            <div className="w-16 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-2xl mx-auto relative overflow-hidden">
              {/* Coffee liquid */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900 to-amber-700 rounded-b-2xl animate-pulse"
                   style={{ height: '60%' }}></div>
              {/* Coffee foam */}
              <div className="absolute top-1 left-1 right-1 h-2 bg-gradient-to-r from-orange-100 to-amber-200 rounded-full opacity-80"></div>
            </div>
            {/* Handle */}
            <div className="absolute right-0 top-2 w-3 h-6 border-2 border-amber-700 rounded-r-full"></div>
            
            {/* Steam Animation */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-0.5 h-4 bg-gray-400 rounded-full opacity-60 animate-steam-1"></div>
                <div className="w-0.5 h-3 bg-gray-400 rounded-full opacity-40 animate-steam-2"></div>
                <div className="w-0.5 h-5 bg-gray-400 rounded-full opacity-50 animate-steam-3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-800 mb-2">{title}</h2>
          <p className="text-amber-700 text-lg">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-amber-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes steam-1 {
          0%, 100% { transform: translateY(0) rotate(-2deg); opacity: 0.6; }
          50% { transform: translateY(-8px) rotate(2deg); opacity: 0.3; }
        }
        @keyframes steam-2 {
          0%, 100% { transform: translateY(0) rotate(1deg); opacity: 0.4; }
          50% { transform: translateY(-6px) rotate(-1deg); opacity: 0.2; }
        }
        @keyframes steam-3 {
          0%, 100% { transform: translateY(0) rotate(-1deg); opacity: 0.5; }
          50% { transform: translateY(-10px) rotate(1deg); opacity: 0.2; }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-steam-1 {
          animation: steam-1 2s ease-in-out infinite;
        }
        .animate-steam-2 {
          animation: steam-2 2.5s ease-in-out infinite;
        }
        .animate-steam-3 {
          animation: steam-3 1.8s ease-in-out infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
