import React, { useState, useEffect } from 'react';
import { submitMov, getMedioPago } from '../../services/layoutHelper';
import { toast } from "react-toastify";

const PagoModal = ({ visible, onClose, total, mesa, pedidoId }) => {
  const [medioPago, setMedioPago] = useState([]);
  const [pago, setPago] = useState({
    total: total || 0,
    medio: '',
    pedidos: [],
  });

  useEffect(() => {
    setPago((prev) => ({ ...prev, total }));
  }, [total]);

  useEffect(() => {
    if (mesa?.pedido) {
      if (pedidoId) {
        // If pedidoId is provided, only pay that specific pedido
        setPago(prev => ({
          ...prev,
          pedidos: [pedidoId],
        }));
      } else {
        // Otherwise, pay all confirmed pedidos
        setPago(prev => ({
          ...prev,
          pedidos: mesa.pedido.filter(p => p.estado === 'confirmado').map(p => p.id),
        }));
      }
    }
  }, [mesa, pedidoId]);

  useEffect(() => { //obtiene los medios de pago
    const fetchMediosPago = async () => {
      try { 
        console.log('Fetching medios de pago...');
        const response = await getMedioPago();
        console.log('PagoModal - getMedioPago response:', response);
        
        if (response && response.data) {
          setMedioPago(response.data);
        } else {
          console.error('Invalid response format:', response);
          toast.error('Error al obtener los medios de pago. Por favor, inténtalo de nuevo.');
        }
      } 
      catch (error) {
        console.error('Error fetching medios de pago:', error);
        toast.error('Error al obtener los medios de pago. Por favor, inténtalo de nuevo.');
      }
    }
    fetchMediosPago();
  },[]);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!pago.medio) {
      toast.warning('Por favor, selecciona un medio de pago.');
      return;
    }
    const response = await submitMov(pago);
    if (response?.status === 201) {
      toast.success('Pago realizado con éxito!');
      onClose();
    } else {
      toast.error('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    setPago({ ...pago, medio: '' });
    onClose();
  }

  const handleChange = (e) => {
    setPago({ ...pago, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Efectuar Pago
        </h2>
        <div className="mb-4">
          <p className="text-lg font-bold text-center">
            Total: <span className="text-green-400">${pago.total.toFixed(2)}</span>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-2">Medio de pago</label>
          <select
            name="medio"
            value={pago.medio}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-gray-100"
            required
          >
            <option value="" disabled>
              Selecciona un medio de pago
            </option>
            {medioPago.map((medio) => (
              <option key={medio.id} value={medio.id}>
                {medio.nombre} - {medio.ref}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 mt-6 justify-end">
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${pago.medio
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-500 cursor-not-allowed'
              }`}
            onClick={handleSubmit}
            disabled={!pago.medio}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoModal;
