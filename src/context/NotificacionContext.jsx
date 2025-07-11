import { createContext, useState, useEffect } from "react";
import socket from "../config/socket";

const NotificacionContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notPedidos, setNotPedidos] = useState(false);
    const [notReservas, setNotReservas] = useState(false);
    const [notLayout, setNotLayout] = useState(false);
    const [notComanda, setNotComanda] = useState(false);
    const [notCaja, setNotCaja] = useState(false);


    useEffect(() => {
        socket.on("pedido:nuevo", (pedido) => {
            if (pedido.estado === "pendiente") {
                setNotPedidos(true);
            }
            setNotPedidos(true);
        });
        socket.on("reserva:nueva", (reserva) => {
            if (reserva.estado === "pendiente") {
                setNotReservas(true);
            }
            setNotReservas(true);
        });
        socket.on("caja:nuevo", (mov) => {
            setNotLayout(true);
        });

        return () => {
            socket.off("pedido:nuevo");
            socket.off("reserva:nueva");
            socket.off("caja:nuevo");
        }
    });



  return (
    <NotificacionContext.Provider 
    value ={{
        notPedidos,
        notReservas,
        notLayout,
        notComanda,
        notCaja,
    }}
    >{children}</NotificacionContext.Provider>
  );
};

// Hook personalizado para consumir pedidos
export const useNotification = () => {
  return useContext(NotificacionContext);
};
