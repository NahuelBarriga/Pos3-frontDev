import React, { useState, useEffect } from 'react';

const MesaStatusModal = ({ user, visible, onClose, mesa, onUpdateEstado }) => {
  const [nuevoEstado, setNuevoEstado] = useState(mesa?.estado || 'disponible');

  useEffect(() => {
    if (visible && mesa) {
      setNuevoEstado(mesa.estado || 'disponible');
    }
  }, [visible, mesa]);

  if (!visible || !mesa) return null;

  const handleSubmit = () => {
    onUpdateEstado(mesa.id, nuevoEstado);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-80" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Cambiar estado - Mesa {mesa.numero || mesa.id}</h2>
        <div className="mb-4">
          <label className="block text-sm mb-2">Estado de la mesa</label>
          <select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-100"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            {user.cargo === 'admin' && (
              <option value="no disponible">No Disponible</option>
            )}
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-700 rounded hover:bg-green-600">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MesaStatusModal;
