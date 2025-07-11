import { AlertTriangle, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function RenderNonAuthorized() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Inicia la animación después de cargar el componente
    setIsAnimating(true);
    
    // Configura un intervalo para repetir la animación
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 100);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

const handleRedirect = () => {
    window.location.replace("/");
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className={`mx-auto w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center ${isAnimating ? 'animate-bounce' : ''}`}>
            <Coffee size={48} className="text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Ups! Zona Restringida</h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Lamentablemente aquí no se sirve café. 
          Puedes probar volviendo al menú principal.
        </p>
        
        {/* <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500">
              Aquí puedes insertar una imagen divertida o ilustración
            </span>
          </div>
        </div> */}
        
        <button 
          onClick={handleRedirect}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
        >
          Volver al menú principal
        </button>
        
        <p className="mt-6 text-gray-500 text-sm">
          Si crees que deberías tener acceso a esta página, 
          contacta con el administrador o prueba con más café.
        </p>
      </div>
    </div>
  );
}