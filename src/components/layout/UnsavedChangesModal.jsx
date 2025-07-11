import React from 'react';
import { AlertCircle } from 'lucide-react';

const UnsavedChangesModal = ({ visible, onCancel, onConfirm }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96">
        <h2 className="text-xl font-bold mb-4 text-yellow-300 flex items-center">
          <AlertCircle size={24} className="mr-2" />
          Cambios no guardados
        </h2>
        <p className="mb-6 text-gray-200">
          Tienes cambios en el layout que no han sido guardados. Si sales ahora perderás estos cambios.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
