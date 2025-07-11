import api from "./api";
import CuponDTO from "../models/cuponDTO";

const cupon_URL = '/cupon'; // Adjust this if your API base URL is different



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

export const sendCuponEmail = async (email, codigo) => {
  try {
    
    const response = await api.post(`${cupon_URL}/email`, { email, codigo });
    return response;
  } catch (error) {
    console.error('Error al enviar el cupón por email:', error);
    throw error;
  }
};

