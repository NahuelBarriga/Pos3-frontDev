import { format } from "date-fns-tz";
import { zona } from "../config/configuracion.js";
class mesaLayoutDTO {
    constructor({id, tipo, estado, locacion, size, numero, pisoId, descripcion, pedido, reserva}) { 
        this.id = Number(id); //se agrega automaticamente en la db 
        this.tipo = String(tipo); //opcional
        this.estado = String(estado); 
        this.numero = Number(numero);
        this.locacion = {x: Number(locacion[0]), y : Number(locacion[1]) }; // X e Y de locacion en el layout;
        this.size = { width: Number(size[0]), height: Number(size[1]) }; // {width, height} de la mesa
        this.descripcion = descripcion; //opcional 
        this.pisoId = Number(pisoId);
        this.pedido = Array.isArray(pedido) ? pedido.map(pedido => ({ 
            id: pedido.id,
            estado: pedido.estado,
            cliente: {
                nombre: pedido.userName,
            },
            fecha: format(pedido.timestamp, "dd-MM-yyyy HH:mm", { timeZone: zona }).split(" ")[0],
            hora: format(pedido.timestamp, "dd-MM-yyyy HH:mm", { timeZone: zona }).split(" ")[1].slice(0, 5),
            items: pedido.items,
            total: pedido.total,
            comentario: pedido.comentario,
        })) : [];
        this.reserva = Array.isArray(reserva) ? reserva.map(reserva => ({  //para tener todas las reservas del dia 
            id: reserva.id,
            estado: reserva.estado,
            fecha: format(reserva.fecha, "dd-MM-yyyy HH:mm", { timeZone: zona }).split(" ")[0],
            hora: format(reserva.fecha, "dd-MM-yyyy HH:mm", { timeZone: zona }).split(" ")[1].slice(0, 5),
            clienteNombre: reserva.clienteNombre,
            clienteId: reserva.clienteId,
            clienteTelefono: reserva.clienteTelefono,
            cantPersonas: reserva.cantPersonas
        })): [];
    }
    static fromJson(data) { 
        return new mesaLayoutDTO(data); 
    }
}

export default mesaLayoutDTO;