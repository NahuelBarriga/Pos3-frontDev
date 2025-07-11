class ItemResDTO {
    constructor({id, nombre, descripcion, precio, categoriaId, tag, disp, ingredientes, imagenes, SKU}) {
        this.id = id; 
        this.nombre = nombre;
        this.descripcion = descripcion ? String(descripcion) : null;
        this.precio = parseFloat(precio);
        this.categoriaId = categoriaId;
        this.disp = disp;
        this.tag = tag != '' ? tag.split(',').map(t => t.trim()) : []; //array de tags
        //this.ingredientes = Array.isArray(ingredientes) ? ingredientes.map(String) : []; 
        this.imagenes = Array.isArray(imagenes)? imagenes : [];
        //array de url de imagenes
        this.SKU = SKU; 
    }

    static fromJson(data) { 
        return new ItemResDTO(data); 
    }
}

export default ItemResDTO;