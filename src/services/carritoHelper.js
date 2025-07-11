// services/pedidosService.js
import api from "./api.js";
import pedidoFormDTO from "../models/pedidoFormDTO.js"
import PedidoResDTO from "../models/pedidoResDTO.js";

// Asume que tienes una URL base definida en un archivo de configuración
const API_URL = `/carrito`;
const cuponsUrl = '/cupon'; 

// Enviar un nuevo pedido
export const postPedido = async (pedido) => {
    try {
        const pedidoNuevo = new pedidoFormDTO(pedido);
        console.log("pedido a enviar: ",pedidoNuevo); //!sacar
        const response = await api.post(API_URL, pedidoNuevo);  
        return response; 
    } catch (error) {  
        if (error.status == 403) { //token expirado
            refresh(); 
        } else { 
            console.error('Error en la solicitud: ', error); 
        }
    }
};

export const verificarMesaDisponible = async(mesaNumero) => { 
    try {
        const response = await api.get(`${API_URL}/mesa/${mesaNumero}`);
        return response;
    } catch (error) {
      if (error.status === 403) { // token expired
        refresh();
      } else {
        console.error('Error en la solicitud: ', error);
      }
      return false;
      
    }  
  }

// Obtener pedidos del cliente actual
export const getPedidosNoFinalizados = async (clienteId) => {
  try { //todo: armar
    const response = await api.get(`${API_URL}/pedidos/cliente/${clienteId}`);
    return response.data.map(PedidoResDTO.fromJson);
  } catch (error) {
    console.error('Error al obtener los pedidos del cliente:', error);
    throw error;
  }
};

export const cancelarPedidoPendiente = async(pedidoId) => { 
  try {
    const response = await api.delete(`${API_URL}/pedidos/${pedidoId}`);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error cancelando pedido:', error);
    throw error;
  }
}

export const validarCupon = async (cupon) => {
  try {
    const response = await api.get(`${cuponsUrl}/validate/${cupon}`);
    return response; // Asumiendo que la respuesta contiene el descuento
  } catch (error) {
    console.error('Error al verificar el cupón:', error.status, error.message);
    if (error.response && error.response.status === 404) {
      return error.response; 
    } else {
      console.error('Error al verificar el cupón:', error);
    }
    
  }
};

// // Actualizar estado de un pedido (para empleados)
// export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
//   try {
//     const response = await axios.patch(`${API_URL}/pedidos/${pedidoId}`, { estado: nuevoEstado });
//     return response;
//   } catch (error) {
//     console.error('Error al actualizar el estado del pedido:', error);
//     throw error;
//   }
// };

// // Obtener detalles de un pedido específico
// export const getPedidoDetalle = async (pedidoId) => {
//   try {
//     const response = await axios.get(`${API_URL}/pedidos/${pedidoId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error al obtener los detalles del pedido:', error);
//     throw error;
//   }
// };