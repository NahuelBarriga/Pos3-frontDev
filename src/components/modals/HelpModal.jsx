import { useState } from "react";
import { X, HelpCircle, User } from "lucide-react";
import toast from "react-hot-toast";
//import solicitarAyuda from "../services/solicitarAyuda.js";

const HelpModal = ({ isOpen, onClose, mesaInfo }) => {
  const [helpRequested, setHelpRequested] = useState(false);

  const handleRequestHelp = async () => {
    try {
      // TODO: Implement solicitarAyuda service call
      // await solicitarAyuda({ mesa: mesaInfo, reason: "help_request" });
      
      setHelpRequested(true);
      toast.success("¡Solicitud de ayuda enviada! Un miembro del personal se acercará pronto.");
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setHelpRequested(false);
      }, 3000);
    } catch (error) {
      toast.error("Error al enviar la solicitud. Intenta nuevamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-naranja/10 p-2 rounded-full">
              <HelpCircle className="w-6 h-6 text-naranja" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Solicitar Ayuda</h2>
              {mesaInfo && (
                <p className="text-sm text-gray-600">Mesa {mesaInfo.numero}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-transparent rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-naranja/50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!helpRequested ? (
            <>
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-700 text-lg mb-2">
                  ¿Necesitas ayuda en tu mesa?
                </p>
                <p className="text-gray-600 text-sm">
                  Un miembro de nuestro personal se acercará a ayudarte con cualquier consulta que tengas.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium bg-red-50 hover:bg-red-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRequestHelp}
                  className="flex-1 px-4 py-2 bg-naranja text-white rounded-lg hover:bg-naranja/90 transition-colors font-medium"
                >
                  Solicitar Ayuda
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ¡Solicitud Enviada!
              </h3>
              <p className="text-gray-600">
                Un miembro de nuestro personal se acercará a tu mesa en unos momentos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;