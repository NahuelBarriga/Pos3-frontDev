import api from './api';
import ReservaResDTO from '../models/reservaResDTO';
import ReservaFormDTO from '../models/reservaFormDTO';
import socket from "../config/socket";

const API_URL = `/reservas`;


export const getReservas = async () => {
  try {
      const response = await api.get(API_URL);
      return response.data.map(ReservaResDTO.fromJson);

    } catch (error) {
      console.error("Error al obtener el menú:", error);
      return [];
    }
  };

  export const getReservaUser = async () => { 
    try {
      const response = await api.get(`config/reservas`);
      return response.data.map(ReservaResDTO.fromJson);

    } catch (error) {
      console.error("Error al obtener el menú:", error);
      return [];
    }
  }

  export const postReserva = async (reserva) => {
    try {
      const response = await api.post(API_URL, (new ReservaFormDTO(reserva)));
      return response;
    } catch (error) {
      console.error("Error al postear la reserva:", error);
      return error;
    }
  };

  export const patchReserva = async (id, reservaUpdate) => {
    try {
      const response = await api.patch(`${API_URL}/${id}`, (new ReservaFormDTO(reservaUpdate)));
      
      //console.log("Reserva:", response || "ok");
      return response;
    } catch (error) {
      console.error("Error al actualizar la reserva:", error);
      return error;
    }
  };

  export const deleteReserva = async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response;
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      return null;
    }
  };

  export const cambiarEstadoReserva = async (reservaId, estado) => {
    try {
      socket.emit("reserva:cambiarEstado", {reservaId, estado});
    } catch (error) {
      console.error("Error al confirmar o rechazar la reserva:", error);
      return null;
    }
  };