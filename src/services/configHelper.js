import api from './api';
import userDTO from "../models/userDTO";
import pedidoDTO from '../models/pedidoResDTO';
import reservaDTO from '../models/reservaResDTO';
import provDTO from '../models/provFormDTO';
import categoriaFormDTO from '../models/categoriaFormDTO';
import CuponDTO from '../models/cuponDTO';

const API_URL = `/config`;
const prov_URL = '/prov'; 
const medioPago_URL = '/medioPago'; 
const cupon_URL = '/cupon';
const auth_URL = '/auth';



export const getConfig = async() => { 
  try { 
    
    const response = await api.get(`${API_URL}`);
    const prov = await getProveedores();
    const medioPago = await getMediosDePago();
    const categorias = await  getCategoriasItems(); 
    const cuponesData = await getCupones();
    response.data.proveedores = prov;
    response.data.mediosDePago = medioPago;
    response.data.categorias = categorias; 
    response.data.cuponesData = cuponesData; 
    return response.data; //todo: agregar DTO
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const updateConfig = async(configData) => { 
  try { 
    const response = await api.put(`${API_URL}`, new userDTO(configData));
    return response;
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const getCategoriasItems = async () => {
  try {
    const responseCat = await api.get(`${API_URL}/categorias`);
    const responseIems = await api.get(`${API_URL}/menu`);
    
    const categorias = responseCat.data; 
    const items = responseIems.data;
    const contador = {}; 
    categorias.forEach(cat => {
      contador[cat.id] = 0; 
    });
    items.forEach(item => {
      if (contador[item.categoriaId] !== undefined) {
        contador[item.categoriaId] ++; 
      }
    });

    return categorias.map(cat=> ({ 
      id: cat.id, 
      nombre: cat.nombre,
      order: cat.order,
      cant: contador[cat.id]
    }));
    
  } catch (error) {
    console.error("Error al obtener las categorias:", error);
    return null;
  }
} 

export const postCategoria = async(cat) => { 
  try {
    const response = await api.post(`${API_URL}/categorias`, new categoriaFormDTO(cat));
    return response; 
  } catch (error) {
    console.error('Error al agregar la categoria:', error); 
    return null;
  }
}

export const deleteCategoria = async(id) => {
  try {
    const response = await api.delete(`${API_URL}/categorias/${id}`);
    return response; 
  } catch (error) {
    console.error('Error al eliminar la categoria:', error); 
    return null;
  }
}


export const updateCategoriaOrder = async (categoriaId, newOrder) => {
    try {
        const response = await api.patch(`${API_URL}/categorias/${categoriaId}`, { order: newOrder });
        return response;
    } catch (error) {
        console.error('Error updating categoria order:', error);
        throw error;
    }
};

export const getProveedores = async() => { 
  try { 
    const response = await api.get(`${prov_URL}`);
    return response.data; //todo: agregar DTO
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const postProveedores = async(provData) => { 
  try { 
    console.log(provData); ///!sacar
    const response = await api.post(`${prov_URL}`, new provDTO(provData));
    return response;
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const deleteProveedores = async(id) => { 
  try { 
    const response = await api.delete(`${prov_URL}/${id}`);
    return response;
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const toggleProveedores = async(id) => {
  try { 
    const response = await api.patch(`${prov_URL}/${id}/toggle`);
    return response;
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}


export const getMediosDePago = async() => { 
  try { 
    const response = await api.get(`${API_URL}/mediosPago`);
    return response.data; 
  } catch (error) { 
    console.error('Error al obtener los medios de pago:', error); 
    return [];
  }
}

export const postMediosDePago = async(medioPagoData) => { 
  try { 
    const response = await api.post(`${API_URL}/mediosPago`, medioPagoData);
    return response;
  } catch (error) { 
    console.error('Error al crear medio de pago:', error); 
    throw error;
  }
}

export const toggleMediosDePago = async(id) => { 
  try { 
    const response = await api.patch(`${API_URL}/mediosPago/${id}/toggle`);
    return response;
  } catch (error) { 
    console.error('Error al cambiar estado del medio de pago:', error); 
    throw error;
  }
}

export const deleteMediosDePago = async(id) => { 
  try { 
    const response = await api.delete(`${API_URL}/mediosPago/${id}`);
    return response;
  } catch (error) { 
    console.error('Error al eliminar medio de pago:', error);
    throw error; 
  }
}


export const updateUsuario = async (userId, data) => {
  try {
    // PATCH /api/config/user?id={userId}
    return await api.patch(`/config/user/${userId}`, data);
  } catch (error) {
    throw error;
  }
};

export const getPedidos = async() => {
  try { 
    const response = await api.get(`${API_URL}/pedidos`);
    return response.data.map(pedidoDTO.fromJson); 
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

export const getReservas = async() => {
  try { 
    const response = await api.get(`${API_URL}/reservas`);
    return response.data.map(reservaDTO.fromJson);
  } catch (error) { 
    console.error('Error al obtener los :', error); 
    return null;
  }
}

// Cupon methods
export const getCupones = async () => {
  try {
    const response = await api.get(`${cupon_URL}`);
    return response.data.map(CuponDTO.fromJson);
  } catch (error) {
    console.error('Error al obtener los cupones:', error);
    return [];
  }
};

export const createCupon = async (cuponData) => {
  try {
    const response = await api.post(`${cupon_URL}`, new CuponDTO(cuponData));
    return response;
  } catch (error) {
    console.error('Error al crear cupón:', error);
    throw error;
  }
};

export const deleteCupon = async (codigo) => {
  try {
    const response = await api.delete(`${cupon_URL}/${codigo}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar cupón:', error);
    throw error;
  }
};

export const updateCuponEstado = async (codigo, estado) => {
  try {
    if (estado !== 'activo' && estado !== 'inactivo') {
      throw new Error('Estado inválido. Debe ser "activo" o "inactivo".');
    }
    const response = await api.patch(`${cupon_URL}/${codigo}/${estado}`);
    return response;
  } catch (error) {
    console.error('Error al actualizar el estado del cupón:', error);
    throw error;
  }
}

export const validateCupon = async (code) => {
  try {
    const response = await api.get(`${cupon_URL}/validate?code=${code}`);
    return response.data;
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return { valid: false };
  }
};

export const updateContrasena = async (passwordForm) => {
  try{
    const response = await api.post(`${auth_URL}/reset-password`, passwordForm);
    return response;
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    throw error;
  }

};