import { format } from "date-fns-tz";
import { zona } from "../config/configuracion.js";
class movResDTO { 
    constructor({id, fecha, monto, tag, descripcion, medioPago, empleado, baja}) {
        this.id = Number(id); 
        this.monto = Number(monto);
        // Parse as UTC and convert to Argentina time
        const fechaMov = format(fecha, "dd-MM-yyyy HH:mm", { timeZone: zona });
        this.fecha = fechaMov.split(" ")[0];
        this.hora = fechaMov.split(" ")[1].slice(0, 5);
        this.tag = tag ? String(tag) : 'B';
        this.medioPago = medioPago,
        this.empleado = empleado;
        this.descripcion = descripcion ? String(descripcion) : null; //opcional 
        this.baja = baja;
    }
    static fromJson(data) { 
        return new movResDTO(data); 
    }
}
export default movResDTO;


