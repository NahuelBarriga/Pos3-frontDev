import api from './api';
import movResDTO from '../models/movResDTO.js';
import movFormDTO from '../models/movFormDTO.js';
import { MODO_PRUEBA } from '../config.js';

const USE_MOCK = MODO_PRUEBA; // Cambia a false cuando conectes la API real
const API_URL = `/caja`;

const mockMovimientos = [
  { fecha: "2025-03-22", descripcion: "Venta de café", monto: 1500.00, tag: 'B' },
  { fecha: "2025-03-22", descripcion: "Compra de insumos", monto: -5000.00, tag: 'N' },
  { fecha: "2025-02-07", descripcion: "Venta de medialunas", monto: 4800.00, tag: 'N' },
  { fecha: "2025-02-07", descripcion: "Pago de servicios", monto: -800.00, tag: 'N' }
];

export const getMovimientos = async () => {
  if (USE_MOCK) {
    console.log("⚠️ Usando datos MOCK para la caja");
    return new Promise((resolve) => setTimeout(() => resolve(mockMovimientos), 500));
  }
  try {
    const response = await api.get(API_URL);
    console.log(response.data); //!sacar
    return response.data.map(movResDTO.fromJson);
  } catch (error) {
    console.error("Error al obtener movimientos de caja:", error);
    return [];
  }
};

export const addMovimiento = async(mov) => { 
  console.log(mov);
  try {
    // Asegurarse de que la fecha esté formateada correctamente como cadena ISO con hora
    if (mov.fecha && !mov.fecha.includes('T')) {
      // Si la fecha no incluye ya la hora, agregar una hora por defecto
      mov.fecha = `${mov.fecha}T00:00:00.000Z`;
    }
    const response = await api.post(API_URL, new movFormDTO(mov));
    
    return response;
  } catch (error) {
    console.error('Error al agregar movimiento:', error);
    throw error;
  }
}
export const editMovimiento = async(movId, mov) => { 
  console.log(new movFormDTO(mov));
  const response = await api.patch(`${API_URL}/${movId}`, new movFormDTO(mov));
  return response;
}
export const deleteMovimiento = async(movId) => { 
  const response = await api.delete(`${API_URL}/${movId}`);
  return response;
}

export const getMediosPago = async () => {
  try {
    // Make sure we're getting the actual API response object
    const response = await api.get(`${API_URL}/mediosPago`, { params: { activo: true} });
    return response;
  } catch (error) {
    console.error("Error al obtener medios de pago:", error);
    // Optionally, return an empty array or throw for better error handling
    return [];
  }
};

export default { 
  getMovimientos, 
  addMovimiento, 
  editMovimiento, 
  deleteMovimiento, 
  getMediosPago,
}