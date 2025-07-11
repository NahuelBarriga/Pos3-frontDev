import React, { useState, useEffect } from 'react';
import Modal from './modal';
import { X } from 'lucide-react';

const ProveedorModal = ({ isOpen, onClose, onSubmit, proveedor }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ref: '',
    telefono: '',
    email: '',
    nombreReferencia: '',
    razonSocial: '',
    cuil: '',
    rubro: '',
    direccion: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  console.log("ProveedorModal rendered with initialData:", proveedor);
  useEffect(() => {
    if (isOpen) {
      if (proveedor) {
        setFormData({
          ...formData,
          ...proveedor
        });
        setIsEditing(true);
      } else {
        // Reset form when adding new provider
        setFormData({
          nombre: '',
          ref: '',
          telefono: '',
          email: '',
          nombreReferencia: '',
          razonSocial: '',
          cuil: '',
          rubro: '',
          direccion: '',
          activo: true
        });
        setIsEditing(false);
      }
    }
  }, [proveedor, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.ref.trim()) newErrors.ref = "El código de referencia es obligatorio";
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un email válido";
    }
    
    if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = "Ingrese un número de teléfono válido";
    }
    
    if (formData.cuil && !/^\d{11}$/.test(formData.cuil.replace(/\D/g, ''))) {
      newErrors.cuil = "El CUIL debe tener 11 dígitos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const rubros = [
    'Alimentos',
    'Bebidas',
    'Insumos',
    'Equipamiento',
    'Limpieza',
    'Otros'
  ];

  return (
    <Modal 
      titulo={isEditing ? "Editar Proveedor" : "Agregar Nuevo Proveedor"} 
      onClose={onClose}
      visible={isOpen}
    >
      <div onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900`}
                disabled={isEditing}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Referencia*
              </label>
              <input
                type="text"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.ref ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900`}
                disabled={isEditing}
              />
              {errors.ref && <p className="text-red-500 text-xs mt-1">{errors.ref}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900`}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                placeholder="Calle, número, ciudad..."
              />
            </div>
            
            {!isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUIL/CUIT
                  </label>
                  <input
                    type="text"
                    name="cuil"
                    value={formData.cuil}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.cuil ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900`}
                  />
                  {errors.cuil && <p className="text-red-500 text-xs mt-1">{errors.cuil}</p>}
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Referencia
              </label>
              <input
                type="text"
                name="nombreReferencia"
                value={formData.nombreReferencia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
              />
            </div>
            
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubro
                </label>
                <select
                  name="rubro"
                  value={formData.rubro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                >
                  <option value="">Seleccionar rubro</option>
                  {rubros.map(rubro => (
                    <option key={rubro} value={rubro}>{rubro}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
            >
              {isEditing ? "Guardar cambios" : "Agregar proveedor"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProveedorModal;
