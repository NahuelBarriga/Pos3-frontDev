
class reservaFormDTO {
    constructor({fecha, hora, mesa, clienteNombre, clienteTelefono, clienteId, estado, comentario, cantPersonas}) {
        // Always send as UTC ISO string
        console.log('Creating reservaFormDTO with:', {fecha, hora});
        this.fecha = new Date(`${fecha}T${hora}:00`);
        console.log('Parsed fecha:', this.fecha);
        this.estado = (estado || 'pendiente'); //por default pendiente
        this.mesaId = mesa? mesa.id  : -1, //por ahora se asigna automaticamente (si la hace el cliente), va null por aca
        this.comentario = comentario ? String(comentario) : null; //opcional
        this.clienteId = clienteId ? clienteId : -1; //se asigna por el req, va a estar siempre -1 , en el back se acomoda todo
        this.clienteNombre = clienteNombre ? clienteNombre : null;
        this.clienteTelefono = clienteTelefono ? String(clienteTelefono) : null;
        this.cantPersonas = Number(cantPersonas); 
    }
    static fromJson(data) { 
        return new reservaFormDTO(data); 
    }
}

export default reservaFormDTO;