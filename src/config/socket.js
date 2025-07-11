import { io } from "socket.io-client";
import { API_PORT } from "../config.js";

const socket = io(`http://localhost:${API_PORT}`, {
    transports: ["polling", "websocket"], // Primero polling y luego websocket para mayor compatibilidad
    reconnection: true,
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
    // Intenta reconectar manualmente
    setTimeout(() => {
      console.log("🔄 Intentando reconectar...");
      socket.connect();
    }, 3000);
  });

export default socket;
