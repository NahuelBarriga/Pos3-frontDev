import {useState} from 'react';
import { getRelativeTime } from '../../utils/timeUtils';
import SendCuponModal from './SendCuponModal';

const UserDetailsModal = ({ isOpen, user, onClose }) => {
  const [sendCuponModalOpen, setSendCuponModalOpen] = useState(false);

  if (!isOpen || !user) return null;
  console.log("User Details Modal:", user);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Detalles del Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-transparent hover:bg-gray-100 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Información Básica</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre</label>
              <p className="text-gray-900 font-medium">{user?.nombre}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-gray-900">{user.telefono || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Rol</label>
              <p className="text-gray-900">{user.cargo || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Categoría</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.category === 'A' ? 'bg-green-100 text-green-800' :
                user.category === 'B' ? 'bg-yellow-100 text-yellow-800' :
                user.category === 'C' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.category || 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Estadísticas</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Total Gastado</label>
              <p className="text-2xl font-bold text-green-600">${user.totalSpent.toFixed(2)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Cantidad de Pedidos</label>
              <p className="text-xl font-semibold text-blue-600">{user.orderCount}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Gasto Promedio por Pedido</label>
              <p className="text-lg text-gray-900">${(user.totalSpent / user.orderCount).toFixed(2)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Último Pedido</label>
              <p className="text-gray-900">{getRelativeTime(user.lastOrder?.timestamp) || 'N/A'}</p>
              {user.lastOrder && (
                <p className="text-sm text-gray-500">{new Date(user.lastOrder.timestamp).toLocaleString()}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
              <p className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        {(user.direccion || user.notas) && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Información Adicional</h3>
            
            {user.direccion && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-gray-900">{user.direccion}</p>
              </div>
            )}
            
            {user.notas && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notas</label>
                <p className="text-gray-900">{user.notas}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t flex justify-end">
          <button
            onClick={() => setSendCuponModalOpen(true)}
            className="mr-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enviar Cupón
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
        {sendCuponModalOpen && (
          <SendCuponModal
            isOpen={sendCuponModalOpen}
            onClose={() => setSendCuponModalOpen(false)}
            email={user.email}
          />
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;
