import api from './api';
import { MODO_PRUEBA } from '../config';

const API_URL = `/proveedores`;

const mockProveedores = [
  {
    id: 1,
    nombre: 'Distribuidora XYZ',
    ref: 'XYZ-001',
    telefono: '2235410971',
    email: 'contacto@xyz.com',
    nombreReferencia: 'Juan Pérez',
    razonSocial: 'Distribuidora XYZ S.A.',
    cuil: '30123456789',
    rubro: 'Alimentos',
    activo: true
  },
  {
    id: 2,
    nombre: 'Bebidas ABC',
    ref: 'ABC-002', 
    telefono: '2235410972',
    email: 'ventas@abc.com',
    nombreReferencia: 'María García',
    razonSocial: 'Bebidas ABC S.R.L.',
    cuil: '30987654321',
    rubro: 'Bebidas',
    activo: true
  }
];

export const getProveedores = async () => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para los proveedores");
    return new Promise((resolve) => setTimeout(() => resolve(mockProveedores), 500));
  }
  
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    return [];
  }
};

export const getProveedorById = async (id) => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para el proveedor");
    const proveedor = mockProveedores.find(p => p.id === parseInt(id));
    return new Promise((resolve) => setTimeout(() => resolve(proveedor), 500));
  }
  
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el proveedor con ID ${id}:`, error);
    return null;
  }
};

export const createProveedor = async (proveedorData) => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para crear proveedor");
    const newProveedor = { 
      id: mockProveedores.length + 1, 
      ...proveedorData, 
      activo: true
    };
    mockProveedores.push(newProveedor);
    return new Promise((resolve) => setTimeout(() => resolve({ status: 201, data: newProveedor }), 500));
  }
  
  try {
    const response = await api.post(API_URL, proveedorData);
    return response;
  } catch (error) {
    console.error("Error al crear el proveedor:", error);
    throw error;
  }
};

export const updateProveedor = async (id, proveedorData) => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para actualizar proveedor");
    const index = mockProveedores.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockProveedores[index] = { ...mockProveedores[index], ...proveedorData };
      return new Promise((resolve) => 
        setTimeout(() => resolve({ status: 200, data: mockProveedores[index] }), 500)
      );
    }
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Proveedor no encontrado")), 500)
    );
  }
  
  try {
    const response = await api.patch(`${API_URL}/${id}`, proveedorData);
    return response;
  } catch (error) {
    console.error(`Error al actualizar el proveedor con ID ${id}:`, error);
    throw error;
  }
};

export const toggleProveedorStatus = async (id) => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para cambiar estado del proveedor");
    const index = mockProveedores.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockProveedores[index].activo = !mockProveedores[index].activo;
      return new Promise((resolve) => 
        setTimeout(() => resolve({ status: 200, data: mockProveedores[index] }), 500)
      );
    }
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Proveedor no encontrado")), 500)
    );
  }
  
  try {
    const response = await api.patch(`${API_URL}/${id}/toggle`);
    return response;
  } catch (error) {
    console.error(`Error al cambiar el estado del proveedor con ID ${id}:`, error);
    throw error;
  }
};

export const deleteProveedor = async (id) => {
  if (MODO_PRUEBA) {
    console.log("⚠️ Usando datos MOCK para eliminar proveedor");
    const index = mockProveedores.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockProveedores.splice(index, 1);
      return new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 500));
    }
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Proveedor no encontrado")), 500)
    );
  }
  
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar el proveedor con ID ${id}:`, error);
    throw error;
  }
};
