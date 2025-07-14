import { useState, useRef, useEffect } from "react";
import { Coffee, Edit, Plus, Trash2, Upload, Pencil } from "lucide-react";
import { useAuth } from "../context/authContext";
import socket from "../config/socket";
import PedidoResDTO from "../models/pedidoResDTO";
import reservaResDTO from "../models/reservaResDTO";
import { toast } from "react-toastify";

import {
  getMesasLayout,
  getFloorLayout,
  deleteSelectedMesa,
  updateMesaState,
  saveFloorPlan,
  updateMesa,
  saveMesa,
  submitPedido,
  updatePedido,
  submitReserva,
  updatePedidoEstado,
  migrarMesa,
  saveNewFloor,
  deleteFloor,
} from "../services/layoutHelper";
import { patchReserva } from "../services/reservaHelper";

// Import modularized components
import LayoutCanvas from "../components/layout/layoutCanvas";
import MesaEditModal from "../components/layout/MesaEditModal";
import MesaStatusModal from "../components/layout/MesaStatusModal";
import OrderModal from "../components/layout/OrderModal";
import FormularioReserva from "../components/formularioReserva";
import PagoModal from "../components/layout/PagoModal";
import MesaDetailsPanel from "../components/layout/MesaDetailsPanel";
import MesaEditorPanel from "../components/layout/MesaEditorPanel";
import UnsavedChangesModal from "../components/layout/UnsavedChangesModal";
import MesaMigrationModal from "../components/layout/MesaMigrationModal";
import AddFloorModal from "../components/layout/AddFloorModal";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import LoadingScreen from "../components/utils/LoadingScreen";

// Componente principal de gestión de mesas
const TableManager = () => {
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [reservaModalOpen, setReservaModalOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [efectuarPagoModal, setEfectuarPagoModal] = useState(false);
  const [addFloorModalOpen, setAddFloorModalOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [floorPlans, setFloorPlans] = useState([
    { lines: [], pisoId: 1, descripcion: "Principal" },
  ]);
  const [currentFloor, setCurrentFloor] = useState(floorPlans[0]);
  const [originalMesas, setOriginalMesas] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [exitAction, setExitAction] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showReservaWarning, setShowReservaWarning] = useState(false);
  const [pendingEstadoChange, setPendingEstadoChange] = useState(null);
  const [newPedidoActivity, setNewPedidoActivity] = useState(false);
  const [newReservaActivity, setNewReservaActivity] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [originalFloorPlans, setOriginalFloorPlans] = useState([
    { lines: [], pisoId: 1, descripcion: "Principal" },
  ]);
  const addSectionButtonRef = useRef(null);
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  });

  // State for reservation conflict alert
  const [reservationConflictModal, setReservationConflictModal] = useState({
    visible: false,
    reservation: null,
    mesa: null,
  });

  // State to track dismissed conflicts to prevent them from showing again
  const [dismissedConflicts, setDismissedConflicts] = useState(new Set());

  // State to track manually confirmed occupations to prevent conflict notifications
  const [manuallyConfirmedOccupations, setManuallyConfirmedOccupations] = useState(new Set());

  useEffect(() => {
    // Nuevo pedido recibido
    socket.on("pedido:nuevo", (pedidoNuevo) => {
      toast.info("Nuevo pedido recibido");
      setNewPedidoActivity(true);
      const newPedido = PedidoResDTO.fromJson(pedidoNuevo);
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id === newPedido.mesa.id
            ? {
                ...mesa,
                pedido: [
                  newPedido,
                  ...(Array.isArray(mesa.pedido) ? mesa.pedido : []),
                ],
                estado: "ocupada",
              }
            : mesa
        )
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === newPedido.mesa.id) {
          return {
            ...prevSelectedMesa,
            pedido: [
              newPedido,
              ...(Array.isArray(prevSelectedMesa.pedido)
                ? prevSelectedMesa.pedido
                : []),
            ],
            estado: "ocupada",
          };
        }
        return prevSelectedMesa;
      });
    });

    // Nueva reserva recibida
    socket.on("reserva:nueva", (nuevaReserva) => {
      
      if (!nuevaReserva) return;
      const reservaNueva = reservaResDTO.fromJson(nuevaReserva);
      const today = new Date();
      const reservaDate = reservaNueva.fecha;
      
      // Parse the reserva date (assuming format DD-MM-YYYY)
      const [day, month, year] = reservaDate.split('-').map(Number);
      const reservaDateObj = new Date(year, month - 1, day); // month is 0-indexed
      
      // Compare dates by checking if they're the same day
      const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const reservaDateString = reservaDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (todayDateString == reservaDateString && nuevaReserva.estado == 'aceptada') {
        toast.info("Nueva reserva recibida");
        toast.success(`Reserva para ${reservaNueva.clienteNombre} en Mesa #${reservaNueva.mesa.numero}`);
        setNewReservaActivity(true);
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === reservaNueva.mesa.id
              ? {
                  ...mesa,
                  reserva: [
                    reservaNueva,
                    ...(Array.isArray(mesa.reserva) ? mesa.reserva : []),
                  ].sort((a, b) => {
                    const fechaDiff =
                      a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0;
                    if (fechaDiff !== 0) return fechaDiff;
                    return a.hora.localeCompare(b.hora);
                  }),
                  // Si la reserva es para hoy y dentro de 2 horas, poner estado ocupada
                  ...(reservaNueva.fecha ===
                    new Date().toISOString().split("T")[0] &&
                    (() => {
                      const [hours, minutes] = reservaNueva.hora
                        .split(":")
                        .map(Number);
                      const reservaTime = new Date();
                      reservaTime.setHours(hours, minutes, 0, 0);
                      const now = new Date();
                      const timeDifference =
                        (reservaTime - now) / (1000 * 60 * 60);
                      if (timeDifference > 0 && timeDifference <= 2) {
                        return { estado: "ocupada" };
                      }
                      return {};
                    })()),
                }
              : mesa
          )
        );
        setSelectedMesa((prevSelectedMesa) => {
          if (
            prevSelectedMesa &&
            prevSelectedMesa.id === reservaNueva.mesa.id
          ) {
            return {
              ...prevSelectedMesa,
              reserva: [
                reservaNueva,
                ...(Array.isArray(prevSelectedMesa.reserva)
                  ? prevSelectedMesa.reserva
                  : []),
              ].sort((a, b) => {
                const fechaDiff =
                  a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0;
                if (fechaDiff !== 0) return fechaDiff;
                return a.hora.localeCompare(b.hora);
              }),
              ...(reservaNueva.fecha ===
                new Date().toISOString().split("T")[0] &&
                (() => {
                  const [hours, minutes] = reservaNueva.hora
                    .split(":")
                    .map(Number);
                  const reservaTime = new Date();
                  reservaTime.setHours(hours, minutes, 0, 0);
                  const now = new Date();
                  const timeDifference = (reservaTime - now) / (1000 * 60 * 60);
                  if (timeDifference > 0 && timeDifference <= 2) {
                    return { estado: "ocupada" };
                  }
                  return {};
                })()),
            };
          }
          return prevSelectedMesa;
        });
      }
    });

    // Estado de pedido actualizado
    socket.on("pedido:estadoActualizado", ({ pedidoId, mesaId, estado }) => {
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id === mesaId
            ? {
                ...mesa,
                pedido: (Array.isArray(mesa.pedido) ? mesa.pedido : []).map(
                  (p) => (p.id === pedidoId ? { ...p, estado: estado } : p)
                ),
                // Mantener la mesa ocupada si hay algún pedido pendiente o confirmado
                estado:
                  Array.isArray(mesa.pedido) &&
                  mesa.pedido.some((p) =>
                    ["pendiente", "confirmado"].includes(p.estado)
                  )
                    ? "ocupada"
                    : mesa.estado,
              }
            : mesa
        )
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === mesaId) {
          return {
            ...prevSelectedMesa,
            pedido: (Array.isArray(prevSelectedMesa.pedido)
              ? prevSelectedMesa.pedido
              : []
            ).map((p) => (p.id === pedidoId ? { ...p, estado: estado } : p)),
          };
        }
        return prevSelectedMesa;
      });
    });

    // Estado de mesa actualizado
    socket.on("mesa:estadoActualizado", ({ mesaId, estado }) => {
      toast.info(`Mesa #${mesaId} ahora está ${estado}`); //!debugging
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id === mesaId ? { ...mesa, estado: estado } : mesa
        )
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === mesaId) {
          return { ...prevSelectedMesa, estado: estado };
        }
        return prevSelectedMesa;
      });
    });

    socket.on("mesa:actualizada", ({ mesaId, mesa }) => {
      // Actualizar la mesa en el estado
      setMesas((prevMesas) =>
        prevMesas.map((m) => (m.id === mesaId ? { ...m, ...mesa } : m))
      );
      // Si la mesa seleccionada es la que se actualizó, actualizarla también
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === mesaId) {
          return { ...prevSelectedMesa, ...mesa };
        }
        return prevSelectedMesa;
      });
    });

    socket.on("mesa:creada", (mesaNueva) => {
      // mesaNueva debe ser un objeto MesaResDTO
      const mesaObj = mesaNueva; // Aquí deberías convertir a MesaResDTO si es necesario
      setMesas((prevMesas) => [...prevMesas, mesaObj]);
      setSelectedMesa(mesaObj);
      setHasChanges(true);
      toast.success(`Mesa #${mesaObj.numero} creada correctamente`);
    });

    socket.on("mesa:eliminada", (mesaId) => {
      setMesas((prevMesas) => prevMesas.filter((mesa) => mesa.id !== mesaId));
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === mesaId) {
          return null; // Limpiar la selección si se eliminó la mesa seleccionada
        }
        return prevSelectedMesa;
      });
      toast.success(`Mesa eliminada correctamente`);
    });

    // Pedido eliminado
    socket.on("pedido:eliminado", (pedidoId) => {
      setMesas((prevMesas) =>
        prevMesas.map((mesa) => ({
          ...mesa,
          pedido: Array.isArray(mesa.pedido)
            ? mesa.pedido.filter((pedido) => pedido.id !== pedidoId)
            : mesa.pedido,
        }))
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa) {
          return {
            ...prevSelectedMesa,
            pedido: Array.isArray(prevSelectedMesa.pedido)
              ? prevSelectedMesa.pedido.filter(
                  (pedido) => pedido.id !== pedidoId
                )
              : prevSelectedMesa.pedido,
          };
        }
        return prevSelectedMesa;
      });
    });

    // Nuevo: Pedido modificado (mesa, items, etc)
    socket.on("pedido:actualizado", (pedidoActualizado) => {
      // pedidoActualizado debe ser un PedidoResDTO
      const pedidoObj = PedidoResDTO.fromJson(pedidoActualizado);

      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id == pedidoObj.mesa.id
            ? {
                ...mesa,
                pedido: Array.isArray(mesa.pedido)
                  ? mesa.pedido.map((p) =>
                      p.id === pedidoObj.id ? pedidoObj : p
                    )
                  : [pedidoObj],
              }
            : mesa
        )
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id == pedidoObj.mesa.id) {
          return {
            ...prevSelectedMesa,
            pedido: Array.isArray(prevSelectedMesa.pedido)
              ? prevSelectedMesa.pedido.map((p) =>
                  p.id === pedidoObj.id ? pedidoObj : p
                )
              : [pedidoObj],
          };
        }
        return prevSelectedMesa;
      });
    });

    // Nuevo: Reserva modificada (fecha/hora, etc)
    socket.on("reserva:actualizada", (reservaActualizada) => {
      // reservaActualizada debe ser un reservaResDTO
      const reservaObj = reservaResDTO.fromJson(reservaActualizada);
      setMesas((prevMesas) =>
        prevMesas.map((mesa) =>
          mesa.id === reservaObj.mesa.id
            ? {
                ...mesa,
                reserva: Array.isArray(mesa.reserva)
                  ? mesa.reserva.map((r) =>
                      r.id === reservaObj.id ? reservaObj : r
                    )
                  : [reservaObj],
              }
            : mesa
        )
      );
      setSelectedMesa((prevSelectedMesa) => {
        if (prevSelectedMesa && prevSelectedMesa.id === reservaObj.mesa.id) {
          return {
            ...prevSelectedMesa,
            reserva: Array.isArray(prevSelectedMesa.reserva)
              ? prevSelectedMesa.reserva.map((r) =>
                  r.id === reservaObj.id ? reservaObj : r
                )
              : [reservaObj],
          };
        }
        return prevSelectedMesa;
      });
    });
 

    return () => {
      socket.off("pedido:nuevo");
      socket.off("reserva:nueva");
      socket.off("pedido:estadoActualizado");
      socket.off("mesa:estadoActualizado");
      socket.off("mesa:actualizada");
      socket.off("mesa:creada");
      socket.off("mesa:eliminada");
      socket.off("pedido:eliminado");
      socket.off("pedido:actualizado");
      socket.off("reserva:actualizada");
    };
  }, []);

  // Function to check reservations every 15 minutes
  useEffect(() => {
    const checkReservations = () => {
      const now = new Date();
      const currentTime = now.getTime();

      // Helper function to parse reservation date and time
      const parseReservationDateTime = (reserva) => {
        try {
          // Parse date in DD-MM-YYYY format
          const [day, month, year] = reserva.fecha.split('-').map(Number);
          // Parse time in HH:MM format
          const [hours, minutes] = reserva.hora.split(':').map(Number);
          
          return new Date(year, month - 1, day, hours, minutes);
        } catch (error) {
          console.error('Error parsing reservation date/time:', error);
          return null;
        }
      };

      let hasExpiredReservations = false;
      let conflictReservation = null;
      let conflictMesa = null;

      // Check all mesas for reservations
      mesas.forEach(mesa => {
        if (mesa.reserva && Array.isArray(mesa.reserva)) {
          mesa.reserva.forEach(reserva => {
            const reservationDateTime = parseReservationDateTime(reserva);
            
            if (!reservationDateTime) return;

            const timeDiffMinutes = (reservationDateTime.getTime() - currentTime) / (1000 * 60);
            
            // Check if reservation is overdue (past the scheduled time + 15 min tolerance)
            if (timeDiffMinutes < -15) {
              hasExpiredReservations = true;
            }
            // Check if reservation is due in 15 minutes and mesa is occupied
            else if (timeDiffMinutes <= 15 && timeDiffMinutes > 0 && mesa.estado === 'ocupada' && !conflictReservation) {
              // Create a unique identifier for this conflict
              const conflictId = `${reserva.id}-${mesa.id}-${Math.floor(timeDiffMinutes)}`;
              
              // Create identifier for manually confirmed occupation
              const occupationId = `${mesa.id}-${reserva.id}`;
              
              // Only show if this specific conflict hasn't been dismissed and hasn't been manually confirmed
              if (!dismissedConflicts.has(conflictId) && !manuallyConfirmedOccupations.has(occupationId)) {
                conflictReservation = reserva;
                conflictMesa = mesa;
              }
            }
          });
        }
      });

      // Remove expired reservations if any were found
      if (hasExpiredReservations) {
        setMesas(prevMesas => 
          prevMesas.map(mesa => ({
            ...mesa,
            reserva: mesa.reserva.filter(reserva => {
              const rDateTime = parseReservationDateTime(reserva);
              return rDateTime && (rDateTime.getTime() - currentTime) >= 0;
            })
          }))
        );

        // Also update selected mesa if it has expired reservations
        if (selectedMesa && selectedMesa.reserva) {
          setSelectedMesa(prevSelected => ({
            ...prevSelected,
            reserva: prevSelected.reserva.filter(reserva => {
              const rDateTime = parseReservationDateTime(reserva);
              return rDateTime && (rDateTime.getTime() - currentTime) >= 0;
            })
          }));
        }
      }

      // Show conflict modal for the first conflict found
      if (conflictReservation && conflictMesa) {
        setReservationConflictModal({
          visible: true,
          reservation: conflictReservation,
          mesa: conflictMesa,
        });
      }
    };

    // Run immediately
    checkReservations();

    // Set up interval to run every 15 minutes (900000 milliseconds)
    const interval = setInterval(checkReservations, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mesas, dismissedConflicts, manuallyConfirmedOccupations /*, selectedMesa*/]);

  // Handler for reservation conflict resolution
  const handleReservationConflict = async (action, newMesaId = null) => {
    const { reservation, mesa } = reservationConflictModal;
    
    // Handle dismissing the conflict (leave it be)
    if (action === 'dismiss') {
      const now = new Date();
      const reservationDateTime = (() => {
        try {
          const [day, month, year] = reservation.fecha.split('-').map(Number);
          const [hours, minutes] = reservation.hora.split(':').map(Number);
          return new Date(year, month - 1, day, hours, minutes);
        } catch (error) {
          return null;
        }
      })();
      
      if (reservationDateTime) {
        const timeDiffMinutes = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60);
        const conflictId = `${reservation.id}-${mesa.id}-${Math.floor(timeDiffMinutes)}`;
        
        // Add this conflict to the dismissed set
        setDismissedConflicts(prev => new Set([...prev, conflictId]));
      }
    }
    else if (action === 'change' && newMesaId) {
      try {
        // Find the new mesa
        const newMesa = mesas.find(m => m.id === newMesaId);
        if (!newMesa) {
          toast.error('Mesa no encontrada');
          return;
        }
        // Ensure day and month are always two digits (e.g., '09' for September)
        let [d, m, y] = reservation.fecha.split('-');
        d = d.padStart(2, '0');
        m = m.padStart(2, '0');
        y = y.padStart(4, '0');

        const fechaParsed = `${y}-${m}-${d}`
        // Update reservation with new mesa - API expects YYYY-MM-DD format
        const reservationForAPI = {
          ...reservation,
          mesa: {
            id: newMesaId
          },
          fecha: fechaParsed, // Use the parsed date (YYYY-MM-DD) for API
          hora: reservation.hora, // Keep the same time
        };
        console.log('Updating reservation:', reservationForAPI);

        const response = await patchReserva(reservation.id, reservationForAPI);
        await updateMesaState(newMesaId, "reservada");
        
        if (response && response.status === 200) {
          toast.info(`Reserva movida a Mesa ${newMesa.numero}`);
          
          // Create reservation object for frontend state (keep DD-MM-YYYY format)
          const updatedReservationForState = {
            ...reservation,
            mesa: {
              id: newMesaId,
              numero: newMesa.numero
            },
            // Keep the original date format (DD-MM-YYYY) for frontend display
            fecha: reservation.fecha,
            hora: reservation.hora,
          };
          
          // Update local state
          setMesas(prevMesas => 
            prevMesas.map(m => {
              if (m.id === mesa.id) {
                // Remove reservation from old mesa
                return {
                  ...m,
                  reserva: m.reserva.filter(r => r.id !== reservation.id)
                };
              } else if (m.id === newMesaId) {
                // Add reservation to new mesa
                const existingReservas = Array.isArray(m.reserva) ? m.reserva : [];
                return {
                  ...m,
                  reserva: [
                    ...existingReservas,
                    updatedReservationForState
                  ].sort((a, b) => {
                    const fechaDiff = a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0;
                    if (fechaDiff !== 0) return fechaDiff;
                    return a.hora.localeCompare(b.hora);
                  }),
                  estado: 'reservada',
                };
              }
              return m;
            })
          );
          
          // Also update selectedMesa if it's one of the affected mesas
          setSelectedMesa(prevSelectedMesa => {
            if (prevSelectedMesa) {
              if (prevSelectedMesa.id === mesa.id) {
                // Remove reservation from selected mesa if it's the old mesa
                return {
                  ...prevSelectedMesa,
                  reserva: prevSelectedMesa.reserva.filter(r => r.id !== reservation.id)
                };
              } else if (prevSelectedMesa.id === newMesaId) {
                // Add reservation to selected mesa if it's the new mesa
                const existingReservas = Array.isArray(prevSelectedMesa.reserva) ? prevSelectedMesa.reserva : [];
                return {
                  ...prevSelectedMesa,
                  reserva: [
                    ...existingReservas,
                    updatedReservationForState
                  ].sort((a, b) => {
                    const fechaDiff = a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0;
                    if (fechaDiff !== 0) return fechaDiff;
                    return a.hora.localeCompare(b.hora);
                  }),
                  estado: 'reservada',
                };
              }
            }
            return prevSelectedMesa;
          });
        } else {
          toast.error('Error al cambiar la mesa de la reserva');
        }
      } catch (error) {
        console.error('Error changing reservation mesa:', error);
        toast.error('Error al cambiar la mesa de la reserva');
      }
    }
    
    // Close modal
    setReservationConflictModal({
      visible: false,
      reservation: null,
      mesa: null,
    });
  };

  async function getMesas() {
    const mesas = await getMesasLayout(); //mesas desde la API
    if (mesas) {
      setMesas(mesas);
      setOriginalMesas(JSON.parse(JSON.stringify(mesas))); // para detectar cambios
      //setCurrentFloor(mesas.length > 0 ? mesas[0].piso : 1); // establecer el primer piso como actual
      localStorage.setItem("mesas", JSON.stringify(mesas)); // guardar en localStorage
    } else {
      //si falla tengo las del localStorage
      const storedMesas = localStorage.getItem("mesas");
      if (storedMesas) {
        setMesas(JSON.parse(storedMesas));
        setOriginalMesas(JSON.parse(JSON.stringify(JSON.parse(storedMesas)))); //  para detectar cambios
      }
    }
  }

  async function getLayout() {
    const response = await getFloorLayout(); //mesas desde la API
    if (response.status === 200 || response.status === 304) {
      const floorPlanData = response.floorPlan
        ? Array.isArray(response.floorPlan)
          ? response.floorPlan
          : [response.floorPlan]
        : [{ lines: [], pisoId: 1, descripcion: "Principal" }];

      setFloorPlans(floorPlanData);
      setOriginalFloorPlans(JSON.parse(JSON.stringify(floorPlanData)));
      setCurrentFloor(floorPlanData[0]);
    } else {
      setFloorPlans([{ lines: [], pisoId: 1, descripcion: "Principal" }]);
      setOriginalFloorPlans([
        { lines: [], pisoId: 1, descripcion: "Principal" },
      ]);
    }
  }

  useEffect(() => {
    // Cargar mesas desde API o localStorage
    getMesas();
    getLayout();
    setLoading(false);
  }, []);

  // Función para detectar cambios en las mesas
  const checkChanges = () => {
    // Check changes in mesas
    if (mesas.length !== originalMesas.length) return true;

    for (let i = 0; i < mesas.length; i++) {
      const mesa = mesas[i];
      const original = originalMesas.find((m) => m.id === mesa.id);

      if (!original) return true;

      // Comparar propiedades básicas
      if (mesa.numero !== original.numero) return true;
      if (mesa.estado !== original.estado) return true;
      if (mesa.piso !== original.piso) return true;

      // Comparar tamaño
      const mesaWidth = mesa.size?.width || mesa.width;
      const mesaHeight = mesa.size?.height || mesa.height;
      const originalWidth = original.size?.width || original.width;
      const originalHeight = original.size?.height || original.height;

      if (mesaWidth !== originalWidth || mesaHeight !== originalHeight)
        return true;

      // Comparar locación
      const mesaX = Array.isArray(mesa.locacion)
        ? mesa.locacion[0]
        : mesa.locacion?.x;
      const mesaY = Array.isArray(mesa.locacion)
        ? mesa.locacion[1]
        : mesa.locacion?.y;
      const originalX = Array.isArray(original.locacion)
        ? original.locacion[0]
        : original.locacion?.x;
      const originalY = Array.isArray(original.locacion)
        ? original.locacion[1]
        : original.locacion?.y;

      if (mesaX !== originalX || mesaY !== originalY) return true;
    }

    // Check changes in floor plans
    if (floorPlans.length !== originalFloorPlans.length) return true;

    for (let i = 0; i < floorPlans.length; i++) {
      const current = floorPlans[i];
      const original = originalFloorPlans[i];

      if (!current || !original) return true;
      if (!current.lines || !original.lines) return true;
      if (current.lines.length !== original.lines.length) return true;

      for (let j = 0; j < current.lines.length; j++) {
        const currentLine = current.lines[j];
        const originalLine = original.lines[j];

        if (
          currentLine.x1 !== originalLine.x1 ||
          currentLine.y1 !== originalLine.y1 ||
          currentLine.x2 !== originalLine.x2 ||
          currentLine.y2 !== originalLine.y2 ||
          currentLine.strokeWidth !== originalLine.strokeWidth
        ) {
          return true;
        }
      }
    }

    return false;
  };

  // useEffect para detectar cambios
  useEffect(() => {
    if (modoEdicion && originalMesas.length > 0) {
      setHasChanges(checkChanges());
    }
  }, [mesas, originalMesas, floorPlans, originalFloorPlans, modoEdicion]);

  // Filtrar mesas por piso actual
  const mesasActuales = mesas.filter(
    (mesa) => mesa?.pisoId === currentFloor?.pisoId
  );

  // Obtener el plan de fondo actual
  const currentFloorPlan = currentFloor || { lines: [] };

  const handleMoveMesa = (mesaId, newLocation) => {
    const updatedMesas = mesas.map((mesa) => {
      if (mesa.id === mesaId) {
        // Mantener todas las propiedades y solo actualizar la locación
        return {
          ...mesa,
          locacion: newLocation,
        };
      }
      return mesa;
    });

    // Actualizar el estado de mesas
    setMesas(updatedMesas);

    // Actualizar la mesa seleccionada si corresponde
    if (selectedMesa && selectedMesa.id === mesaId) {
      setSelectedMesa({
        ...selectedMesa,
        locacion: newLocation,
      });
    }
  };

  const handleSelectMesa = (mesa) => {
    if (!isEditingBackground) {
      setSelectedMesa(mesa);
    }
  };

  const handleOpenEditModal = (mesa) => {
    if (isEditingBackground) return;

    if (modoEdicion) {
      setSelectedMesa(mesa);
      setEditModalOpen(true);
    } else {
      setSelectedMesa(mesa);
      setStatusModalOpen(true);
    }
  };

  const handleMesaEdit = (editedMesa) => {
    // Buscar la mesa actual en el estado actual de mesas
    const currentMesa = mesas.find((m) => m.id === editedMesa.id);

    // Actualizar solo las propiedades modificadas, manteniendo las demás
    const updatedMesa = {
      ...currentMesa, // Mantener todas las propiedades actuales
      ...editedMesa, // Sobrescribir con las propiedades editadas
      // Asegurarnos de preservar la locación actual
      locacion: currentMesa.locacion,
    };

    // Si se han modificado propiedades específicas de tamaño, asegurarnos de mantenerlas
    if (editedMesa.size) {
      updatedMesa.size = {
        ...(currentMesa.size || {}),
        ...editedMesa.size,
      };
    }

    // Actualizar el estado de mesas
    const updatedMesas = mesas.map((mesa) =>
      mesa.id === updatedMesa.id ? updatedMesa : mesa
    );

    // Actualizar el estado
    setMesas(updatedMesas);

    // También actualizamos la mesa seleccionada para mantener todo sincronizado
    setSelectedMesa(updatedMesa);
  };

  const handleUpdateEstado = async (
    selectedMesa,
    nuevoEstado,
    bypassReservaCheck = false
  ) => {
    function hayReservaProxima(mesa) {
      const tiempoMinutos = 60; // Tiempo máximo para considerar una reserva próxima (1 hora)
      const ahora = new Date();
      return (
        mesa.reserva &&
        mesa.reserva.some((reserva) => {
          // reserva.fecha: 'dd/mm', reserva.hora: 'hh:mm'
          const [dia, mes, anio] = reserva.fecha.split("-").map(Number);
          const [hora, minuto] = reserva.hora.split(":").map(Number);

          // Construir la fecha completa de la reserva para este año
          const reservaDate = new Date(anio, mes - 1, dia, hora, minuto, 0, 0);

          // Verificar si la reserva es hoy
          if (
            reservaDate.getDate() !== ahora.getDate() ||
            reservaDate.getMonth() !== ahora.getMonth() ||
            reservaDate.getFullYear() !== ahora.getFullYear()
          ) {
            return false;
          }

          const diffMin = (reservaDate - ahora) / (1000 * 60);
          return diffMin > 0 && diffMin <= tiempoMinutos;
        })
      );
    }

    // Si la mesa está reservada y se intenta ocupar, mostrar advertencia (a menos que bypassReservaCheck sea true)
    if (
      !bypassReservaCheck &&
      selectedMesa.estado === "reservada" &&
      nuevoEstado === "ocupada"
    ) {
      if (hayReservaProxima(selectedMesa)) {
        setShowReservaWarning(true);
        setPendingEstadoChange({ mesa: selectedMesa, nuevoEstado });
        return selectedMesa.estado;
      }
    }

    // Si la mesa está ocupada y se intenta liberar, pero hay reserva próxima, pasar a reservada
    if (selectedMesa.estado === "ocupada" && nuevoEstado === "disponible") {
      const tienePedidoConfirmado = selectedMesa.pedido?.some(
        (pedido) => pedido.estado === "confirmado"
      );
      if (tienePedidoConfirmado) {
        // alert('Hay pedidos con pagos pendientes');
        toast.warning("Hay pedidos con pagos pendientes");
        return selectedMesa.estado;
      }
      const tienePedidoPendiente = selectedMesa.pedido?.some(
        (pedido) => pedido.estado === "pendiente"
      );
      if (tienePedidoPendiente) {
        // alert('Hay pedidos pendientes de confirmación');
        toast.warning("Hay pedidos pendientes de confirmación");
        return selectedMesa.estado;
      }
      if (hayReservaProxima(selectedMesa)) {
        nuevoEstado = "reservada";
      }
    }

    const estado = nuevoEstado;
    const response = await updateMesaState(selectedMesa.id, estado);

    setMesas(
      mesas.map((mesa) =>
        mesa.id === selectedMesa.id
          ? {
              ...mesa,
              estado: estado,
              ...(estado === "disponible" || estado === "reservada"
                ? { pedido: [] }
                : {}),
            }
          : mesa
      )
    );

    if (!modoEdicion) {
      localStorage.setItem(
        "mesas",
        JSON.stringify(
          mesas.map((mesa) =>
            mesa.id === selectedMesa.id
              ? {
                  ...mesa,
                  estado: estado,
                  ...(estado === "disponible" || estado === "reservada"
                    ? { pedido: [] }
                    : {}),
                }
              : mesa
          )
        )
      );
    }

    setSelectedMesa({
      ...selectedMesa,
      estado: estado,
      ...(estado === "disponible" || estado === "reservada"
        ? { pedido: [] }
        : {}),
    });
    return estado;
  };

  // Handler para confirmar ocupación de mesa reservada
  const handleConfirmReservaWarning = async () => {
    setShowReservaWarning(false);
    if (pendingEstadoChange) {
      // Track this as a manually confirmed occupation
      if (pendingEstadoChange.mesa.reserva && Array.isArray(pendingEstadoChange.mesa.reserva)) {
        pendingEstadoChange.mesa.reserva.forEach(reserva => {
          const occupationId = `${pendingEstadoChange.mesa.id}-${reserva.id}`;
          setManuallyConfirmedOccupations(prev => new Set([...prev, occupationId]));
        });
      }
      
      await handleUpdateEstado(
        pendingEstadoChange.mesa,
        pendingEstadoChange.nuevoEstado,
        true
      );
      setPendingEstadoChange(null);
    }
  };
  const handleCancelReservaWarning = () => {
    setShowReservaWarning(false);
    setPendingEstadoChange(null);
  };

  const handleUpdatePedidoEstado = (id, estado) => {
    updatePedidoEstado(id, estado);
  };

  const handleSubmitPedido = async (id, nuevoPedido) => {
    const response = await submitPedido(nuevoPedido);
    if (response.status === 200 || response.status === 201) {
      toast.success("Pedido enviado correctamente");
    }
  };

  const handleUpdatePedido = async (id, pedidoExistente) => {
    const response = await updatePedido(pedidoExistente);
    if (response.status === 200) {
      setOrderModalOpen(false);
      toast.success("Pedido enviado correctamente");
    } else {
      toast.error("Error al enviar el pedido");
    }
  };

  const handleSubmitReserva = async (nuevaReserva) => {
    const response = await submitReserva(nuevaReserva);
    if (response.status === 201) {
      setReservaModalOpen(false);
      toast.success("Reserva creada correctamente");
    }
  };

  const handleOpenOrderModal = (mesa, pedido) => {
    setSelectedMesa(mesa);
    setSelectedPedido(pedido);
    setOrderModalOpen(true);
  };

  const handleOpenReservaModal = (mesa) => {
    setSelectedMesa(mesa);
    setReservaModalOpen(true);
  };

  const handleOpenMigrationModal = (mesaId) => {
    const mesa = mesas.find((m) => m.id === mesaId);
    if (mesa) {
      setSelectedMesa(mesa);
      setMigrationModalOpen(true);
    }
  };

  const handleEfectuarPago = (pedidoId = null) => {
    setSelectedPedidoId(pedidoId);
    setEfectuarPagoModal(true);
  };

  const handleMigrarPedido = async (origenId, destinoId) => {
    const mesaOrigen = mesas.find((m) => m.id === origenId);
    const pedido = mesaOrigen?.pedido;

    if (!pedido) return;
    const response = await migrarMesa(origenId, destinoId);
    if (response.status === 200) {
      toast.success("Pedido migrado correctamente");
      setMesas(
        mesas.map((mesa) => {
          if (mesa.id === origenId) {
            return { ...mesa, pedido: [], estado: "disponible" };
          }
          if (mesa.id === destinoId) {
            return {
              ...mesa,
              pedido: [...(mesa.pedido || []), ...(pedido || [])],
              estado: "ocupada",
            };
          }
          return mesa;
        })
      );

      setSelectedMesa(null);
      setMigrationModalOpen(false);
    }
  };

  const handleAddMesa = async () => {
    const newId = Date.now().toString();
    const newMesa = {
      id: newId,
      numero: (
        Math.max(0, ...mesas.map((m) => Number(m.numero) || 0)) + 1
      ).toString(),
      estado: "disponible",
      locacion: { x: 150, y: 150 },
      size: { width: 80, height: 80 },
      pisoId: currentFloor?.pisoId,
    };
    setHasChanges(true);
    setMesas([...mesas, newMesa]);
    setSelectedMesa(newMesa);
  };

  const handleDeleteMesa = () => {
    if (!selectedMesa) return;
    if (selectedMesa.id < 10000000) {
      setConfirmationModal({
        visible: true,
        title: "Confirmar Eliminación",
        message: `¿Está seguro que desea eliminar la Mesa #${
          selectedMesa.numero || selectedMesa.id
        }? Esta acción no se puede deshacer y podría afectar las reservas y pedidos asociados.`,
        type: "danger",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        onConfirm: async () => {
          const response = await deleteSelectedMesa(selectedMesa.id);
          if (response.status === 200) {
            setMesas(mesas.filter((m) => m.id !== selectedMesa.id));
            setSelectedMesa(null);
            toast.success("Mesa eliminada correctamente");
          }
        },
      });
    } else {
      //nunca se guardo
      setMesas(mesas.filter((m) => m.id !== selectedMesa.id));
      setSelectedMesa(null);
    }
  };

  const handleCancelDeleteMesa = () => {
    setMesaToDelete(null);
    setDeleteConfirmModalOpen(false);
  };

  const handleToggleBackgroundEditor = () => {
    setIsEditingBackground(!isEditingBackground);
    setSelectedMesa(null);
  };

  const handleSaveBackground = async (lines) => {
    setIsEditingBackground(false);

    const response = await saveFloorPlan(lines, currentFloor?.pisoId);
    if (response.status === 200 || response.status === 201) {
      const updatedFloorPlans = floorPlans.map((floor) =>
        floor?.pisoId === currentFloor?.pisoId
          ? { ...floor, lines: lines }
          : floor
      );
      setFloorPlans(updatedFloorPlans);
      //setOriginalFloorPlans(JSON.parse(JSON.stringify(updatedFloorPlans)));
      setHasChanges(true);
      toast.success("Fondo guardado correctamente");
    } else {
      toast.error("Error al guardar el fondo");
    }
  };

  const handleCancelBackgroundEdit = () => {
    setIsEditingBackground(false);
  };

  const handleAddFloor = () => {
    setAddFloorModalOpen(true);
  };

  const handleAddFloorConfirm = async (descripcion) => {
    const response = await saveNewFloor(descripcion);
    if (response && (response?.status === 200 || response?.status === 201)) {
      const newFloor = {
        lines: null,
        pisoId: response.data?.id,
        descripcion: response.data?.descripcion,
      };
      setFloorPlans([...floorPlans, newFloor]);
      setCurrentFloor(newFloor);
      setHasChanges(true); // //!todo: ver que esto funcione -----------------------------------------------------------------------------------------------------------
      setAddFloorModalOpen(false);
      toast.success("Nueva sección agregada correctamente");
    } else {
      toast.error("Error al agregar nueva sección");
    }
  };

  const handleDeleteFloor = async () => {
    try {
      if (floorPlans.length > 1) {
        const tablesInCurrentFloor = mesas.filter(
          (mesa) => mesa?.pisoId === currentFloor?.pisoId
        );
        if (tablesInCurrentFloor.length > 0) {
          toast.error(
            `No se puede eliminar la sección ${currentFloor.descripcion}. Esta sección tiene mesas asociadas.`
          );
          return;
        }
        const response = await deleteFloor(currentFloor.pisoId);
        if (response.status === 200) {
          const remainingFloors = floorPlans.filter(
            (f) => f?.pisoId !== currentFloor?.pisoId
          );
          setFloorPlans(remainingFloors);

          // Switch to the first remaining floor
          if (remainingFloors.length > 0) {
            setCurrentFloor(remainingFloors[0]);
          }

          setHasChanges(true);
          toast.success("Sección eliminada correctamente");
        } else {
          toast.error("Error al eliminar la sección: " + response.message);
        }
      }
    } catch (error) {
      console.error("Error al eliminar la sección:", error);
      toast.error("Error al eliminar la sección: " + error.message);
    }
  };

  const handleSaveLayout = async () => {
    try {
      const newMesas = mesas.filter(
        (mesa) =>
          !originalMesas.some((originalMesa) => originalMesa.id === mesa.id)
      );

      const updatedMesas = mesas.filter((mesa) =>
        originalMesas.some(
          (originalMesa) =>
            originalMesa.id === mesa.id &&
            JSON.stringify(originalMesa) !== JSON.stringify(mesa)
        )
      );

      let allSuccessful = true;

      if (newMesas.length > 0) {
        const newResponses = await Promise.all(
          newMesas.map((mesa) => saveMesa(mesa))
        );
        allSuccessful =
          allSuccessful &&
          newResponses.every(
            (response) => response.status === 200 || response.status === 201
          );
        // Update mesa.id with the id from response.data if successful
        newResponses.forEach((response, idx) => {
          if (
            (response.status === 200 || response.status === 201) &&
            response.data &&
            response.data.id
          ) {
            // Find the index of the mesa in the mesas array and update its id
            const oldId = newMesas[idx].id;
            const newId = response.data.id;
            setMesas((prevMesas) =>
              prevMesas.map((m) => (m.id === oldId ? { ...m, id: newId } : m))
            );
          }
        });
      }

      if (updatedMesas.length > 0) {
        const updateResponses = await Promise.all(
          updatedMesas.map((mesa) => updateMesa(mesa.id, mesa))
        );
        allSuccessful =
          allSuccessful &&
          updateResponses.every(
            (response) => response.status === 200 || response.status === 204
          );
      }

      // for (let i = 0; i < floorPlans.length; i++) {
      //   if (JSON.stringify(floorPlans[i]) !== JSON.stringify(originalFloorPlans[i])) {
      //     const floorPlan = floorPlans[i];
      //     const response = await saveFloorPlan(
      //       floorPlan.lines,
      //       //floorPlan.piso,
      //       floorPlan.description
      //     );
      //     allSuccessful = allSuccessful && (response.status === 200 || response.status === 201);
      //   }
      // }

      if (allSuccessful) {
        localStorage.setItem("mesas", JSON.stringify(mesas));
        setOriginalMesas(JSON.parse(JSON.stringify(mesas)));
        setOriginalFloorPlans(JSON.parse(JSON.stringify(floorPlans)));
        setHasChanges(false);
        toast.success("Layout guardado correctamente");
      } else {
        toast.error(
          "Error al guardar el layout. Algunos cambios pueden no haberse guardado."
        );
      }
    } catch (error) {
      console.error("Error al guardar el layout:", error);
      toast.error("Error al guardar el layout: " + error.message);
    }
    setModoEdicion(false);
    setSelectedMesa(null);
    setIsEditingBackground(false);
  };

  const handleToggleMode = () => {
    if (modoEdicion && hasChanges) {
      setUnsavedChangesModalOpen(true);
      setExitAction(() => () => {
        setModoEdicion(false);
        setMesas(JSON.parse(JSON.stringify(originalMesas)));
        setFloorPlans(JSON.parse(JSON.stringify(originalFloorPlans)));
        setHasChanges(false);
        setSelectedMesa(null);
        setIsEditingBackground(false);
      });
    } else {
      setModoEdicion(!modoEdicion);
      if (modoEdicion) {
        setIsEditingBackground(false);
      }
    }
  };

  const handleUnsavedChangesCancel = () => {
    setUnsavedChangesModalOpen(false);
    setExitAction(null);
  };

  const handleUnsavedChangesConfirm = () => {
    setUnsavedChangesModalOpen(false);
    if (exitAction) {
      exitAction();
      setExitAction(null);
    }
  };

  const handleChangeFloor = (newFloorId) => {
    const floorObject = floorPlans.find((floor) => floor?.pisoId === newFloorId);
    if (floorObject) {
      setCurrentFloor(floorObject);
      setSelectedMesa(null);
      setIsEditingBackground(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Layout"
        subtitle="Cargando distribución del local..."
      />
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 p-4 h-screen flex flex-col">
      {/* Header - removed gradients */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coffee size={20} className="text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Gestión de Mesas
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Floor selector */}
                <div
                  className={`flex items-center bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 ${
                    isEditingBackground ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="mr-3 text-sm font-medium text-gray-300">
                    Sección:
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={currentFloor?.pisoId || 1}
                      onChange={(e) =>
                        !isEditingBackground &&
                        handleChangeFloor(parseInt(e.target.value))
                      }
                      disabled={isEditingBackground}
                      className={`border text-white px-3 py-1 rounded-md text-sm focus:outline-none ${
                        isEditingBackground
                          ? "bg-gray-500 border-gray-400 cursor-not-allowed text-gray-400"
                          : "bg-gray-600 border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    >
                      {floorPlans.map((floor, index) => (
                        <option key={index} value={floor?.pisoId}>
                          {floor.descripcion || `Piso ${floor?.pisoId}`}
                        </option>
                      ))}
                    </select>
                    {modoEdicion && (
                      <div
                        className={`flex items-center gap-1 ${
                          isEditingBackground
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <button
                          ref={addSectionButtonRef}
                          onClick={
                            !isEditingBackground ? handleAddFloor : undefined
                          }
                          disabled={isEditingBackground}
                          className={`rounded-md p-1.5 transition-colors duration-200 ${
                            isEditingBackground
                              ? "bg-gray-500 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                          title={
                            isEditingBackground
                              ? "No disponible durante edición de fondo"
                              : "Añadir piso"
                          }
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={
                            !isEditingBackground ? handleDeleteFloor : undefined
                          }
                          disabled={
                            floorPlans.length <= 1 || isEditingBackground
                          }
                          className={`p-1.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-white ${
                            floorPlans.length > 1 && !isEditingBackground
                              ? "bg-red-600 hover:bg-red-500"
                              : "bg-gray-500 cursor-not-allowed opacity-50 text-gray-400"
                          }`}
                          title={
                            isEditingBackground
                              ? "No disponible durante edición de fondo"
                              : "Eliminar piso"
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* ABM de mesas */}
                {modoEdicion && (
                  <div
                    className={`flex items-center bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 ${
                      isEditingBackground ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="mr-3 text-sm font-medium text-gray-300">
                      Mesa
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 ${
                          isEditingBackground ? "pointer-events-none" : ""
                        }`}
                      >
                        <button
                          onClick={
                            !isEditingBackground ? handleAddMesa : undefined
                          }
                          disabled={isEditingBackground}
                          className={`rounded-md p-1.5 transition-colors duration-200 ${
                            isEditingBackground
                              ? "bg-gray-500 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                          title={
                            isEditingBackground
                              ? "No disponible durante edición de fondo"
                              : "Añadir mesa"
                          }
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={
                            !isEditingBackground ? handleDeleteMesa : undefined
                          }
                          disabled={!selectedMesa || isEditingBackground}
                          className={`p-1.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-white ${
                            selectedMesa && !isEditingBackground
                              ? "bg-red-600 hover:bg-red-500"
                              : "bg-gray-500 cursor-not-allowed opacity-50 text-gray-400"
                          }`}
                          title={
                            isEditingBackground
                              ? "No disponible durante edición de fondo"
                              : "Eliminar mesa"
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode toggle */}
              {user && user.cargo === "admin" && !modoEdicion && (
                <button
                  onClick={handleToggleMode}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    modoEdicion
                      ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  <Edit size={16} />
                  {modoEdicion ? "Modo Empleado" : "Modo Edición"}
                </button>
              )}

              {/* Edit controls */}
              {modoEdicion && !isEditingBackground && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBackgroundEditor}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      isEditingBackground
                        ? "bg-purple-600 hover:bg-purple-500"
                        : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">
                      {isEditingBackground
                        ? "Cancelar Edición"
                        : "Editar Fondo"}
                    </span>
                  </button>

                  <button
                    onClick={handleToggleMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-red-600 hover:bg-red-500`}
                  >
                    <span className="hidden sm:inline">Cancelar</span>
                  </button>

                  <button
                    onClick={handleSaveLayout}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      hasChanges
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-gray-600 cursor-not-allowed opacity-50"
                    }`}
                    disabled={!hasChanges}
                  >
                    <Upload size={16} />
                    <span className="hidden sm:inline">Guardar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          {/* Canvas section */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[calc(100vh-200px)]">
                <LayoutCanvas
                  floorPlan={currentFloorPlan}
                  mesas={mesasActuales}
                  onMoveMesa={handleMoveMesa}
                  onSelectMesa={handleSelectMesa}
                  onOpenEditModal={handleOpenEditModal}
                  interactivo={modoEdicion && !isEditingBackground}
                  selectedMesaId={selectedMesa?.id}
                  user={user}
                  isEditingBackground={isEditingBackground}
                  onSaveBackground={handleSaveBackground}
                  onCancelBackgroundEdit={handleCancelBackgroundEdit}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-96 mt-6 xl:mt-0">
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden h-full">
              {modoEdicion && !isEditingBackground ? (
                <MesaEditorPanel
                  mesa={selectedMesa}
                  onMesaEdit={handleMesaEdit}
                  isEditingBackground={isEditingBackground}
                />
              ) : !isEditingBackground ? (
                <MesaDetailsPanel
                  mesa={selectedMesa}
                  onEfectuarPago={handleEfectuarPago}
                  onPago={setTotal}
                  onMigrarMesa={handleOpenMigrationModal}
                  onOpenOrderModal={handleOpenOrderModal}
                  onOpenReservaModal={handleOpenReservaModal}
                  onUpdateEstado={handleUpdateEstado}
                  onUpdatePedidoEstado={handleUpdatePedidoEstado}
                  user={user}
                />
              ) : (
                <div className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Pencil size={18} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-100">
                      Editor de Fondo
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-semibold text-gray-200 mb-3">
                        Instrucciones:
                      </h3>
                      <ol className="list-decimal ml-5 space-y-2 text-gray-300 text-sm">
                        <li>Haga clic y arrastre para crear una línea</li>
                        <li>Haga doble clic en una línea para seleccionarla</li>
                        <li>
                          Presione "Delete" para borrar la línea seleccionada
                        </li>
                        <li>Use "Ctrl+Z" para deshacer cambios</li>
                        <li>Presione "Guardar" cuando termine</li>
                      </ol>
                    </div>

                    <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-400">💡</span>
                        Las líneas se ajustarán automáticamente a la cuadrícula
                        para mayor precisión.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MesaEditModal
        visible={editModalOpen}
        user={user}
        onClose={() => setEditModalOpen(false)}
        mesa={selectedMesa}
        onSave={handleMesaEdit}
        floorPlansLenght={floorPlans.length}
      />

      <MesaStatusModal
        visible={statusModalOpen}
        user={user}
        onClose={() => setStatusModalOpen(false)}
        mesa={selectedMesa}
        onUpdateEstado={handleUpdateEstado}
      />

      <OrderModal
        visible={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        selectedPedido={selectedPedido}
        mesa={selectedMesa}
        onSubmitPedido={handleSubmitPedido}
        onUpdatePedido={handleUpdatePedido}
      />

      {/* New Reserva Modal using FormularioReserva */}
      {reservaModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setReservaModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nueva Reserva</h2>
              <button
                onClick={() => setReservaModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-transparent hover:bg-gray-100 rounded-full p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <FormularioReserva
              onClose={() => setReservaModalOpen(false)}
              mesa={selectedMesa}
            />
          </div>
        </div>
      )}

      <PagoModal
        visible={efectuarPagoModal}
        onClose={() => {
          setEfectuarPagoModal(false);
          setSelectedPedidoId(null);
        }}
        total={total}
        mesa={selectedMesa}
        pedidoId={selectedPedidoId}
      />

      <MesaMigrationModal
        visible={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
        mesa={selectedMesa}
        mesas={mesas}
        onMigrarPedido={handleMigrarPedido}
      />

      <UnsavedChangesModal
        visible={unsavedChangesModalOpen}
        onCancel={handleUnsavedChangesCancel}
        onConfirm={handleUnsavedChangesConfirm}
      />

      <AddFloorModal
        visible={addFloorModalOpen}
        onClose={() => setAddFloorModalOpen(false)}
        onSave={handleAddFloorConfirm}
        buttonRef={addSectionButtonRef}
      />

      <ConfirmationModal
        visible={confirmationModal.visible}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, visible: false })
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText || "Confirmar"}
        cancelText={confirmationModal.cancelText || "Cancelar"}
      />

      {/* Reserva warning modal */}
      {showReservaWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4 text-yellow-600">Atención</h2>
            <p>
              Esta mesa tiene una reserva próxima en menos de 1 hora. ¿Está
              seguro que desea ocuparla?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelReservaWarning}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReservaWarning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Ocupar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation conflict modal */}
      {reservationConflictModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-orange-600">Conflicto de Reserva</h2>
            <div className="mb-4">
              <p className="mb-2">
                <strong>Mesa {reservationConflictModal.mesa?.numero}</strong> está ocupada pero tiene una reserva programada para las{' '}
                <strong>{reservationConflictModal.reservation?.hora}</strong> 
                ({reservationConflictModal.reservation?.clienteNombre}).
              </p>
              <p className="text-sm text-gray-600">
                La reserva está programada para dentro de 15 minutos o menos.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué desea hacer?
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleReservationConflict('dismiss')}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-left"
                  >
                    Dejar como está (no volver a avisar)
                  </button>
                  
                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleReservationConflict('change', parseInt(e.target.value));
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Cambiar a otra mesa...
                      </option>
                      {mesas
                        .filter(m => 
                          m.id !== reservationConflictModal.mesa?.id && 
                          m.estado === 'disponible'
                        )
                        .map(mesa => (
                          <option key={mesa.id} value={mesa.id}>
                            Mesa {mesa.numero}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleReservationConflict('dismiss')}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
