class pedidoFormDTO {
    constructor({ items, comentario, total, cupon, mesaId, subtotal, estado, baja, medioPago}) {
        this.items = Array.isArray(items) ? items.map(item => { 
            return {
                id: item.id,
                cantidad: item.cantidad //todo: ver
            }
        }) : []; 
        this.comentario = comentario ? String(comentario): null; // opcional
        this.total = parseFloat(total); //se calcula automaticamente en funcion de los items
        this.subtotal = parseFloat(subtotal);
        this.cupon = cupon ? String(cupon): null; //opcional
        this.mesaId = mesaId; 
        this.estado = estado? estado : null;
        this.baja = baja;
        this.medioPago = medioPago ? Number(medioPago): null; //opcional
    }
    static fromJson(data) { 
        return new pedidoFormDTO(data); 
    }
}

export default pedidoFormDTO;