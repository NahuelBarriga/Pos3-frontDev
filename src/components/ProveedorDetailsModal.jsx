import React from 'react';
import Modal from './modal';
import { X } from 'lucide-react';

const ProveedorDetailsModal = ({ isOpen, onClose, proveedor }) => {
  if (!proveedor) return null;
  
  return (
    <Modal 
      titulo={`${proveedor.nombre}  #${proveedor.ref}`} 
      onClose={onClose}
      visible={isOpen}
    >
      <div className="p-4" onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-gray-800">
              {proveedor.nombre}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium text-gray-800">
              {proveedor.telefono || "No registrado"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-800">
              {proveedor.email || "No registrado"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Nombre de Referencia</p>
            <p className="font-medium text-gray-800">
              {proveedor.nombreReferencia || "No registrado"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Rubro</p>
            <p className="font-medium text-gray-800">
              {proveedor.rubro || "No especificado"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Razón Social</p>
            <p className="font-medium text-gray-800">
              {proveedor.razonSocial || "No registrada"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">CUIL/CUIT</p>
            <p className="font-medium text-gray-800">
              {proveedor.cuil || "No registrado"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Dirección</p>
            <p className="font-medium text-gray-800">
              {proveedor.direccion || "No registrada"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              proveedor.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {proveedor.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProveedorDetailsModal;
