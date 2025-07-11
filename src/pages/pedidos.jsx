import {
  getPedidos,
  actualizarEstadoPedido,
  getItemsMenu,
} from "../services/pedidoHelper";
import { useEffect, useState } from "react";
import socket from "../config/socket";
import PedidoResDTO from "../models/pedidoResDTO";
import { useAuth } from "../context/authContext";
import { Filter, Plus, Minus, Trash2, Frown } from "lucide-react";
import PedidoModal from "../components/modals/PedidoModal";
import { obtenerEstiloEstado } from "../utils/estadoUtils";
import LoadingScreen from "../components/utils/LoadingScreen";

// FilterSection Component with animations
const FilterSection = ({
  mostrarFiltros,
  setMostrarFiltros,
  filtroFechaInicio,
  setFiltroFechaInicio,
  filtroFechaFin,
  setFiltroFechaFin,
  ocultarRechazados,
  setOcultarRechazados,
  filtroMesa,
  setFiltroMesa,
  mesas,
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
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
          <div className="flex items-end">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ocultarRechazados}
                onChange={() => setOcultarRechazados(!ocultarRechazados)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naranja/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naranja"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">
                Ocultar rechazados
              </span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroFechaInicio(new Date().toISOString().split("T")[0]);
                setFiltroFechaFin("");
                setOcultarRechazados(false);
                setFiltroMesa("");
              }}
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

  // Handle when dateStr is DD-MM-YYYY format (from pedido.dia)
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

// Helper to format date as DD/MM/YYYY - only for display purposes since dia is already in DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  // If the format is already DD-MM-YYYY, just replace hyphens with slashes
  if (dateStr.includes("-")) {
    return dateStr.replace(/-/g, "/");
  }
  return dateStr;
};

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalleItems, setDetalleItems] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [ocultarRechazados, setOcultarRechazados] = useState(false);
  const [itemsMenu, setItemsMenu] = useState([]);
  const [editableItems, setEditableItems] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroMesa, setFiltroMesa] = useState("");
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editablePedido, setEditablePedido] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPedidos() {
      try {
        setLoading(true);
        const data = await getPedidos();
        // Check if data is valid
        if (!data || !Array.isArray(data)) {
          console.error("Datos de pedidos inválidos:", data);
          setPedidos([]);
        } else {
          // Extract unique mesas for the filter dropdown
          const uniqueMesas = [
            ...new Set(
              data
                .filter((p) => p.mesa && p.mesa.numero)
                .map((p) => p.mesa.numero)
            ),
          ].map((numero) => ({ id: numero, numero }));

          setMesasDisponibles(uniqueMesas);
          setPedidos(data);
        }
        setFiltroFechaInicio(new Date().toISOString().split("T")[0]);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();

    socket.on("pedido:nuevo", (nuevoPedido) => {
      setPedidos((prevPedidos) =>
        [...prevPedidos, PedidoResDTO.fromJson(nuevoPedido)].sort((a, b) => {
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

            return dateB - dateA; // Most recent first
          }
          return 0;
        })
      );
      fetchPedidos();
    });

    socket.on("pedido:estadoActualizado", ({ pedidoId, estado }) => {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado } : pedido
        )
      );
    });

    socket.on("pedido:eliminado", (pedidoId) => {
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido.id !== pedidoId)
      );
    });

    return () => {
      socket.off("pedido:nuevo");
      socket.off("pedido:estadoActualizado");
      socket.off("pedido:eliminado");
    };
  }, []);

  useEffect(() => {
    if (pedidoSeleccionado) {
      const fetchItems = async () => {
        const detalles = {};
        if (pedidoSeleccionado.items.length !== 0) {
          for (let id of pedidoSeleccionado.items) {
            detalles[id] = pedidoSeleccionado.items.nombre;
          }
          setDetalleItems(detalles);
        }
        console.log(detalles);
      };
      fetchItems();
    }
  }, [pedidoSeleccionado]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getItemsMenu();
        setItemsMenu(items);
      } catch (error) {
        console.error("Error al obtener los items del menú:", error);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (pedidoSeleccionado && editMode) {
      setEditableItems(
        pedidoSeleccionado.items.map((item) => ({
          ...item,
          cantidadOriginal: item.cantidad || 1,
        }))
      );
    }
  }, [pedidoSeleccionado, editMode]);

  const cambiarEstadoPedido = (pedidoId, estado) => {
    actualizarEstadoPedido(pedidoId, estado);
    setPedidoSeleccionado(null);
  };

  const handleEliminarPedido = (pedidoId) => {
    setPedidoSeleccionado(null);
  };

  const handleCambiarCantidad = (index, nuevaCantidad) => {
    const itemsActualizados = [...editableItems];
    itemsActualizados[index] = {
      ...itemsActualizados[index],
      cantidad: Math.max(0, nuevaCantidad),
    };
    setEditableItems(itemsActualizados);
  };

  const handleCambiarItem = (index, nuevoItemId) => {
    const itemSeleccionado = itemsMenu.find((item) => item.id === nuevoItemId);
    const itemsActualizados = [...editableItems];
    itemsActualizados[index] = {
      ...itemSeleccionado,
      cantidad: itemsActualizados[index].cantidad || 1,
    };
    setEditableItems(itemsActualizados);
  };

  const handleAgregarItem = () => {
    if (itemsMenu.length > 0) {
      setEditableItems([...editableItems, { ...itemsMenu[0], cantidad: 1 }]);
    }
  };

  const handleEliminarItem = (index) => {
    const itemsActualizados = editableItems.filter((_, i) => i !== index);
    setEditableItems(itemsActualizados);
  };

  const guardarCambiosItems = () => {
    const itemsValidos = editableItems.filter((item) => item.cantidad > 0);
    const nuevoTotal = itemsValidos.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );

    setPedidoSeleccionado({
      ...pedidoSeleccionado,
      items: itemsValidos,
      total: nuevoTotal,
    });

    setEditMode(false);
  };

  const handleOpenEditMode = (pedido) => {
    if (pedido.estado !== "pendiente" && pedido.estado !== "confirmado") {
      return; // Only allow editing for pending or confirmed orders
    }

    setEditablePedido({
      ...pedido,
      comentario: pedido.comentario || "",
    });
    setEditableItems(
      pedido.items.map((item) => ({
        ...item,
        cantidadOriginal: item.cantidad || 1,
      }))
    );
    setEditMode(true);
  };

  const handleSaveEditedPedido = async () => {
    try {
      const itemsValidos = editableItems.filter((item) => item.cantidad > 0);
      const nuevoTotal = itemsValidos.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );

      const pedidoActualizado = {
        ...editablePedido,
        items: itemsValidos,
        total: nuevoTotal,
        subtotal: nuevoTotal, // Assuming no additional charges for now
      };

      // Here you would call your API to update the pedido
      // await updatePedido(editablePedido.id, pedidoActualizado);

      // Update local state
      setPedidos((prevPedidos) =>
        prevPedidos.map((p) =>
          p.id === editablePedido.id ? pedidoActualizado : p
        )
      );

      setPedidoSeleccionado(pedidoActualizado);
      setEditMode(false);
      setEditablePedido(null);
      setEditableItems([]);
    } catch (error) {
      console.error("Error updating pedido:", error);
    }
  };


  // Update the pedidosFiltrados to include pagination
  const pedidosFiltrados = pedidos
    .filter((pedido) => {
      if (ocultarRechazados && pedido.estado === "rechazado") {
        return false;
      }

      // Filter by date using the new DD-MM-YYYY format
      if (filtroFechaInicio || filtroFechaFin) {
        const fechaPedido = parseDate(pedido.fecha);

        if (!fechaPedido) return true; // If parsing fails, include it

        if (filtroFechaInicio && filtroFechaFin) {
          const inicio = parseDate(filtroFechaInicio);
          inicio.setHours(0, 0, 0, 0);

          const fin = parseDate(filtroFechaFin);
          fin.setHours(23, 59, 59, 999);

          return fechaPedido >= inicio && fechaPedido <= fin;
        } else if (filtroFechaInicio) {
          const inicio = parseDate(filtroFechaInicio);
          inicio.setHours(0, 0, 0, 0);
          return fechaPedido >= inicio;
        } else if (filtroFechaFin) {
          const fin = parseDate(filtroFechaFin);
          fin.setHours(23, 59, 59, 999);
          return fechaPedido <= fin;
        }
      }
      // Filtro por mesa
      if (filtroMesa && pedido.mesa && pedido.mesa.numero != filtroMesa) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date and time (most recent first)
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

        return dateB - dateA; // Most recent first
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = pedidosFiltrados.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroFechaInicio, filtroFechaFin, ocultarRechazados, filtroMesa]);

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
                {Math.min(endIndex, pedidosFiltrados.length)}
              </span>{" "}
              de <span className="font-medium">{pedidosFiltrados.length}</span>{" "}
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

  // Update the getMedioPagoNombre function to use the medioPago object directly from pedido
  const getMedioPagoNombre = (pedido) => {
    if (!pedido || !pedido.medioPago) return "No registrado";
    return pedido.medioPago.nombre;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-naranja flex items-center">
            <span className="mr-2">📝</span> Gestión de Pedidos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra y da seguimiento a todos los pedidos de clientes
          </p>
        </div>

        {/* Mensaje de carga */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-naranja border-t-transparent rounded-full"></div>
            <p className="text-gray-600 text-lg">Cargando pedidos...</p>
          </div>
        )}

        {/* Mensaje cuando no hay pedidos */}
        {!loading && pedidos.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="text-gray-400 text-6xl mb-4 flex justify-center">
              <Frown size={56} />
            </div>
            <p className="text-gray-600 text-lg">
              No se pudieron cargar los pedidos. Por favor, intenta mas tarde.
            </p>
          </div>
        )}

        {/* Contenido principal cuando hay pedidos */}
        {!loading && pedidos.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-5 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Pedidos</h2>
              </div>

              <FilterSection
                mostrarFiltros={mostrarFiltros}
                setMostrarFiltros={setMostrarFiltros}
                filtroFechaInicio={filtroFechaInicio}
                setFiltroFechaInicio={setFiltroFechaInicio}
                filtroFechaFin={filtroFechaFin}
                setFiltroFechaFin={setFiltroFechaFin}
                ocultarRechazados={ocultarRechazados}
                setOcultarRechazados={setOcultarRechazados}
                filtroMesa={filtroMesa}
                setFiltroMesa={setFiltroMesa}
                mesas={mesasDisponibles}
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
                        Mesa
                      </th>
                      <th className="px-4 py-3 text-gray-700 font-semibold text-right">
                        Total
                      </th>
                      <th className="px-4 py-3 text-gray-700 font-semibold text-center">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPedidos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="text-gray-400 text-5xl mb-4">
                              📭
                            </div>
                            <p className="text-gray-600 text-lg">
                              No se encontraron pedidos que coincidan con los
                              filtros aplicados.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPedidos.map((pedido, index) => (
                        <tr
                          key={pedido.id}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            index !== currentPedidos.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                          onClick={() => setPedidoSeleccionado(pedido)}
                        >
                          <td className="px-4 py-3 text-gray-800">
                            {formatDate(pedido.fecha)}
                          </td>
                          <td className="px-3 py-3 text-gray-800">
                            {pedido.hora}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {pedido.cliente.nombre}{" "}
                            {pedido.cliente.apellido || ""}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {pedido.mesa && pedido.mesa.numero
                              ? `Mesa ${pedido.mesa.numero}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-800 text-right font-medium">
                            ${pedido.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-800 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerEstiloEstado(
                                pedido.estado,
                                "badge"
                              )}`}
                            >
                              {pedido.estado.toUpperCase()}
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
            </div>

            {/* Updated counter */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {currentPedidos.length} de {pedidosFiltrados.length}{" "}
              pedidos filtrados (Total: {pedidos.length})
            </div>
          </>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {pedidoSeleccionado && (
        <PedidoModal
          pedido={editMode ? editablePedido : pedidoSeleccionado}
          onClose={() => {
            setPedidoSeleccionado(null);
            setEditMode(false);
            setEditablePedido(null);
            setEditableItems([]);
          }}
          onUpdateEstado={cambiarEstadoPedido}
          onProcessPayment={(pedidoId) => {
            console.log("Processing payment for pedido", pedidoId);
            // Implement payment processing here
          }}
          editMode={editMode}
          setEditMode={setEditMode}
          itemsMenu={itemsMenu}
          editableItems={editableItems}
          setEditableItems={setEditableItems}
          onAddItem={handleAgregarItem}
          onChangeItem={handleCambiarItem}
          onChangeQuantity={handleCambiarCantidad}
          onRemoveItem={handleEliminarItem}
          onSaveChanges={handleSaveEditedPedido}
          onOpenEditMode={handleOpenEditMode}
        />
      )}
    </div>
  );
}

export default Pedidos;
