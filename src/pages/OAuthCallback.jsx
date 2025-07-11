import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  
  // Redirect to home page once user is loaded
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/")
      } else {
        // If we're not loading and don't have a user, something went wrong
        setError('No se pudo completar la autenticación. Por favor intente nuevamente.');
      }
    }
  }, [user, loading, navigate]);
  
  // Add a timer to show how long we've been waiting
  useEffect(() => {
    const timer = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // If it takes longer than 10 seconds, suggest trying again
  useEffect(() => {
    if (processingTime > 10) {
      setError('La autenticación está tomando más tiempo de lo esperado. Puede intentar nuevamente.');
    }
  }, [processingTime]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-gray-900">Autenticando...</h2>
        <div className="flex justify-center">
          {!error && (
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
        {error ? (
          <div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Por favor espere mientras completamos el proceso de inicio de sesión...</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
