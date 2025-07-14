import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["polling", "websocket"], // Primero polling y luego websocket para mayor compatibilidad
    reconnection: false,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000, // Aumentar el timeout
    autoConnect: true, // Intenta conectar automáticamente
    path: '/socket.io/' // Asegúrate que este sea el path correcto
  });

socket.on("connect", () => {
    console.log("Conectado al servidor de sockets:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Desconectado del servidor de sockets");
});

socket.on("connect_error", (error) => {
    console.error("❌ Error al conectar con WebSockets:", error.message);
    // Intenta reconectar manualmente hasta 5 veces
    if (!socket._reconnectAttempts) socket._reconnectAttempts = 0;
    socket._reconnectAttempts++;
    if (socket._reconnectAttempts <= 5) {
      setTimeout(() => {
        console.log(`🔄 Intentando reconectar... (Intento ${socket._reconnectAttempts}/5)`);
        socket.connect();
      }, 3000);
    } else {
      console.error("❌ No se pudo reconectar después de 5 intentos.");
      socket.io.opts.reconnection = false;
    }
  });

export default socket;
