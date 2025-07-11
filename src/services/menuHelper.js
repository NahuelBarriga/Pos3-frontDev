import api from './api';
import ItemResDTO from '../models/itemResDTO';
import ItemFormDTO from '../models/itemFormDTO';

const API_URL = `/items`;
const API_CONFIG = `/config`;


export const getMenu = async () => {

  try {
    const response = await api.get(`${API_URL}/menu`);
    console.log("Menu fetched successfully:", response.data);
    if (response) {
      console.log(response.data.map(ItemResDTO.fromJson));
      return response.data.map(ItemResDTO.fromJson);
    }
  } catch (error) {
    console.error("Error al obtener el menú:", error);
    return [];
  }
};

export const getItemById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data.map(ItemDTO.fromJson);
  } catch (error) {
    console.error("Error al obtener el menú:", error);
    return [];
  }
}

export const postItem = async (itemNuevo) => {
  try {

    const item = new ItemFormDTO(itemNuevo);
    const response = await api.post(`${API_URL}`, item);
    itemNuevo.id = response.data.id;
    const responseImg = await updateItem(itemNuevo); //las imagenes se guardar con un patch
    if (responseImg.status === 200) {
      return response;
    } else {
      //await deleteItem(response.data.id); //todo: ver si no agregar
      return;
    }
  } catch (error) {
    console.error('Error en la solicitud: ', error);
  }
}


export const updateItem = async (itemUpdate) => {
  try {
    // const imagenesArchivos = itemUpdate.imagenes.filter(img => img instanceof File);
    // const imagenesURLs = itemUpdate.imagenes.filter(img => typeof img === 'string');

    const item = new ItemFormDTO(itemUpdate);

    const formData = new FormData();
    if (item) {
      Object.keys(item).forEach(key => {
        if (key !== 'imagenes' && key !== 'tag') {
          formData.append(key, item[key]);
        }
      });
    }
    // // Agregar cada imagen como un archivo  
    if (item.tag && item.tag.length > 0) {
      item.tag.forEach((tag) => {
        formData.append('tag[]', tag)
      })

    }
    if (item.imagenes && item.imagenes.length > 0) {
      item.imagenes.forEach((img, index) => {
        formData.append('imagenes', img);
      });
    }

    // To check FormData contents:                                //!sacar
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]); // This will show the actual FormData contents
    }

    const response = await api.patch(`${API_URL}/${itemUpdate.id}`, formData);
    console.log(response.status, response.data); //!sacar
    return response;

  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return null;
  }
};

export const updateItemDisp = async (id, estado) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/stock`, { stock: estado });
    return response;
  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return null;
  }
}

export const deleteItem = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    console.log(response.status, response.data);
    return response;
  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return null;
  }
};

export const postCat = async (category) => {
  try {
    const response = await api.post('/categories', JSON.stringify(category));
    console.log(response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return null;
  }
};

export const deleteCat = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    console.log(response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return null;
  }
};

export const getAllCat = async () => {

  try {
    const response = await api.get('/items/categorias'); //todo: acomodar --------------------------------------------------------------------------
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud: ', error);
    return [];
  }

};








