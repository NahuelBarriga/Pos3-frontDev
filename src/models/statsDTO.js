class statsDTO {
    constructor({cantPedidos, cantPedidosAyer, cantMesas, mesasOcupadas, itemMasPedido, cantReservas}) {
        this.totalOrdersToday = cantPedidos || 0; 
        this.totalOrdersYesterday = cantPedidosAyer || 0; 
        this.totalTablesOccupied = mesasOcupadas || 0;
        this.totalTables = cantMesas || 0; 
        this.mostPopularItem = { 
            name: itemMasPedido?.nombre || 'no disponible', 
            SKU: itemMasPedido?.SKU || '', 
            count: itemMasPedido?.cantidad || 0,
        }; 
        this.reservationsToday = cantReservas || 0;
    }
}

export default statsDTO;

//  totalOrdersToday: 0,
//       totalOrdersYesterday: 0,
//       totalTablesOccupied: 0,
//       totalTables: 0,
//       mostPopularItem: { name: 'No disponible', count: 0 },
//       reservationsToday: 0
//     };

// const respuesta = {
         //1. cantidad de pedidos hoy
//         cantPedidos: pedidosHoy.length,
         //2. cantidad de mesas
//         cantMesas: cantMesas.length,
         //2.1 cantidad de mesas ocupadas
//         mesasOcupadas: mesasOcupadas,
         //3. Item mas pedido del dia.
//         itemMasPedido: maxObjeto,
         //4. cantidad de reservas desde YA hasta el final del dia.
//         cantReservas: (await reservaService.getAllReservas({fechaInicio:todayStart,fechaInicio:todayEnd})).length
//     }