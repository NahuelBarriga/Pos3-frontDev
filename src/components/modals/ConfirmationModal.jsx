import React from 'react';
import { AlertTriangle, X, AlertCircle, Info, CheckCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning", // 'warning', 'danger', 'info', 'success'
  confirmButtonStyle = null,
  cancelButtonStyle = null
}) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={24} className="text-yellow-500" />;
      case 'info':
        return <Info size={24} className="text-blue-500" />;
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />;
      default:
        return <AlertCircle size={24} className="text-yellow-500" />;
    }
  };

  const getDefaultConfirmStyle = () => {
    switch (type) {
      case 'danger':
        return "bg-red-600 hover:bg-red-700 text-white";
      case 'warning':
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case 'info':
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case 'success':
        return "bg-green-600 hover:bg-green-700 text-white";
      default:
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none ml-4"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={cancelButtonStyle || "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={confirmButtonStyle || `px-4 py-2 rounded-md transition-colors ${getDefaultConfirmStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
