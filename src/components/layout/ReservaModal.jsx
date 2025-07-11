import React, { useState, useEffect } from 'react';

const ReservaModal = ({ visible, onClose, selectedReserva, mesa, onUpdateReserva, onSubmitReserva }) => {
  const [reserva, setReserva] = useState({
    fecha: new Date().toISOString().split('T')[0],
    clienteNombre: '',
    clienteTelefono: '',
    hora: '',
    cantPersonas: 1,
    comentario: '',
    estado: 'aceptada',
    mesa: mesa,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeIntervals, setTimeIntervals] = useState([]);

  useEffect(() => {
    if (visible && mesa) {
      setIsEditMode(selectedReserva != null);

      if (selectedReserva) {
        // Cargar datos de la reserva existente
        setReserva({
          ...selectedReserva,
          fecha: selectedReserva.fecha || new Date().toISOString().split('T')[0],
          hora: selectedReserva.hora || '19:00',
          cantPersonas: selectedReserva.cantPersonas || 2,
          comentario: selectedReserva.comentario || '',
          clienteNombre: selectedReserva.clienteNombre || '',
          clienteTelefono: selectedReserva.clienteTelefono || '',
          estado: 'aceptada',
          mesa: mesa || '',
        });
      } else {
        // Inicializar reserva nueva
        setReserva({
          fecha: new Date().toISOString().split('T')[0],
          hora: '19:00',
          cantPersonas: 1,
          clienteNombre: '',
          clienteTelefono: '',
          comentario: '',
          estado: 'aceptada',
          mesa: mesa || '',
        });
      }
      generateTimeSlots();
    }
  }, [visible, mesa, selectedReserva]);

  const generateTimeSlots = () => {
    const slots = [];
    const INTERVAL_MINUTES = 30;
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += INTERVAL_MINUTES) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    setTimeIntervals(slots);
  };

  if (!visible || !mesa) return null;

  const handleChange = (e) => {
    setReserva({ ...reserva, [e.target.name]: e.target.value });
  };

  const handleSubmitReservation = () => {
    const updatedReserva = {
      ...reserva,
      mesa: mesa,
      estado: 'aceptada'
    };
    if (!isEditMode) {
      onSubmitReserva(updatedReserva);
    } else {
      onUpdateReserva(mesa.id, updatedReserva);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? `Editar Reserva - Mesa ${mesa.numero || mesa.id}` : `Nueva Reserva - Mesa ${mesa.numero || mesa.id}`}
        </h2>

        <div className="flex-grow overflow-y-auto">
          <div className="space-y-4 ">
            <div>
              <label className="block text-sm mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                min={new Date().toISOString().split("T")[0]}
                value={reserva.fecha}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border bg-white border-gray-300"
                required
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-sm mb-1">Hora</label>
              <select
                name="hora"
                value={reserva.hora}
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300"
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecciona un horario</option>
                {timeIntervals.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Nombre del cliente</label>
              <input
                type="text"
                name="clienteNombre"
                value={reserva.clienteNombre}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Teléfono del cliente</label>
              <input
                type="tel"
                name="clienteTelefono"
                value={reserva.clienteTelefono}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Cantidad de Personas</label>
              <input
                type="number"
                name="cantPersonas"
                value={reserva.cantPersonas}
                onChange={handleChange}
                min="1"
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Comentario adicional</label>
              <textarea
                name="comentario"
                value={reserva.comentario}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300"
                placeholder="Detalles adicionales, preferencias, etc."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmitReservation}
            className="bg-green-600 p-2 rounded hover:bg-green-500 flex-grow"
          >
            {isEditMode ? "Actualizar Reserva" : "Confirmar Reserva"}
          </button>
          <button onClick={onClose} className="bg-gray-600 p-2 rounded hover:bg-gray-500">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ReservaModal;
