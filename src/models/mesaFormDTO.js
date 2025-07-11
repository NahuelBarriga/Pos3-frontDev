class mesaFormDTO {
    constructor({size, pisoId, tipo, estado, locacion, numero, descripcion}) { 
        this.tipo = tipo ? String(tipo) : null; //opcional
        this.numero = Number(numero); //numero de mesa
        this.estado = String(estado);  //por default disponible
        this.locacion = locacion; // X e Y de locacion en el layout;
        this.size = size; // {width, height} de la mesa
        this.descripcion = descripcion ? String(descripcion) : null; //opcional 
        this.pisoId = pisoId? Number(pisoId) : 1; 
    }
}

export default mesaFormDTO;