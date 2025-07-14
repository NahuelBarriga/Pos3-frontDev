import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Home, RotateCcw } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [navigate]);

  const handleManualRedirect = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Animated coffee icon */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center animate-bounce">
            <Coffee size={48} className="text-orange-500" />
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          ¡Página no encontrada!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Parece que esta página se perdió en la cocina. 
          Te redirigiremos al menú principal automáticamente.
        </p>

        {/* Countdown */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-orange-600">
            <RotateCcw size={20} className="animate-spin" />
            <span className="font-medium">
              Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </span>
          </div>
        </div>

        {/* Manual redirect button */}
        <button 
          onClick={handleManualRedirect}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2 mx-auto"
        >
          <Home size={20} />
          Ir al menú ahora
        </button>

        {/* Additional info */}
        <p className="mt-6 text-gray-500 text-sm">
          Si continúas teniendo problemas, contacta con el administrador.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
