import { useEffect, useState } from "react";
import { getMovimientos, addMovimiento, editMovimiento, deleteMovimiento, getMediosPago } from "../services/cajaHelper";
import { ChevronDown, ChevronUp, Pencil, X, Filter, Trash2, CircleFadingArrowUp } from "lucide-react";
import { useAuth } from "../context/authContext";
import { fi } from "date-fns/locale";
import socket from "../config/socket";
import movResDTO from "../models/movResDTO";
import { toast } from "react-toastify";
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { set } from "date-fns";

// FilterSection Component - Updated to use medioPago from API
const FilterSection = ({
  showFilters,
  setShowFilters,
  filtros,
  handleFilterChange,
  resetFiltros,
  movimientos,
  mediosPago // <-- add mediosPago as prop
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4">
        <h3 className="text-sm font-medium text-gray-700">Opciones de filtrado</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-transparent flex items-center gap-2 text-sm text-gray-600 hover:text-naranja transition-colors"
        >
          <Filter size={16} />
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Mínimo
            </label>
            <input
              type="number"
              name="montoMin"
              value={filtros.montoMin}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Máximo
            </label>
            <input
              type="number"
              name="montoMax"
              value={filtros.montoMax}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medio de Pago
            </label>
            <select
              name="medioPago"
              value={filtros.medioPago || ""}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            >
              <option value="">Todos</option>
              {mediosPago.map((medio) => (
                <option key={medio.id} value={medio.id}>
                  {medio.nombre} {medio.ref != '-' ? `(${medio.ref})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={resetFiltros}
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

// Helper to parse date in DD-MM-YYYY format
const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Handle date part of a timestamp
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // Handle DD-MM-YYYY format
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // Already in YYYY-MM-DD format
      return new Date(dateStr);
    }
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }

  // Try standard date parsing as fallback
  return new Date(dateStr);
};

// Helper to format date as DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  // If it's a full ISO timestamp, extract just the date part
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // If the format is already DD-MM-YYYY, just replace hyphens with slashes
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length !== 4) {
      // Already in DD-MM-YYYY format, just replace hyphens with slashes
      return dateStr.replace(/-/g, '/');
    }
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  // If we get here, we have a format we don't recognize, return as is
  return dateStr;
};

function Caja() {
  const [allMovimientos, setAllMovimientos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentMovimiento, setCurrentMovimiento] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });
  const [movimientoToDelete, setMovimientoToDelete] = useState(null);
  const [activeTag, setActiveTag] = useState("all"); // 'all', 'B', or 'N'
  const { user } = useAuth();
  const [mediosPago, setMediosPago] = useState([]);

  // Estado para los filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: "",
    montoMin: "",
    montoMax: "",
    medioPago: ""
  });

  // Estado para el formulario de nuevo movimiento
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5), // Format: HH:MM
    descripcion: "",
    monto: "",
    medioPagoId: "", // Changed from tipo to medioPagoId
    tag: 'B' // Default tag
  });

  // Fetch payment methods
  useEffect(() => {
    async function fetchMediosPago() {
      try {
        const response = await getMediosPago();
        if (response.status === 200) {
          setMediosPago(response.data);
        } else {
          console.error("Error fetching payment methods:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }
    fetchMediosPago();
  }, []);


  // Cargar movimientos
  useEffect(() => {
    async function fetchMovimientos() {
      setIsLoading(true);
      try {
        const data = await getMovimientos();
        setAllMovimientos(data);

        // Inicialmente mostrar todos los movimientos
        setMovimientos(data);
        setFilteredMovimientos(data);

      } catch (error) {
        console.error("Error al cargar movimientos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovimientos();
  }, []);

  useEffect(() => {
    // Helper function to sort movements by date and time
    const sortMovimientosByDate = (movimientos) => {
      return [...movimientos].sort((a, b) => {
        // Convert DD-MM-YYYY to YYYY-MM-DD format for proper date parsing
        const convertDate = (dateStr) => {
          if (!dateStr) return '1970-01-01';
          const [day, month, year] = dateStr.split('-');
          return `${year}-${month}-${day}`;
        };
        
        // Create datetime strings for comparison
        const dateTimeA = `${convertDate(a.fecha)}T${a.hora || '00:00'}`;
        const dateTimeB = `${convertDate(b.fecha)}T${b.hora || '00:00'}`;
        
        // Sort in descending order (newest first)
        return new Date(dateTimeB) - new Date(dateTimeA);
      });
    };

    // Handle new movements
    socket.on("movimiento:nuevo", (nuevoMovimiento) => {
      const mov = movResDTO.fromJson(nuevoMovimiento);
      setAllMovimientos((prevMovimientos) =>
        sortMovimientosByDate([...prevMovimientos, mov])
      );
    });

    // Handle movement updates (also handles new movements if they don't exist)
    socket.on("movimiento:actualizado", (movimiento) => {
      const mov = movResDTO.fromJson(movimiento);
      toast.info(`Movimiento actualizado: ${mov.descripcion} - $${mov.monto.toFixed(2)}`, "info");
      setAllMovimientos((prevMovimientos) => {
        const existingIndex = prevMovimientos.findIndex((item) => item.id === mov.id);
        let updatedMovimientos;
        
        if (existingIndex !== -1) {
          // Update existing movement
          updatedMovimientos = prevMovimientos.map((item) =>
            item.id === mov.id ? mov : item
          );
        } else {
          // Add new movement if it doesn't exist
          updatedMovimientos = [...prevMovimientos, mov];
        }
        
        return sortMovimientosByDate(updatedMovimientos);
      });
    });
    
    // Handle movement deletion
    socket.on("movimiento:eliminado", (movimientoId) => {
      setAllMovimientos((prevMovimientos) =>
        prevMovimientos.filter((mov) => mov.id !== movimientoId)
      );
    });
    
    return () => {
      socket.off("movimiento:nuevo");
      socket.off("movimiento:actualizado");
      socket.off("movimiento:eliminado");
    };  
  },[]);

  // Filtrar por tag
  useEffect(() => {
    if (activeTag === "all") {
      setMovimientos(allMovimientos);
    } else {
      setMovimientos(allMovimientos.filter(mov => mov.tag === activeTag));
    }
  }, [activeTag, allMovimientos]);

  // Aplicar filtros adicionales
  useEffect(() => {
    let resultado = [...movimientos];

    if (filtros.fechaInicio) {
      const fechaInicio = parseDate(filtros.fechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      resultado = resultado.filter(mov => {
        const movDate = parseDate(mov.fecha);
        return movDate && movDate >= fechaInicio;
      });
    }

    if (filtros.fechaFin) {
      const fechaFin = parseDate(filtros.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      resultado = resultado.filter(mov => {
        const movDate = parseDate(mov.fecha);
        return movDate && movDate <= fechaFin;
      });
    }

    if (filtros.montoMin) {
      resultado = resultado.filter(mov => mov.monto >= parseFloat(filtros.montoMin));
    }

    if (filtros.montoMax) {
      resultado = resultado.filter(mov => mov.monto <= parseFloat(filtros.montoMax));
    }

    if (filtros.medioPago) {
      resultado = resultado.filter(mov => {
        // Check for nested medioPago object with id
        console.log(mov);
        if (mov.medioPago && mov.medioPago.id != null) {
          console.log(filtros.medioPago, mov.medioPago.id);
          return String(mov.medioPago.id) == String(filtros.medioPago);
        }
        // Also check for direct medioPagoId property
        if (mov.medioPagoId != null) {
          return String(mov.medioPagoId) === String(filtros.medioPago);
        }

        return false;
      });
    }

    setFilteredMovimientos(resultado);
  }, [filtros, movimientos]);

  // Calcular total de los movimientos filtrados
  const total = filteredMovimientos
    .filter(mov => !mov.baja)
    .reduce((acc, mov) => acc + mov.monto, 0);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  // Resetear filtros
  const resetFiltros = () => {
    setFiltros({
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: "",
      montoMin: "",
      montoMax: "",
      medioPago: ""
    });
  };

  // Cambiar vista de tag
  const toggleTagView = (tag) => {
    setActiveTag(tag);
  };

  // Abrir modal para agregar o editar
  const openModal = (movimiento) => {
    if (movimiento) {
      // Modo edición
      // Extract time from the date if it exists
      let time = "00:00";
      movimiento.fecha.replaceAll('-', '/'); // Ensure date is in correct format
      // if (movimiento.fecha && movimiento.fecha.includes('T')) {
      //   time = movimiento.fecha.split('T')[1]?.slice(0, 5) || "00:00";
      // }
      console.log("Opening modal for movimiento:", movimiento);
      
      setFormData({
        id: movimiento.id,
        fecha: new Date(movimiento.fecha).toISOString().split('T')[0], // Format: YYYY-MM-DD
        hora: movimiento.hora,
        descripcion: movimiento.descripcion,
        monto: movimiento.monto.toString(),
        medioPagoId: movimiento.medioPago?.id || "", 
        tag: movimiento.tag
      });
      setCurrentMovimiento(movimiento);
    } else {
      // Modo agregar
      const now = new Date();
      setFormData({
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5), // Current time in HH:MM format
        descripcion: "",
        monto: "",
        medioPagoId: "",
        tag: activeTag === "all" ? 'B' : activeTag
      });
      setCurrentMovimiento(null);
    }
    setShowModal(true);
  };

  // Abrir modal de detalles
  const openDetailModal = (movimiento) => {
    setCurrentMovimiento(movimiento);
    setShowDetailModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentMovimiento(null);
  };

  // Cerrar modal de detalles
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setCurrentMovimiento(null);
  };

  // Guardar movimiento (agregar o editar)
  const saveMovimiento = async (e) => {
    e.preventDefault();
    try {
      // Combine fecha and hora into a full ISO datetime
      // Combine fecha and hora into a full ISO datetime, adjusting for 3 hour time difference (UTC-3)
      const combinedDateTime = new Date(`${formData.fecha}T${formData.hora}`);
      
      const movimientoData = {
        ...formData,
        fecha: combinedDateTime.toISOString(), // Send as ISO string with time component
        monto: parseFloat(formData.monto)
      };
      
      // Remove the separate hora field before sending
      delete movimientoData.hora;

      let updatedMovimientos;
      if (currentMovimiento) {
        // Editar existente
        const response = await editMovimiento(movimientoData.id, movimientoData);
        if (response.status === 200) {
          updatedMovimientos = allMovimientos.map(m =>
            m.id === movimientoData.id ? movimientoData : m
          );
        } else {
          console.error("Error al editar movimiento:", response);
          updatedMovimientos = allMovimientos;
        }
      } else {
        // Agregar nuevo
        const response = await addMovimiento(movimientoData);
        if (response.status === 201) {
          console.log(response.data) //!sacar
          const newMovimiento = response.data;
          updatedMovimientos = [...allMovimientos, newMovimiento];
        } else {
          console.error("Error al agregar movimiento:", response);
          updatedMovimientos = allMovimientos;
        }
      }

      //setAllMovimientos(updatedMovimientos);
      closeModal();
    } catch (error) {
      console.error("Error al guardar movimiento:", error);
    }
  };

  const handleAltaMov = async (mov) => {
    try {
      mov.baja = !mov.baja;
      const response = await editMovimiento(mov.id, mov);
      if (response.status === 200) {
        const updatedMovimientos = allMovimientos.map(m => m.id === mov.id ? mov : m);
        setAllMovimientos(updatedMovimientos);
        setFilteredMovimientos(updatedMovimientos);
        closeDetailModal();
      } else {
        toast.error('No se pudo dar de alta el movimiento');
      }
    } catch (error) {
      toast.error('Error al procesar la operación');
    }
  }

  // Confirmar eliminación
  const confirmDelete = (movimiento) => {
    setConfirmationModal({
      visible: true,
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el movimiento "${movimiento?.descripcion}" por $${Math.abs(movimiento?.monto).toFixed(2)}? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const response = await deleteMovimiento(movimiento.id);
          if (response.status === 200) {
            setAllMovimientos(allMovimientos.filter(m => m.id !== movimiento.id));
            closeDetailModal();
            toast.success("Movimiento eliminado correctamente", "success");
          }
        } catch (error) {
          console.error("Error al eliminar movimiento:", error);
          toast.error("Error al eliminar movimiento", "error");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-naranja flex items-center">
            <span className="mr-2">💰</span> Gestión de Caja
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los movimientos de entrada y salida de dinero
          </p>
        </div>

        {/* Selector de vista (B/N/Todos) */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          {/* Total de la caja */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <h2 className="text-black text-xl font-semibold">Total en Caja:</h2>
            <span className={`text-xl font-bold ${total >= 0 ? "text-green-700" : "text-red-700"}`}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mensaje de carga */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-naranja border-t-transparent rounded-full"></div>
            <p className="text-gray-600 text-lg">Cargando movimientos...</p>
          </div>
        ) : (
          <>
            {/* Tabla de movimientos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Movimientos</h2>
                <button
                  onClick={() => openModal()}
                  className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                >
                  Nuevo Movimiento
                </button>
              </div>

              {/* FilterSection moved here - now above the table */}
              <FilterSection
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filtros={filtros}
                handleFilterChange={handleFilterChange}
                resetFiltros={resetFiltros}
                movimientos={allMovimientos}
                mediosPago={mediosPago} // <-- pass mediosPago from API here
              />

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-3 text-gray-700 font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-gray-700 font-semibold">Hora</th>
                      <th className="px-4 py-3 text-gray-700 font-semibold">Descripción</th>
                      <th className="px-4 py-3 text-gray-700 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovimientos.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-gray-500">
                          No hay movimientos que coincidan con los filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredMovimientos.map((mov, index) => (
                        <tr
                          key={index}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${index !== filteredMovimientos.length - 1 ? "border-b border-gray-200" : ""
                            } ${mov.baja ? "bg-gray-50 text-gray-400 line-through" :
                              mov.monto >= 0 ? "bg-green-50" : "bg-red-50"}`}
                          onClick={() => openDetailModal(mov)}
                        >
                          <td className="px-4 py-3 text-gray-800">
                            {formatDate(mov.fecha)}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {mov.hora || (mov.fecha && mov.fecha.includes("T") ? mov.fecha.split("T")[1]?.slice(0, 5) : "")}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {mov.descripcion}
                          </td>
                          <td className={`px-4 py-3 font-medium text-right ${mov.baja ? "text-gray-400" :
                            mov.monto >= 0 ? "text-green-700" : "text-red-700"
                            }`}>
                            ${mov.monto.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contador de movimientos mostrados */}
            {!isLoading && allMovimientos.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Mostrando {filteredMovimientos.length} de {allMovimientos.length} movimientos
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para agregar/editar movimiento */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" 
          onClick={closeModal} // Close when clicking the overlay
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {currentMovimiento ? "Editar Movimiento" : "Nuevo Movimiento"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={saveMovimiento} className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 focus:ring-naranja">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Añade una descripción"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monto"
                    value={formData.monto}
                    onChange={handleInputChange}
                    placeholder="Positivo para entrada, negativo para salida"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medio de Pago
                  </label>
                  <select
                    name="medioPagoId"
                    value={formData.medioPagoId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-transparent text-gray-900"
                    required
                  >
                    <option value="">Seleccione un medio de pago</option>
                    {mediosPago.map(medio => (
                      <option key={medio.id} value={medio.id}>
                        {medio.nombre} - {medio.ref}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Campo tag oculto */}
                <input
                  type="hidden"
                  name="tag"
                  value={formData.tag}
                />
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveMovimiento}
                  className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del movimiento */}
      {showDetailModal && currentMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 " onClick={closeDetailModal}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Movimiento
              </h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha y hora</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(currentMovimiento.fecha)} {currentMovimiento.hora || (currentMovimiento.fecha?.includes("T") ? currentMovimiento.fecha.split("T")[1]?.slice(0, 5) : "")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Empleado</p>
                  <p className="font-medium text-gray-800">
                    {currentMovimiento.empleado?.nombre || "No disponible"}
                  </p>
                </div>

              </div>
              <div className="gap-4 mb-4">
                <p className="text-sm text-gray-500">Medio de pago</p>
                <p className="font-medium text-gray-800">
                  {currentMovimiento.medioPago.nombre || "No disponible"} 
                  {currentMovimiento.medioPago.ref != '-' ? ` - ${currentMovimiento.medioPago.ref}` : ''} 
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-md mt-1">
                  {currentMovimiento.descripcion || "No disponible"}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Monto</p>
                <p className={`font-bold text-lg ${currentMovimiento.monto >= 0 ? "text-green-700" : "text-red-700"
                  }`}>
                  ${currentMovimiento.monto.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => confirmDelete(currentMovimiento)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                {currentMovimiento.baja ? (
                  <button
                    onClick={() => {
                      handleAltaMov(currentMovimiento)
                    }}
                    className="px-4 py-2 bg-blue-400 text-gray-700 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <CircleFadingArrowUp size={16} />
                    Dar de alta
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openModal(currentMovimiento);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        visible={confirmationModal.visible}
        onClose={() => setConfirmationModal({ ...confirmationModal, visible: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText || 'Confirmar'}
        cancelText={confirmationModal.cancelText || 'Cancelar'}
      />
    </div>
  );
}

export default Caja;