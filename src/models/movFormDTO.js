class movFormDTO { 
    constructor({fecha, monto, tag, descripcion, tipo, medioPagoId}) {
        this.monto = parseFloat(monto);
        // Always send as UTC ISO string
        this.fecha = fecha ? fecha : new Date();
        this.tag = String(tag);
        this.descripcion = descripcion ? String(descripcion) : null; //opcional 
        // Include medioPagoId if provided
        this.medioPagoId = Number(medioPagoId) || null;
    }
}
export default movFormDTO;


