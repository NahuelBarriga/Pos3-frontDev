import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./authContext";
import { toast } from "react-toastify";
import socket from "../config/socket";
import { getPedidosNoFinalizados } from "../services/carritoHelper";

const PedidosContext = createContext(null);

export const PedidosProvider = ({ children }) => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPedidos();
    }
  }, [user]);

  useEffect(() => {
    //!debug
    console.log("Pedidos actualizados:", pedidos);
  }, [pedidos]);

  useEffect(() => {
    if (!socket) return;

    const handlePedidoActualizado = (pedido) => {
      actualizarPedido(pedido);
    };
    const handlePedidoEliminado = (pedidoId) => {
      eliminarPedido(pedidoId);
    };
    const handlePedidoEstadoActualizado = (pedido) => {
      actualizarEstadoPedido(pedido);
    };

    socket.on("pedido:actualizado", handlePedidoActualizado);
    socket.on("pedido:eliminado", handlePedidoEliminado);
    socket.on("pedido:estadoActualizado", handlePedidoEstadoActualizado);

    return () => {
      //socket.off("pedido:nuevo", handlePedidoCreado);
      socket.off("pedido:actualizado", handlePedidoActualizado);
      socket.off("pedido:eliminado", handlePedidoEliminado);
      socket.off("pedido:estadoActualizado", handlePedidoEstadoActualizado);
    };
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const pedidosData = await getPedidosNoFinalizados(user.id);
      setPedidos(pedidosData);
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const crearPedido = (pedido) => {
    setPedidos((prevPedidos) => [...prevPedidos, pedido]);
    console.log("Pedido creado:", pedido); //! Debugging line
    toast.success("Pedido enviado, esperando confirmacion");
  };

  const actualizarPedido = (pedidoActualizado) => {
    console.log(pedidoActualizado);
    if (pedidos.some((p) => p.id === pedidoActualizado.id)) {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoActualizado.id ? pedidoActualizado : pedido
        )
      );
      toast.info("Pedido actualizado");
    }
  };
  const actualizarEstadoPedido = (pedidoId, estado) => {
    console.log(pedidoId);
    if (pedidos.some((p) => p.id === pedidoId)) {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado } : pedido
        )
      );
      toast.info("Pedido actualizado");
    }
  };

  const eliminarPedido = (pedidoId) => {
    if (pedidos.some((p) => p.id === pedidoId)) {
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido.id !== pedidoId)
      );
      toast.info("Pedido eliminado");
    }
  };

  return (
    <PedidosContext.Provider
      value={{ pedidos, crearPedido, actualizarPedido, eliminarPedido }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

// Hook personalizado para consumir pedidos
export const usePedidos = () => {
  return useContext(PedidosContext);
};
