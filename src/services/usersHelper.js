import api from './api';
import userDTO from "../models/userDTO";
import {API_PORT, MODO_PRUEBA} from '../config';

const API_URL = `/users`;

const mockUsuarios = [
    { id: 1, nombre: "Juan", apellido: "Pérez", cargo: "Empleado", cumpleaños: "1990-05-15", email: "juan.perez@example.com" },
    { id: 2, nombre: "María", apellido: "Gómez", cargo: "Administrador", cumpleaños: "1985-07-22", email: "maria.gomez@example.com" },
    { id: 3, nombre: "Carlos", apellido: "López", cargo: "Cliente", cumpleaños: "1993-02-10", email: "carlos.lopez@example.com" }
  ];



export const getUsuarios = async () => {
    if (MODO_PRUEBA) {
      console.log("⚠️ Usando datos MOCK para las pedidos");
      return new Promise((resolve) => setTimeout(() => resolve(mockUsuarios), 500)); // Simula un delay de 500ms
    }
  
    try {
      const response = await api.get(API_URL);
      //console.log(response.data);
      return response.data.map(userDTO.fromJson);
    } catch (error) {
      console.error("Error al obtener el menú:", error);
      return [];
    }
  };

  export const getUsuarioById = async (id) => {
    if (MODO_PRUEBA) {
      console.log("⚠️ Usando datos MOCK para las pedidos");
      const usuario = mockUsuarios.find((u) => u.id === id);
      return new Promise((resolve) => setTimeout(() => resolve(usuario), 500)); // Simula un delay de 500ms
    }

    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      return null;
    }
  };
  

  export const addEmpleado = async (empleado) => {
    if (MODO_PRUEBA) {
      console.log("⚠️ Usando datos MOCK para las pedidos");
      mockUsuarios.push(empleado);
      return new Promise((resolve) => setTimeout(() => resolve(empleado), 500)); // Simula un delay de 500ms
    }

    try {
      console.log(empleado) //!sacar
      const response = await api.post(API_URL, empleado);
      return response;
    } catch (error) {
      console.error("Error al agregar el empleado:", error);
      return null;
    }
  };

  export const modificarEmpleado = async (id, usuario) => {
    if (MODO_PRUEBA) {
      console.log("⚠️ Usando datos MOCK para las pedidos");
      const index = mockUsuarios.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockUsuarios[index] = { ...mockUsuarios[index], ...usuario };
        return new Promise((resolve) => setTimeout(() => resolve(mockUsuarios[index]), 500)); // Simula un delay de 500ms
      }
      return new Promise((resolve) => setTimeout(() => resolve(null), 500)); // Simula un delay de 500ms
    }

    try {
      const response = await api.patch(`${API_URL}/${id}`, usuario);
      return response;
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      return null;
    }
  };

  export const deleteUsuario = async (id) => {
    if (MODO_PRUEBA) {
      console.log("⚠️ Usando datos MOCK para las pedidos");
      const index = mockUsuarios.findIndex((u) => u.id === id);
      if (index !== -1) {
        const deletedUsuario = mockUsuarios.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve(deletedUsuario[0]), 500)); // Simula un delay de 500ms
      }
      return new Promise((resolve) => setTimeout(() => resolve(null), 500)); // Simula un delay de 500ms
    }

    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      return null;
    }
  };