export default class categoriaFormDTO {
    constructor(categoria) {
        this.nombre = categoria.nombre;
        this.order = categoria.order || 0; // Add support for order field
        // Any other existing fields
    }
}


