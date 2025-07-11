import {
  getReservas,
  cambiarEstadoReserva,
  deleteReserva,
  patchReserva,
} from "../services/reservaHelper";
import { getMesasLayout } from "../services/layoutHelper";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import reservaResDTO from "../models/reservaResDTO";
import socket from "../config/socket";
import { Trash2, Pencil, X, Filter, Frown } from "lucide-react";
import LoadingScreen from "../components/utils/LoadingScreen";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { toast } from "react-toastify";
import { sub } from "date-fns";

// FilterSection Component with animations
const FilterSection = ({
  mostrarFiltros,
  setMostrarFiltros,
  filtroFechaInicio,
  setFiltroFechaInicio,
  filtroFechaFin,
  setFiltroFechaFin,
  filtroEstado,
  setFiltroEstado,
  filtroCliente,
  setFiltroCliente,
  filtroMesa,
  setFiltroMesa,
  mesas,
  limpiarFiltros,
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4">
        <h3 className="text-sm font-medium text-gray-700">
          Opciones de filtrado
        </h3>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="bg-transparent flex items-center gap-2 text-sm text-gray-600 hover:text-naranja transition-colors"
        >
          <Filter size={16} />
          {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          mostrarFiltros ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesa
            </label>
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            >
              <option value="">Todas</option>
              {mesas &&
                mesas.map((mesa) => (
                  <option key={mesa.id} value={mesa.numero}>
                    Mesa {mesa.numero}
                  </option>
                ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to parse DD-MM-YYYY into a Date object for comparison
const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Handle when dateStr is DD-MM-YYYY format
  if (dateStr.includes("-") && dateStr.split("-").length === 3) {
    const parts = dateStr.split("-");
    // Check if it's already in YYYY-MM-DD format
    if (parts[0].length === 4) {
      return new Date(dateStr);
    }
    // It's in DD-MM-YYYY format
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }

  // Handle when dateStr is already in YYYY-MM-DD format (from date inputs)
  return new Date(dateStr);
};

// Helper to format date as DD/MM/YYYY - only for display purposes
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  // If the format is already DD-MM-YYYY, just replace hyphens with slashes
  if (dateStr.includes("-")) {
    return dateStr.replace(/-/g, "/");
  }
  return dateStr;
};

function RenderReservas() {
  const [reservas, setReservas] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editModal, setEditModal] = useState(false);
  const [reservaEdit, setReservaEdit] = useState({});
  const [timeIntervals, setTimeIntervals] = useState([]);

  // Filtros
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroMesa, setFiltroMesa] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  });

  const INTERVAL_MINUTES = 30; //!varaible de config

  useEffect(() => {
    async function fetchReservas() {
      try {
        setLoading(true);
        const data = await getReservas();
        // Validate response data
        if (!data || !Array.isArray(data)) {
          console.error("Datos de reservas inválidos:", data);
          setReservas([]);
        } else {
          setReservas(data);
        }
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
        setReservas([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    async function fetchMesas() {
      try {
        const mesasData = await getMesasLayout();
        if (mesasData && Array.isArray(mesasData)) {
          setMesasDisponibles(mesasData);
        }
      } catch (error) {
        console.error("Error al obtener las mesas:", error);
        setMesasDisponibles([]);
      }
    }

    fetchReservas();
    fetchMesas();
    generateTimeSlots();
    setFiltroFechaInicio(new Date().toISOString().split("T")[0]);

    const handler = (nuevaReserva) => {
      setReservas((prevReservas) =>
        [...prevReservas, reservaResDTO.fromJson(nuevaReserva)].sort((a, b) => {
          // Parse dates for comparison
          const dateA = parseDate(a.fecha);
          const dateB = parseDate(b.fecha);

          if (dateA && dateB) {
            // Add time components
            if (a.hora) {
              const [hoursA, minutesA] = a.hora.split(":").map(Number);
              dateA.setHours(hoursA, minutesA);
            }

            if (b.hora) {
              const [hoursB, minutesB] = b.hora.split(":").map(Number);
              dateB.setHours(hoursB, minutesB);
            }

            return dateA - dateB; // Earliest first
          }
          return 0;
        })
      );
      toast.success(
        `Nueva reserva creada: ${nuevaReserva.clienteNombre} - ${formatDate(
          nuevaReserva.fecha
        )}`
      );
    };

    socket.on("reserva:nueva", handler);

    socket.on("reserva:actualizada", (reservaActualizada) => {
      toast.info(`Reserva ${reservaActualizada.id} actualizada`);
      // toast.success(`Reserva ${reservaActualizada.id} actualizada`);
      setReservas((prevReservas) =>
        prevReservas.map((reserva) =>
          reserva.id === reservaActualizada.id
            ? reservaResDTO.fromJson(reservaActualizada)
            : reserva
        )
      );
      if (
        reservaSeleccionada &&
        reservaSeleccionada.id === reservaActualizada.id
      ) {
        setReservaSeleccionada(reservaResDTO.fromJson(reservaActualizada));
      }
    });

    socket.on("reserva:estado", ({ reservaId, estado }) => {
      toast.success(`Reserva ${reservaId} actualizada a estado: ${estado}`);
      setReservas((prevReservas) =>
        prevReservas.map((reserva) =>
          reserva.id === reservaId ? { ...reserva, estado } : reserva
        )
      );
    });

    socket.on("reserva:eliminada", (reservaId) => {
      toast.success(`Reserva ${reservaId} actualizada a estado: ${estado}`);
      setReservas((prevReservas) =>
        prevReservas.filter((reserva) => reserva.id !== reservaId)
      );
      if (reservaSeleccionada && reservaSeleccionada.id === reservaId) {
        setReservaSeleccionada(null);
      }
    });

    return () => {
      socket.off("reserva:nueva");
      socket.off("reserva:estado");
      socket.off("reserva:actualizada");
      socket.off("reserva:eliminada");
    };
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h < 20; h++) {
      //todo: usar valores configurables --------------------------------------------------------------------------
      for (let m = 0; m < 60; m += INTERVAL_MINUTES) {
        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    setTimeIntervals(slots);
  };

  const handleEliminarReserva = () => {
    if (!reservaSeleccionada) return;

    setConfirmationModal({
      visible: true,
      title: "Confirmar Eliminación",
      message: `¿Está seguro que desea eliminar la reserva #${reservaSeleccionada.id} de ${reservaSeleccionada.clienteNombre}? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        try {
          const eliminado = await deleteReserva(reservaSeleccionada.id);
          if (eliminado) {
            setReservas((prevReservas) =>
              prevReservas.filter(
                (reserva) => reserva.id !== reservaSeleccionada.id
              )
            );
            setReservaSeleccionada(null);
            toast.success("Reserva eliminada correctamente");
          }
        } catch (error) {
          toast.error("Error al eliminar la reserva");
        }
        setConfirmationModal({ ...confirmationModal, visible: false });
      },
    });
  };

  const handleOpenEdit = (reserva) => {
    // Create a copy of the reserva with proper date handling
    const formattedReserva = {
      ...reserva,
      // Store the original date string for the input field
      fecha: (() => {
        // Try to get the date from either 'fecha' or 'dia' property
        const dateStr = reserva.fecha || reserva.dia;
        if (!dateStr) return "";

        // Convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD for the date input
        const fecha = dateStr.replace(/\//g, "-");
        const parts = fecha.split("-");

        if (parts.length === 3) {
          // Check if it's already in YYYY-MM-DD format
          if (parts[0].length === 4) {
            return fecha; // Already in correct format
          } else {
            // It's in DD-MM-YYYY format, convert to YYYY-MM-DD
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }
        return "";
      })(),
      // Ensure dia is also set for consistency
      dia: (() => {
        const dateStr = reserva.fecha || reserva.dia;
        if (!dateStr) return "";

        const fecha = dateStr.replace(/\//g, "-");
        const parts = fecha.split("-");

        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // Convert from YYYY-MM-DD to DD-MM-YYYY
            const [year, month, day] = parts;
            return `${day}-${month}-${year}`;
          } else {
            // Already in DD-MM-YYYY format
            return fecha;
          }
        }
        return "";
      })(),
    };

    setReservaEdit(formattedReserva);
    setEditModal(true);
  };

  const handleUpdateReserva = (e) => {
    e.preventDefault();

    setConfirmationModal({
      visible: true,
      title: "Confirmar Actualización",
      message: `¿Está seguro que desea actualizar la reserva #${reservaEdit.id}? Los cambios se aplicarán inmediatamente.`,
      type: "warning",
      onConfirm: async () => {
        try {
          // Create a proper submission object with dates formatted correctly
          const submission = {
            ...reservaEdit,
            // Ensure dia is in DD-MM-YYYY format for display consistency
            dia: reservaEdit.dia,
            // Include a properly formatted date for the API
            fecha: reservaEdit.fecha,
          };

          const response = await patchReserva(reservaEdit.id, submission);

          if (response?.status === 200) {

            toast.success("Reserva actualizada correctamente");

            // Update the reservation in the list with consistent date formats
            const updatedReserva = {
              ...submission,
              // Ensure both fecha and dia are properly formatted
              fecha: submission.dia, // Use DD-MM-YYYY format for consistency
              dia: submission.dia, // Keep DD-MM-YYYY format
            };

            // setReservas((prevReservas) =>
            //   prevReservas.map((reserva) =>
            //     reserva.id === reservaEdit.id ? updatedReserva : reserva
            //   )
            // );

            // Update selected reservation if it's the one being edited
            // if (
            //   reservaSeleccionada &&
            //   reservaSeleccionada.id === reservaEdit.id
            // ) {
            //   setReservaSeleccionada(updatedReserva);
            // }
            setEditModal(false);
          } else if (response?.status === 404) {
            toast.error("No hay mesa disponible para ese día a esa hora");
          }
          
        } catch (error) {
          console.log('error',error.message)
          toast.error("Error al actualizar la reserva, vuelva a intentarlo" ); 
        }
        setConfirmationModal({ ...confirmationModal, visible: false });
      },
    });
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-300 text-yellow-900";
      case "aceptada":
        return "bg-green-300 text-green-900";
      case "rechazada":
        return "bg-red-300 text-red-900";
      default:
        return "bg-gray-300 text-gray-900";
    }
  };

  const limpiarFiltros = () => {
    setFiltroFechaInicio(new Date().toISOString().split("T")[0]);
    setFiltroFechaFin("");
    setFiltroEstado("");
    setFiltroCliente("");
    setFiltroMesa("");
  };

  // Filtrar reservas según criterios
  const reservasFiltradas = reservas
    .filter((reserva) => {
      // Filtro por estado
      if (filtroEstado && reserva.estado !== filtroEstado) {
        return false;
      }

      // Filtro por cliente
      if (
        filtroCliente &&
        !reserva.clienteNombre
          ?.toLowerCase()
          .includes(filtroCliente.toLowerCase())
      ) {
        return false;
      }

      // Filtro por mesa
      if (filtroMesa && reserva.mesa && reserva.mesa.numero != filtroMesa) {
        return false;
      }

      // Filtro por fecha
      if (filtroFechaInicio || filtroFechaFin) {
        const fechaReserva = parseDate(reserva.fecha);

        if (!fechaReserva) return true; // If parsing fails, include it

        if (filtroFechaInicio && filtroFechaFin) {
          const inicio = parseDate(filtroFechaInicio);
          inicio.setHours(0, 0, 0, 0);

          const fin = parseDate(filtroFechaFin);
          fin.setHours(23, 59, 59, 999);

          return fechaReserva >= inicio && fechaReserva <= fin;
        } else if (filtroFechaInicio) {
          const inicio = parseDate(filtroFechaInicio);
          inicio.setHours(0, 0, 0, 0);
          return fechaReserva >= inicio;
        } else if (filtroFechaFin) {
          const fin = parseDate(filtroFechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaReserva <= fin;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date and time
      const dateA = parseDate(a.fecha);
      const dateB = parseDate(b.fecha);

      if (dateA && dateB) {
        // Add time components for more precise sorting
        if (a.hora) {
          const [hoursA, minutesA] = a.hora.split(":").map(Number);
          dateA.setHours(hoursA, minutesA);
        }

        if (b.hora) {
          const [hoursB, minutesB] = b.hora.split(":").map(Number);
          dateB.setHours(hoursB, minutesB);
        }

        return dateA - dateB; // Ascending order (earliest first)
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(reservasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservas = reservasFiltradas.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filtroFechaInicio,
    filtroFechaFin,
    filtroEstado,
    filtroCliente,
    filtroMesa,
  ]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(endIndex, reservasFiltradas.length)}
              </span>{" "}
              de <span className="font-medium">{reservasFiltradas.length}</span>{" "}
              resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Anterior
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    currentPage === number
                      ? "z-10 bg-naranja border-naranja text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  } border`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-naranja flex items-center">
            <span className="mr-2">📅</span> Gestión de Reservas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra y confirma las reservas de mesas
          </p>
        </div>

        {/* Mensaje de carga */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-naranja border-t-transparent rounded-full"></div>
            <p className="text-gray-600 text-lg">Cargando reservas...</p>
          </div>
        )}

        {!loading && reservas.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="text-gray-400 text-6xl mb-4 flex justify-center">
              <Frown size={56} />
            </div>
            <p className="text-gray-600 text-lg">
              No se pudieron cargar las reservas. Por favor, intenta mas tarde.
            </p>
          </div>
        )}

        {!loading && reservas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-5 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Reservas</h2>
            </div>

            {/* FilterSection implemented here */}
            <FilterSection
              mostrarFiltros={mostrarFiltros}
              setMostrarFiltros={setMostrarFiltros}
              filtroFechaInicio={filtroFechaInicio}
              setFiltroFechaInicio={setFiltroFechaInicio}
              filtroFechaFin={filtroFechaFin}
              setFiltroFechaFin={setFiltroFechaFin}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              filtroCliente={filtroCliente}
              setFiltroCliente={setFiltroCliente}
              filtroMesa={filtroMesa}
              setFiltroMesa={setFiltroMesa}
              mesas={mesasDisponibles}
              limpiarFiltros={limpiarFiltros}
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-3 text-gray-700 font-semibold">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-semibold">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-semibold">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-semibold">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-semibold">
                      Mesa
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-semibold text-center">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {!loading &&
                  reservas.length > 0 &&
                  currentReservas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-5xl mb-4">📭</div>
                          <p className="text-gray-600 text-lg">
                            No se encontraron reservas que coincidan con los
                            filtros aplicados.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentReservas.map((reserva, index) => (
                      <tr
                        key={reserva.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          index !== currentReservas.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                        onClick={() => setReservaSeleccionada(reserva)}
                      >
                        <td className="px-4 py-3 text-gray-800">
                          {formatDate(reserva.fecha)}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {reserva.hora}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {reserva.clienteNombre || "No disponible"}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {reserva.clienteTelefono || "No disponible"}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {reserva.mesa?.numero || "No asignada"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(
                              reserva.estado
                            )}`}
                          >
                            {reserva.estado.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <PaginationComponent />

            {/* Updated counter */}
            {!loading && reservas.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Mostrando {currentReservas.length} de {reservasFiltradas.length}{" "}
                reservas filtradas (Total: {reservas.length})
              </div>
            )}
          </div>
        )}

        {/* Modal con detalles de la reserva */}
        {reservaSeleccionada && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
            onClick={(e) => {
              // Only close if clicking on the backdrop, not the modal content
              if (e.target === e.currentTarget) setReservaSeleccionada(null);
            }}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera modal */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Reserva #{reservaSeleccionada.id}
                </h2>
                <button
                  onClick={() => setReservaSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido modal */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium text-gray-800">
                      {reservaSeleccionada.clienteNombre || "No disponible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-800">
                      {reservaSeleccionada.clienteTelefono || "No disponible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(
                        reservaSeleccionada.fecha || reservaSeleccionada.dia
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-medium text-gray-800">
                      {reservaSeleccionada.hora}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mesa asignada</p>
                    <p className="font-medium text-gray-800">
                      {reservaSeleccionada.mesa.numero || "No asignada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Cantidad de personas
                    </p>
                    <p className="font-medium text-gray-800">
                      {reservaSeleccionada.cantPersonas || "No asignada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(
                        reservaSeleccionada.estado
                      )}`}
                    >
                      {reservaSeleccionada.estado.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Comentario */}
                {reservaSeleccionada.comentario && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Comentario</p>
                    <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md">
                      {reservaSeleccionada.comentario}
                    </p>
                  </div>
                )}

                {/* Acciones administrativas */}
                {(user?.cargo == "admin" || user?.cargo === "encargado") && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOpenEdit(reservaSeleccionada)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      onClick={handleEliminarReserva}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Botones de acción para cambiar estado */}
              {reservaSeleccionada.estado === "pendiente" && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          visible: true,
                          title: "Rechazar Reserva",
                          message: `¿Está seguro que desea rechazar la reserva #${reservaSeleccionada.id} de ${reservaSeleccionada.clienteNombre}?`,
                          type: "danger",
                          onConfirm: async () => {
                            try {
                              await cambiarEstadoReserva(
                                reservaSeleccionada.id,
                                "rechazada"
                              );
                              setReservaSeleccionada(null);
                              toast.success("Reserva rechazada");
                            } catch (error) {
                              toast.error("Error al rechazar la reserva");
                            }
                            setConfirmationModal({
                              ...confirmationModal,
                              visible: false,
                            });
                          },
                        });
                      }}
                      className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          visible: true,
                          title: "Aceptar Reserva",
                          message: `¿Está seguro que desea aceptar la reserva #${reservaSeleccionada.id} de ${reservaSeleccionada.clienteNombre}?`,
                          type: "success",
                          onConfirm: async () => {
                            try {
                              await cambiarEstadoReserva(
                                reservaSeleccionada.id,
                                "aceptada"
                              );
                              setReservaSeleccionada(null);
                              toast.success("Reserva aceptada");
                            } catch (error) {
                              toast.error("Error al aceptar la reserva");
                            }
                            setConfirmationModal({
                              ...confirmationModal,
                              visible: false,
                            });
                          },
                        });
                      }}
                      className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                    >
                      Aceptar reserva
                    </button>
                  </div>
                </div>
              )}

              {reservaSeleccionada.estado !== "pendiente" && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setReservaSeleccionada(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {editModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
            onClick={closeEditModal}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera modal */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Editar Reserva #{reservaEdit.id}
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-4">
                <form onSubmit={handleUpdateReserva}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                      </label>
                      <input
                        type="text"
                        value={reservaEdit.clienteNombre || ""}
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={reservaEdit.fecha || ""}
                        onChange={(e) => {
                          const dateValue = e.target.value; // This is in YYYY-MM-DD format

                          if (dateValue) {
                            const [year, month, day] = dateValue.split("-");

                            setReservaEdit({
                              ...reservaEdit,
                              fecha: dateValue, // Store the YYYY-MM-DD format for the input
                              dia: `${day}-${month}-${year}`, // Store DD-MM-YYYY format for display
                            });
                          } else {
                            setReservaEdit({
                              ...reservaEdit,
                              fecha: "",
                              dia: "",
                            });
                          }
                        }}
                        required
                        className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora
                      </label>
                      <select
                        value={reservaEdit.hora || ""}
                        onChange={(e) =>
                          setReservaEdit({
                            ...reservaEdit,
                            hora: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                      >
                        {timeIntervals.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad de personas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={reservaEdit.cantPersonas || ""}
                        onChange={(e) =>
                          setReservaEdit({
                            ...reservaEdit,
                            cantPersonas: parseInt(e.target.value) || "",
                          })
                        }
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                        placeholder="Número de comensales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mesa
                      </label>
                      <select
                        value={
                          reservaEdit.mesa?.numero || reservaEdit.mesaId || ""
                        }
                        onChange={(e) => {
                          const selectedMesa = mesasDisponibles.find(
                            (mesa) => mesa.numero.toString() === e.target.value
                          );
                          setReservaEdit({
                            ...reservaEdit,
                            mesa: selectedMesa || null,
                            mesaId: selectedMesa?.id || null,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                      >
                        <option value="">Seleccionar mesa</option>
                        {mesasDisponibles.map((mesa) => (
                          <option key={mesa.id} value={mesa.numero}>
                            Mesa {mesa.numero}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={reservaEdit.estado || "pendiente"}
                        onChange={(e) =>
                          setReservaEdit({
                            ...reservaEdit,
                            estado: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aceptada">Aceptada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 border border-gray-300 text-gray-100 rounded-md bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={confirmationModal.visible}
          onClose={() =>
            setConfirmationModal({ ...confirmationModal, visible: false })
          }
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={
            confirmationModal.type === "danger" ? "Eliminar" : "Confirmar"
          }
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}

function ReservasPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReservas = async () => {
      setIsLoading(true);
      // Load reservas data
      // ...existing data loading code...
      setIsLoading(false);
    };

    loadReservas();
  }, []);

  if (isLoading) {
    return <LoadingScreen title="Reservas" subtitle="Cargando reservas..." />;
  }

  return <RenderReservas />;
}

export default ReservasPage;
