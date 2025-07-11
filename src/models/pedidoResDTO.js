import { format } from "date-fns-tz";
import { zona } from "../config/configuracion.js";
class PedidoResDTO {
  constructor({
    id,
    items,
    comentario,
    total,
    coupon,
    mesa,
    estado,
    cliente,
    timestamp,
    employeeId,
  }) {
    this.id = Number(id); //autoasignada
    this.items = Array.isArray(items)
      ? items.map((item) => {
          return {
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            SKU: item.SKU,
          };
        })
      : [];
    this.comentario = comentario ? String(comentario) : null; // opcional
    this.total = parseFloat(total); //se calcula automaticamente en funcion de los items
    this.coupon = String(coupon); //opcional
    this.cliente = cliente ? cliente : null; //cliente puede ser null si no se asigna
    this.medioPago = null; //por ahora no se asigna, se puede agregar mas adelante
    // Parse timestamp as UTC and convert to Argentina time
    //const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    //const argDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000 - 3 * 60 * 60 * 1000);
    const fechaPedido = format(timestamp, "dd-MM-yyyy HH:mm", {
      timeZone: zona,
    });
    this.fecha = fechaPedido.split(" ")[0];
    this.hora = fechaPedido.split(" ")[1].slice(0, 5);
    this.mesa = {
      id: mesa.id,
      numero: mesa.numero,
    };
    this.employeeId = Number(employeeId);
    this.estado = String(estado);
  }
  static fromJson(data) {
    return new PedidoResDTO(data);
  }
}

export default PedidoResDTO;
