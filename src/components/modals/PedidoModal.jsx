import React from 'react';
import { Plus, Minus, Trash2, X, Edit } from 'lucide-react';
import { obtenerEstiloEstado } from '../../utils/estadoUtils';

// Helper to format date as DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  // If the format is already DD-MM-YYYY, just replace hyphens with slashes
  if (dateStr.includes('-')) {
    return dateStr.replace(/-/g, '/');
  }
  return dateStr;
};

const PedidoModal = ({ 
  pedido, 
  onClose, 
  onUpdateEstado, 
  onProcessPayment,
  editMode = false, 
  setEditMode = null,
  itemsMenu = [], 
  editableItems = [], 
  setEditableItems = null,
  onAddItem = null,
  onChangeItem = null,
  onChangeQuantity = null, 
  onRemoveItem = null,
  onSaveChanges = null,
  onOpenEditMode = null
}) => {
  if (!pedido) return null;
  
  const canEdit = false /*pedido.estado === 'pendiente' || pedido.estado === 'confirmado';*/

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Pedido #{pedido.id}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 bg-transparent focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium text-gray-800">
                  {pedido.cliente.nombre}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerEstiloEstado(pedido.estado, 'badge')}`}
                >
                  {pedido.estado.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha y hora</p>
                <p className="font-medium text-gray-800">
                  {formatDate(pedido.fecha)} - {pedido.hora}
                </p>
              </div>
              {(pedido.mesa && pedido.mesa.id) && ( 
                <div>
                <p className="text-sm text-gray-500">Mesa asignada</p>
                <p className="font-medium text-gray-800">
                  {pedido.mesa?.id ? `Mesa #${pedido.mesa.numero}` : "No asignada"}
                </p>
              </div>
              )}
              
              
            </div>

            {pedido.comentario && String(pedido.comentario) !== 'null' && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Comentario</p>
                <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md">
                  {pedido.comentario}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Detalles del pedido</h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <div className="border-b border-gray-200 py-2 px-3 bg-gray-100">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 text-sm font-medium text-gray-700">Producto</div>
                    <div className="col-span-2 text-center text-sm font-medium text-gray-700">Cantidad</div>
                    <div className="col-span-2 text-right text-sm font-medium text-gray-700">Precio</div>
                    <div className="col-span-2 text-right text-sm font-medium text-gray-700">Total</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {pedido.items ? (
                    pedido.items.map((item) => (
                      <div key={item.id} className="py-3 px-3">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6 text-gray-800">{item.nombre}</div>
                          <div className="col-span-2 text-center text-gray-800">{item.cantidad || 1}</div>
                          <div className="col-span-2 text-right text-gray-800">${item.precio?.toFixed(2)}</div>
                          <div className="col-span-2 text-right text-gray-800">
                            ${(item.precio * (item.cantidad || 1)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 px-3 text-center text-gray-500 italic">Cargando...</div>
                  )}
                </div>
                <div className="py-3 px-3 bg-gray-100 border-t border-gray-200">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-10 text-right font-semibold text-gray-700">Total</div>
                    <div className="col-span-2 text-right font-semibold text-gray-700">
                      ${pedido.total ? pedido.total.toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editMode && setEditableItems && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-3">Editar Items del Pedido</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentario
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={pedido.comentario || ""}
                    onChange={(e) => onChangeItem({
                      ...pedido,
                      comentario: e.target.value
                    })}
                    rows="3"
                  />
                </div>
                {editableItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <select 
                      value={item.id} 
                      onChange={(e) => onChangeItem(index, parseInt(e.target.value))}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {itemsMenu.map((menuItem) => (
                        <option key={menuItem.id} value={menuItem.id}>
                          {menuItem.nombre} (${menuItem.precio?.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => onChangeQuantity(index, Math.max(1, item.cantidad - 1))}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={item.cantidad <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => onChangeQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center border-x border-gray-300 py-1"
                        min="1"
                      />
                      <button 
                        onClick={() => onChangeQuantity(index, item.cantidad + 1)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={onAddItem}
                  className="mt-3 w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-1" /> Añadir Item
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          
          {pedido.estado === 'pendiente' && (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateEstado(pedido.id, 'confirmado')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Aceptar Pedido
              </button>
              <button
                onClick={() => onUpdateEstado(pedido.id, 'rechazado')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Rechazar Pedido
              </button>
              {canEdit && onOpenEditMode && (
                <button
                  onClick={() => onOpenEditMode(pedido)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Edit size={16} />
                  Editar
                </button>
              )}
            </div>
          )}

          {pedido.estado === 'confirmado' && (
            <div className="flex gap-2">
              {canEdit && onOpenEditMode && (
                <button
                  onClick={() => onOpenEditMode(pedido)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Edit size={16} />
                  Editar
                </button>
              )}
            </div>
          )}

          {editMode ? (
            <div className="flex gap-2">
              <button
                onClick={onSaveChanges}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidoModal;
