class ItemFormDTO {
    constructor({ nombre, descripcion, precio, categoriaId, tag, disp, ingredientes, imagenes, SKU }) {
        this.nombre = String(nombre);
        this.descripcion = descripcion ? String(descripcion) : null; //opcional 
        this.precio = Number(precio);
        this.categoriaId = String(categoriaId);
        this.disp = disp ? disp : true; //por default disponible
        if (Array.isArray(tag)) {
            this.tag = tag.slice().sort((a, b) => String(a).localeCompare(String(b)));
        } else if (tag) {
            this.tag = [tag];
        } else {
            this.tag = [];
        }
        //this.ingredientes = Array.isArray(ingredientes) ? ingredientes.map(String) : []; 
        this.imagenes = [];
        if (imagenes) {
            if (Array.isArray(imagenes)) {
                this.imagenes.push(...imagenes);
            } else if (typeof imagenes === 'string') {
                this.imagenes.push(imagenes);
            }
        }
        this.SKU = Number(SKU);
    }
}

export default ItemFormDTO;