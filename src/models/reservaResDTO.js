import { format } from "date-fns-tz";
import { zona } from "../config/configuracion.js";
class reservaResDTO {
    constructor({id, fecha, mesa, clienteId, clienteTelefono, clienteNombre, estado, comentario, cantPersonas}) {
        this.id = Number(id);
        // Parse as UTC and convert to Argentina time
        const fechaReserva = format(fecha, "dd-MM-yyyy HH:mm", { timeZone: zona });
        this.fecha = fechaReserva.split(" ")[0];
        this.dia = fechaReserva.split(" ")[0];
        this.hora = fechaReserva.split(" ")[1].slice(0, 5);
        this.estado = String(estado); 
        this.mesa = mesa ? { 
            id: mesa.id,
            numero: mesa.numero, 
        } : null;
        this.comentario = comentario ? String(comentario) : null; //opcional
        this.clienteId = clienteId; 
        this.clienteNombre = clienteNombre;
        this.clienteTelefono = clienteTelefono; 
        this.cantPersonas = Number(cantPersonas); 
    }
    static fromJson(data) { 
        return new reservaResDTO(data); 
    }
}

export default reservaResDTO;