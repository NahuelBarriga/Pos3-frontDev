class CuponDTO {
    constructor({id, codigo, descuento, tipo, fechaInicio, fechaFin, descripcion, estado}) {
        this.id = id || null; // ID del cupón, puede ser null si es nuevo
        this.codigo = codigo || null;
        this.descuento = Math.abs(descuento) || 0;
        this.tipo = tipo || 'porcentaje'; // 'porcentaje' o 'monto'
        this.estado = estado || 'activo'; // 'activo' o 'inactivo'
        this.fechaInicio = fechaInicio || new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        this.fechaFin = fechaFin || undefined; // Un año a partir de hoy
        this.descripcion = descripcion || '';
    }

    static fromJson(json) {
        return new CuponDTO(json);
    }
}

export default CuponDTO;
