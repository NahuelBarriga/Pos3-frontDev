import formaDTO from "../models/formaDTO";
import mesaResDTO from "../models/mesaResDTO";
import mesaLayoutDTO from "../models/mesaLayoutDTO";
import mesaFormDTO from "../models/mesaFormDTO";
import api from "./api";
import socket from "../config/socket";
import ItemResDTO from "../models/itemResDTO";
import pedidoFormDTO from "../models/pedidoFormDTO";
import reservaFormDTO from "../models/reservaFormDTO";
import movFormDTO from "../models/movFormDTO";
import reservaResDTO from "../models/reservaResDTO";
const Layout_URL = `/layout`;
const Mesas_URL = `/mesas`;
const reservas_URL = `/reservas`;

// export const saveLayout = async (layoutData) => {
//     // Save the layout settings to the API
//     try {
//         const response = await api.post(API_URL, (layoutData.map(forma => new formaDTO(forma)))); //ver si no es un solo objeto (o si se puede hacer de a 1)
//         if (response.status == 201) {
//             console.log("Layout saved:", result);
//         }
//     } catch (error) {
//         console.error("Error saving layout:", error);
//         return null;
//     }
// }

export const saveMesa = async (mesaData) => {
  try {
    // Normalize mesa data to ensure locacion and size are in the expected format
    const normalizedData = {
      ...mesaData,
      // Ensure locacion is an array [x, y]
      locacion: Array.isArray(mesaData.locacion)
        ? mesaData.locacion
        : [mesaData.locacion.x, mesaData.locacion.y],
      // Ensure size is an array [width, height]
      size: Array.isArray(mesaData.size)
        ? mesaData.size
        : [
            parseInt(
              mesaData.size?.width || mesaData.width?.replace("px", "") || 80
            ),
            parseInt(
              mesaData.size?.height || mesaData.height?.replace("px", "") || 80
            ),
          ],
    };

    console.log("Sending mesa data:", normalizedData);
    const response = await api.post(Mesas_URL, new mesaFormDTO(normalizedData));
    console.log(response); 
    return response; 

  } catch (error) {
    console.error("Error saving mesa:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return null;
  }
};

export const deleteSelectedMesa = async (mesaId) => {
  try {
    const response = await api.delete(`${Mesas_URL}/${mesaId}`);
    return response;
  } catch (error) {
    console.error("Error deleting mesa:", error);
    return null;
  }
};

export const getMesasLayout = async () => {
  try {
    const response = await api.get(`${Mesas_URL}/layout`);
    return response.data.map(mesaLayoutDTO.fromJson);
  } catch (error) {
    console.error("Error retrieving layout:", error);
    return null;
  }
};

export const getMenu = async () => {
  try {
    const response = await api.get(`${Mesas_URL}/menu`);
    return response.data.map(ItemResDTO.fromJson);
  } catch (error) {
    console.error("Error retrieving menu:", error);
    return null;
  }
};

export const updateMesaPosition = async (id, loc) => {
  try {
    const response = await api.patch(`${Mesas_URL}/${id}/pos`, loc);
    return response;
  } catch (error) {
    console.error("Error updating mesa:", error);
    return null;
  }
};

export const updateMesaState = async (mesaId, estado) => {
  //!ver si no esta al pedo (por el socket)
  try {
    socket.emit("mesa:cambiarEstado", { mesaId, estado });
  } catch (error) {
    console.error("Error updating mesa:", error);
    return null;
  }
};

export const updateMesa = async (id, data) => {
  try {
    // Normalize mesa data to ensure locacion and size are in the expected format
    const normalizedData = {
      ...data,
      // Ensure locacion is an array [x, y]
      locacion: Array.isArray(data.locacion)
        ? data.locacion
        : [data.locacion.x, data.locacion.y],
      // Ensure size is an array [width, height]
      size: Array.isArray(data.size)
        ? data.size
        : [
            parseInt(data.size?.width || data.width?.replace("px", "") || 80),
            parseInt(data.size?.height || data.height?.replace("px", "") || 80),
          ],
    };

    console.log("Updating mesa data:", normalizedData);
    const response = await api.patch(
      `${Mesas_URL}/${id}`,
      new mesaFormDTO(normalizedData)
    );
    return response;
  } catch (error) {
    console.error("Error updating mesa:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return null;
  }
};

export const updatePedido = async (data) => {
  try {
    console.log('pedido:',data)
    const response = await api.patch(
      `${Mesas_URL}/pedidos/${data.id}`,
      new pedidoFormDTO(data)
    );
    return response;
  } catch (error) {
    console.error("Error updating pedido:", error);
    return null;
  }
};

export const submitPedido = async (data) => {
  try {
    const response = await api.post(
      `${Mesas_URL}/pedidos`,
      new pedidoFormDTO(data)
    );
    return response;
  } catch (error) {
    console.error("Error updating pedido:", error);
    return null;
  }
};

export const submitReserva = async (reservaData) => {
  try {
    console.log("Submitting reserva data:", reservaData);
    const response = await api.post(
      `${Mesas_URL}/reservas`,
      new reservaFormDTO(reservaData)
    );
    return response;
  } catch (error) {
    console.error("Error submitting reserva:", error);
    return null;
  }
};

export const updatePedidoEstado = async (pedidoId, estado) => {
  try {
    socket.emit("pedido:cambiarEstado", { pedidoId, estado });
  } catch (error) {
    console.error("Error updating pedido:", error);
    return null;
  }
};

export const migrarMesa = async (idOriginal, idPosterior) => {
  try {
    const response = await api.patch(`${Mesas_URL}/${idOriginal}/migrar`, {
      idPost: idPosterior,
    });
    return response;
  } catch (error) {
    console.error("Error migrando mesa", error);
    return null;
  }
};

// Function to parse SVG string and extract line elements
function parseSVGToLines(svgString) {
  if (!svgString) return [];
  
  try {
    // Create a DOMParser to parse the SVG string
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    if (doc.querySelector('parsererror')) {
      console.error('Error parsing SVG:', svgString);
      return [];
    }
    
    // Get all line elements
    const lineElements = doc.querySelectorAll('line');
    
    // Convert line elements to the expected format
    const lines = Array.from(lineElements).map(line => ({
      x1: parseFloat(line.getAttribute('x1')) || 0,
      y1: parseFloat(line.getAttribute('y1')) || 0,
      x2: parseFloat(line.getAttribute('x2')) || 0,
      y2: parseFloat(line.getAttribute('y2')) || 0,
      strokeWidth: parseFloat(line.getAttribute('stroke-width')) || 1
    }));
    
    console.log('Parsed lines from SVG:', lines);
    return lines;
  } catch (error) {
    console.error('Error parsing SVG string:', error);
    return [];
  }
}

export const getFloorLayout = async () => { 
  // Get the layout settings from the API
  try {
    const response = await api.get(`${Layout_URL}`);
    console.log("Layout response:", response);
    if (response && response.data) {
      return {
        status: response.status,
        floorPlan: response.data.map((piso) => { 
          return {
            pisoId: piso.id,
            descripcion: piso.descripcion || "seccion",
            lines: piso.layout != 'null' ? parseSVGToLines(piso.layout) : []
          };
        })
      };
    } else {
      console.log("No floor plan data found in response");
      return {
        status: 500,
        floorPlan: { lines: [] },
      };
    }
  } catch (error) {
    console.error("Error retrieving layout:", error);
    return {
      status: 500,
      floorPlan: { lines: [] },
    };
  }
};

function convertirLineasASVG(lineas, width = 800, height = 600) { //todo: confirmar el width y el heigth
  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  const footer = `</svg>`;

  const lineasSVG = lineas
    .map((linea) => {
      const { x1, y1, x2, y2, strokeWidth } = linea;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="${strokeWidth}" />`;
    })
    .join("\n");

  return `${header}\n${lineasSVG}\n${footer}`;
}

export const saveFloorPlan = async (svgLines, pisoId) => {
  try {
    const svgContent = convertirLineasASVG(svgLines); //todo: ver si no agregarle id a las lineas para borrarlas despues
    const response = await api.patch(`${Layout_URL}/${pisoId}`, {
      layout: svgContent,
    });

    return response;
  } catch (error) {
    console.error("Error saving floor plan:", error);
    return null;
  }
};

export const saveNewFloor = async(descripcion) => { 
  try { 
    const response = await api.post(`${Layout_URL}/piso`, { descripcion }); 
    return response; // Assuming the response contains the new floor data
  } catch (error) { 
    console.error("Error saving new floor:", error);
    return null;
  }

}

export const deleteFloor = async (pisoId) => {
  try {
    const response = await api.delete(`${Layout_URL}/piso/${pisoId}`);
    return response;
  } catch (error) { 
    console.error("Error deleting floor:", error);
    return null;
  }
};

export const submitMov = async (mov) => {
  try {
    if (mov.pedidos && mov.pedidos.length > 0) {
      const movimiento = new movFormDTO({
        monto: mov.total,
        medioPagoId: mov.medio,
        tag: "B",
        descripcion: `Venta - Pedidos: #${mov.pedidos.join(", #")}`,
      });
      const response = await api.post(`${Mesas_URL}/movimiento`, movimiento);

      if (response.status === 201) {
        mov.pedidos.forEach(async (pedido) => {
         
          socket.emit("pedido:cambiarEstado", {
            pedidoId: pedido,
            estado: "finalizado",
          });
          socket.emit("pedido:pagar", {
            pedidoId: pedido,
            medioPago: mov.medio,
          });
        });
      }
      return response;
    } else {
      console.error("No orders specified for payment");
      return null;
    }
  } catch (error) {
    console.error("Error submitting movimiento:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return null;
  }
};

export const pagarPedido = async (pedidoId, medioPago) => {
  try {
    const response = await api.patch(`${Mesas_URL}/pedidos/${pedidoId}`, {
      medioPago,
    });
    return response;
  } catch (error) {
    console.error("Error updating pedido:", error);
    return null;
  }
};

export const getMedioPago = async () => {
  try {
    const response = await api.get("/mesas/mediosPago", {
      params: { activo: true },
    });
    return response;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return { data: [] };
  }
};

export const getNewMesaReserva = async (reservaId) => {
  try {
    const response = await api.get(`${reservas_URL}/updateTable/${reservaId}`);
    return response.data ? reservaResDTO.fromJson(response.data) : null;
  } catch (error) {
    console.error("Error fetching new mesa for reserva:", error);
    return null;
  }
}
