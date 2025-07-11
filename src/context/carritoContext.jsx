// context/carrito.js
import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../config/socket';
import { toast } from 'react-toastify';

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [comentario, setComentario] = useState('');
  const [cupon, setCupon] = useState('');
  const mesaInfoGuardada = JSON.parse(sessionStorage.getItem('mesaInfo')) || { tipo: "mesa", id: "" };
  const [mesaInfo, setMesaInfo] = useState(mesaInfoGuardada);

  useEffect(() => { 
    socket.on("itemActualizado", ({itemId}) => { 
      console.log("Item actualizado en el carrito:", itemId);
      if (carrito.some((item) => item.id === itemId)) {
        console.log("Item actualizado en el carrito:", itemId);
        toast.warning("Un item de tu carrito ha sido actualizado. Por favor revisa el carrito.");
        //if (item.stock === true) { //!reemplazar con logica de stock en el futuro
          // Si el item se quedó sin stock, eliminarlo del carrito
          setCarrito(carrito.filter(item => item.id !== itemId));
        //}
      }
    })



    return () => { 
      socket.off("itemActualizado"); // Limpiar el listener al desmontar
    }
  },[]); 



  // Agregar item al carrito
  const agregarAlCarrito = (item, cantidad ) => {
    // Verificar si el item ya existe en el carrito
    const itemEnCarrito = carrito.find(i => i.id === item.id);
    
    if (itemEnCarrito) {
      // Si existe, actualizar la cantidad
      setCarrito(carrito.map(i => 
        i.id === item.id 
          ? { ...i, cantidad: cantidad } 
          : i
      ));
    } else {
      // Si no existe, agregarlo con cantidad 1
      setCarrito([...carrito, { ...item, cantidad }]);
    }
  };

  // Eliminar item del carrito
  const eliminarDelCarrito = (itemId) => {
    setCarrito(carrito.filter(item => item.id !== itemId));
  };

  // Actualizar cantidad de un item
  const actualizarCantidad = (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(itemId);
      return;
    }
    
    setCarrito(carrito.map(item => 
      item.id === itemId 
        ? { ...item, cantidad: nuevaCantidad } 
        : item
    ));
  };

  // Calcular el total del carrito
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Limpiar el carrito
  const limpiarCarrito = () => {
    setCarrito([]);
    setComentario('');
    setCupon('');
  };

  // Preparar el DTO para realizar el pedido
  const prepararDTO = (usuario, mesa) => {
    return {
      items: carrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
        nombre: item.nombre
      })),
      comentario,
      total: calcularTotal(),
      cupon,
      cliente: usuario?.tipo === 'cliente' ? usuario.id : null,
      empleado: usuario?.tipo !== 'cliente' ? usuario.id : null,
      fecha: new Date().toISOString(),
      mesa,
      estado: 'pendiente'
    };
  };

  return (
    <CarritoContext.Provider value={{ 
      carrito, 
      agregarAlCarrito, 
      eliminarDelCarrito,
      actualizarCantidad,
      calcularTotal,
      limpiarCarrito,
      mesaInfoGuardada,
      mesaInfo,
      setMesaInfo,
      comentario,
      setComentario,
      cupon,
      setCupon,
      prepararDTO
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}