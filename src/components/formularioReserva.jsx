import { useEffect, useState } from "react";
import { postReserva } from "../services/reservaHelper";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const todayStr = new Date().toISOString().split("T")[0];

function FormularioReserva({ onClose, mesa }) {
  const {user} = useAuth();
  const [reservas, setReservas] = useState({clienteNombre: "", clienteTelefono: "", fecha: todayStr, hora: "", cantPersonas: "", comentario: "", mesa: mesa || null, estado: user.cargo === "cliente" ? "pendiente" : "aceptada" });
  const [timeIntervals, setTimeIntervals] = useState([]); // Time slots


  // 🔹 Generate selectable time slots based on interval
  const generateTimeSlots = () => {
    const ahora = new Date();
    const slots = [];
    const INTERVAL_MINUTES = 30; //todo: Set intervalor por config
    for (let h = 8; h < 20; h++) { //todo: setear fecha de apertura y cierre. 
      if (h >= ahora.getHours() || reservas.fecha > todayStr) {
      for (let m = 0; m < 60; m += INTERVAL_MINUTES) {
        if ((h === ahora.getHours() && m > ahora.getMinutes() ) || h > ahora.getHours() || reservas.fecha > todayStr)
          slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
      }
    }
    setTimeIntervals(slots);
  };

  // 🔹 Use useEffect to generate time slots when the component mounts
  useEffect(() => {
    generateTimeSlots();
  }, [reservas.fecha]);

  // Update mesaId when mesa prop changes
  useEffect(() => {
    if (mesa) {
      setReservas(prev => ({ ...prev, mesa: mesa}));
    }
  }, [mesa]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await postReserva(reservas);
    console.log("Reserva response:", response);
    if (response.status === 201) {
      toast.success("Reserva realizada con éxito");
      setReservas({ clienteNombre: "", clienteTelefono: "", fecha: "", hora: "", cantPersonas: "", comentario: "", mesa: mesa || null });
      onClose();
    } else if (response.status === 404) {
      if (reservas.mesa) 
        toast.error(`La mesa ${mesa.numero} no esta disponible para la fecha y hora seleccionadas`);
      else  
        toast.error("No hay mesas disponibles para la fecha y hora seleccionadas");
    } else {
      toast.error("Error al realizar la reserva");
      console.error("Error al realizar la reserva:", response);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-96">
      {mesa && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-800">
            🪑 Reservando para Mesa #{mesa.numero || mesa.id}
          </p>
        </div>
      )}
      {user?.cargo != "cliente" && (
        <>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={reservas.clienteNombre}
            onChange={(e) => setReservas({ ...reservas, clienteNombre: e.target.value })}
            className="border p-2 w-full mt-2 bg-white text-black placeholder-gray-500"
            required />
          <input
            type="number"
            placeholder="Numero de telefono"
            value={reservas.clienteTelefono}
            onChange={(e) => setReservas({ ...reservas, clienteTelefono: e.target.value })}
            className="border p-2 w-full mt-2 bg-white text-black placeholder-gray-500"
            required />
        </>
      )}
      <input
        type="date"
        value={reservas.fecha}
        min={todayStr}
        onChange={(e) => setReservas({ ...reservas, fecha: e.target.value })}
        className="border p-2 w-full mt-2 bg-white text-black placeholder-gray-500"
        required
      />
      <select
        className="border p-2 w-full mt-2 bg-white text-black"
        onChange={(e) => setReservas({ ...reservas, hora: e.target.value })}
        required
      >
        <option value="" disabled selected>Selecciona un horario</option>
        {timeIntervals.map((slot) => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Cantidad de personas"
        value={reservas.cantPersonas}
        max={20}                  //!cambiar a parametros de config
        min={1}
        onChange={(e) => setReservas({ ...reservas, cantPersonas: e.target.value })}
        className="border p-2 w-full mt-2 bg-white text-black placeholder-gray-500"
        required
      />
      <input
        type="text"
        placeholder="Comentario"
        value={reservas.comentario}
        onChange={(e) => setReservas({ ...reservas, comentario: e.target.value })}
        className="border p-2 w-full mt-2 bg-white text-black placeholder-gray-500"
      />
      <button type="submit" className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg w-full">
        Reservar
      </button>
    </form>
  );
}

export default FormularioReserva;
