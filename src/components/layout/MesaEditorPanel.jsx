import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Edit, AlertCircle, Pencil } from 'lucide-react';

const MesaEditorPanel = ({ mesa, onMesaEdit, isEditingBackground }) => {
  const [mesaEdit, setMesaEdit] = useState({ ...mesa } || {});

  // Actualizar el estado local cuando cambia la mesa seleccionada
  useEffect(() => {
    if (mesa) {
      setMesaEdit({ ...mesa });
    }
  }, [mesa?.id]); // Solo actualizar cuando cambia la ID (nueva mesa seleccionada)

  // Sincronizar solo la posición cuando cambia
  useEffect(() => {
    if (mesa && mesa.locacion && mesaEdit.id === mesa.id) {
      setMesaEdit(prev => ({
        ...prev,
        locacion: mesa.locacion
      }));
    }
  }, [
    mesa?.id,
    Array.isArray(mesa?.locacion)
      ? `${mesa?.locacion[0]}-${mesa?.locacion[1]}`
      : `${mesa?.locacion?.x}-${mesa?.locacion?.y}`
  ]);

  if (!mesa) return (
    <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center text-gray-400">
      <Edit size={32} className="sm:hidden mb-2 opacity-70" />
      <Edit size={48} className="hidden sm:block mb-2 opacity-70" />
      <p className='text-gray-400 text-sm sm:text-base'>Seleccione una mesa para editar</p>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedMesa = {
      ...mesaEdit,
      [name]: value
    };
    setMesaEdit(updatedMesa);
    onMesaEdit(updatedMesa); // Propagar cambios inmediatamente
  };

  const handleSizeChange = (dimension, value) => {
    const updatedMesa = {
      ...mesaEdit,
      size: {
        ...mesaEdit.size || {},
        [dimension]: parseInt(value)
      }
    };
    setMesaEdit(updatedMesa);
    onMesaEdit(updatedMesa); // Propagar cambios inmediatamente
  };

  const handleEstadoChange = (e) => {
    const { value } = e.target;

    // Check if mesa has active orders, reservations, or is occupied
    const hasActiveOrders = mesa.pedido && Array.isArray(mesa.pedido) && mesa.pedido.length > 0;
    const hasReservations = mesa.reserva && Array.isArray(mesa.reserva) && mesa.reserva.length > 0;
    const isOccupied = mesa.estado === 'ocupada';

    // Allow setting to "no disponible" even if there are orders/reservations
    if (value === 'no disponible' || (!hasActiveOrders && !hasReservations && !isOccupied)) {
      const updatedMesa = {
        ...mesaEdit,
        estado: value
      };
      setMesaEdit(updatedMesa);
      onMesaEdit(updatedMesa);
    }
  };


  const canChangeToDisponible = () => {
    const hasActiveOrders = mesa.pedido && Array.isArray(mesa.pedido) && mesa.pedido.length > 0;
    const hasReservations = mesa.reserva && Array.isArray(mesa.reserva) && mesa.reserva.length > 0;
    const isOccupied = mesa.estado === 'ocupada';

    return !hasActiveOrders && !hasReservations && !isOccupied;
  };

  return (
    <div className="p-3 sm:p-4 h-full overflow-y-auto">
      {!isEditingBackground ? (
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-100">
            Editar Mesa #{mesaEdit.numero || mesaEdit.id}
          </h2>

          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700 rounded-md">
            <div className="font-semibold text-gray-100 mb-1 text-sm sm:text-base">Posición actual:</div>
            <div className="text-gray-300 flex justify-between items-center text-xs sm:text-sm">
              <span>X: {Array.isArray(mesaEdit.locacion) ? mesaEdit.locacion[0] : mesaEdit.locacion?.x}</span>
              <span>Y: {Array.isArray(mesaEdit.locacion) ? mesaEdit.locacion[1] : mesaEdit.locacion?.y}</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm mb-1 text-gray-300">Número de Mesa</label>
              <input
                type="text"
                name="numero"
                value={mesaEdit.numero || ''}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-1 text-gray-300">Estado</label>
              <select
                name="estado"
                value={mesaEdit.estado || 'disponible'}
                onChange={handleEstadoChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
              >
                <option value="disponible" >
                  Disponible
                </option>
                <option value="no disponible" disabled={!canChangeToDisponible()}>No Disponible</option>
              </select>
              {!canChangeToDisponible() && mesaEdit.estado !== 'no disponible' && (
                <p className="text-xs text-yellow-400 mt-1 flex items-start gap-1">
                  <AlertCircle size={12} className="mt-0.5" />
                  No se puede cambiar a no disponible: la mesa tiene pedidos, reservas o está ocupada
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-1 text-gray-300">Tamaño (px)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400">Ancho</label>
                  <input
                    type="number"
                    name="width"
                    value={mesaEdit.size?.width || '80'}
                    onChange={(e) => handleSizeChange('width', e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Alto</label>
                  <input
                    type="number"
                    name="height"
                    value={mesaEdit.size?.height || '80'}
                    onChange={(e) => handleSizeChange('height', e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions sections */}
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {/* Movement instructions */}
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="text-xs sm:text-sm font-bold text-gray-200 mb-2">Controles de Movimiento</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <div className="flex gap-1">
                    <ArrowUp size={12} />
                    <ArrowDown size={12} />
                    <ArrowLeft size={12} />
                    <ArrowRight size={12} />
                  </div>
                  <span>Use las flechas del teclado para mover la mesa seleccionada</span>
                </div>
                <div className="flex items-start gap-2">
                  <Edit size={12} className="mt-0.5" />
                  <span>Los cambios se aplican inmediatamente en la vista</span>
                </div>
              </div>
            </div>



            {/* Save reminder */}
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-md p-3">
              <div className="flex items-start gap-2 text-yellow-300 text-xs">
                <AlertCircle size={12} className="mt-0.5" />
                <span>Recuerde presionar "Guardar Layout" para confirmar todos los cambios</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Pencil size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-100">Editor de Fondo</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h3 className="font-semibold text-gray-200 mb-3">Instrucciones:</h3>
                <ol className="list-decimal ml-5 space-y-2 text-gray-300 text-sm">
                  <li>Haga clic y arrastre para crear una línea</li>
                  <li>Haga doble clic en una línea para seleccionarla</li>
                  <li>Presione "Delete" para borrar la línea seleccionada</li>
                  <li>Use "Ctrl+Z" para deshacer cambios</li>
                  <li>Presione "Guardar" cuando termine</li>
                </ol>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                <p className="text-yellow-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-400">💡</span>
                  Las líneas se ajustarán automáticamente a la cuadrícula para mayor precisión.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MesaEditorPanel;
