import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

const MesaMigrationModal = ({ visible, onClose, mesa, mesas, onMigrarPedido }) => {
  const [mesaDestino, setMesaDestino] = useState('');

  useEffect(() => {
    if (visible) {
      setMesaDestino('');
    }
  }, [visible]);

  if (!visible || !mesa) return null;

  // Filtrar mesas disponibles (no incluir la mesa actual)
  const mesasDisponibles = mesas.filter(m =>
    m.id !== mesa.id && m.estado === 'disponible'
  );

  const handleSubmit = () => {
    if (mesaDestino) {
      onMigrarPedido(mesa.id, Number(mesaDestino));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Migrar Pedido - Mesa {mesa.numero || mesa.id}</h2>

        {mesasDisponibles.length === 0 ? (
          <div className="p-4 bg-gray-700 rounded-md mb-4 text-center">
            <AlertCircle size={24} className="mx-auto mb-2 text-yellow-400" />
            <p>No hay mesas disponibles para migrar el pedido.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm mb-2">Seleccione mesa destino:</label>
              <select
                value={mesaDestino}
                onChange={(e) => setMesaDestino(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-gray-100"
              >
                <option value="">-- Seleccionar Mesa --</option>
                {mesasDisponibles.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero || m.id}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!mesaDestino}
              className={`w-full p-2 rounded mb-4 flex items-center justify-center
                         ${mesaDestino ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
            >
              <ArrowRight size={16} className="mr-2" /> Migrar Pedido
            </button>
          </>
        )}

        <button onClick={onClose} className="w-full bg-gray-600 p-2 rounded hover:bg-gray-500">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default MesaMigrationModal;
