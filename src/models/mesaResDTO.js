class mesaResDTO {
    constructor({id, tipo, estado, locacion, descripcion}) { 
        this.id = Number(id); //se agrega automaticamente en la db 
        this.tipo = String(tipo); //opcional
        this.estado = String(estado); 
        this.locacion = Array.isArray(locacion) ? locacion.map(Number) : []; // X e Y de locacion en el layout;
        this.descripcion = descripcion ? String(descripcion) : null; //opcional 
    }
    static fromJson(data) { 
        return new mesaResDTO(data); 
    }
}

export default mesaResDTO;