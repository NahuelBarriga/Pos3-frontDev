class formaDTO {
    constructor({tipo, start, end, fill}) { 
        this.tipo = String(tipo); //opcional //'line', 'rect', 'circle'
        this.start = Array.isArray(start) ? start.map(Number) : []; // X e Y de locacion en el layout;
        this.end = Array.isArray(end) ? end.map(Number) : []; // X e Y de locacion en el layout;
        this.fill = Boolean(fill); //opcional
    }
    static fromJson(data) { 
        return new formaDTO(data); 
    }
}

export default formaDTO;