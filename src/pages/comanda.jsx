import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "../context/authContext";
import { getPedidos, actualizarEstadoPedido } from "../services/pedidoHelper";
import PedidoModal from "../components/modals/PedidoModal";
import socket from "../config/socket";
import { Utensils, CheckCircle, XCircle, Clock, Filter, Coffee, Info } from 'lucide-react';
import { toast } from "react-toastify";
import { obtenerEstiloEstado } from "../utils/estadoUtils";
import { formatTimeComanda } from "../utils/timeUtils";

function Comanda() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('todos');
    const [selectedPedido, setSelectedPedido] = useState(null);
    const { user } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [displayedPedidos, setDisplayedPedidos] = useState([]);
    const [prevActiveFilter, setPrevActiveFilter] = useState(activeFilter);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverPosition, setDragOverPosition] = useState(null);
    const [gridColumns, setGridColumns] = useState(4);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute to refresh relative times
    useEffect(() => {
        const timeInterval = setInterval(() => {
            console.log('updatingMesa') //!sacar
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timeInterval);
    }, []);

    // Calculate grid position from mouse coordinates
    const calculateGridPosition = (clientX, clientY, containerRect) => {
        const cardWidth = 288; // w-72 = 18rem = 288px
        const gap = 16; // gap-4 = 1rem = 16px
        const effectiveCardWidth = cardWidth + gap;
        
        const relativeX = clientX - containerRect.left;
        const relativeY = clientY - containerRect.top;
        
        const col = Math.max(0, Math.min(gridColumns - 1, Math.floor(relativeX / effectiveCardWidth)));
        const row = Math.max(0, Math.floor(relativeY / (320 + gap))); // h-80 = 20rem = 320px
        
        return { row, col, index: row * gridColumns + col };
    };

    // Update grid columns based on container width
    useEffect(() => {
        const updateGridColumns = () => {
            const containerWidth = Math.min(window.innerWidth - 64, 1280); // max-w-7xl with padding
            const cardWidth = 288;
            const gap = 16;
            const cols = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
            setGridColumns(Math.min(4, cols));
        };

        updateGridColumns();
        window.addEventListener('resize', updateGridColumns);
        return () => window.removeEventListener('resize', updateGridColumns);
    }, []);

    // Fetch pedidos on component mount
    useEffect(() => {
        async function fetchPedidos() {
            try {
                setLoading(true);
                const data = await getPedidos(); //todo: enviar directamente el filtro asi no trae datos al pedo
                // Only show relevant orders: pending, confirmed or in preparation
                const filteredPedidos = data.filter(pedido =>
                    pedido.estado === 'pendiente' ||
                    pedido.estado === 'confirmado' ||
                    pedido.estado === 'en preparacion'
                );
                setPedidos(filteredPedidos);
            } catch (error) {
                console.error("Error fetching pedidos:", error);
                toast.error("Error al cargar los pedidos");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();

        // Set up socket listeners
        socket.on("pedido:nuevo", handleNuevoPedido);
        socket.on("pedido:estadoActualizado", handleEstadoActualizado);

        return () => {
            socket.off("pedido:nuevo");
            socket.off("pedido:estadoActualizado");
        };
    }, []);



    // Socket event handlers
    const handleNuevoPedido = (nuevoPedido) => {
        if (nuevoPedido.estado === 'pendiente' || nuevoPedido.estado === 'confirmado') {
            setPedidos(prevPedidos => [...prevPedidos, nuevoPedido]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

            // Show notification for new orders
            toast.info(`¡Nuevo pedido recibido! Pedido #${nuevoPedido.id}`);
        }
    };

    const handleEstadoActualizado = ({ pedidoId, estado }) => {
        setPedidos(prevPedidos => {
            const updatedPedidos = prevPedidos.map(pedido => {
                if (pedido.id === pedidoId) {
                    // If order is marked as ready, set a timer to remove it
                    if (estado === 'listo' || estado === 'rechazado') {
                        setTimeout(() => {
                            setPedidos(current => current.filter(p => p.id !== pedidoId));
                            setDisplayedPedidos(current => current.filter(p => p.id !== pedidoId));
                        }, 5000);
                    }
                    return { ...pedido, estado };
                }
                return pedido;
            });

            return updatedPedidos;
        });

        // Also update the pedido in displayedPedidos to preserve order
        setDisplayedPedidos(prevDisplayed => {
            return prevDisplayed.map(pedido => {
                if (pedido.id === pedidoId) {
                    return { ...pedido, estado };
                }
                return pedido;
            });
        });
    };

    // Handle status updates
    const handleUpdateEstado = async (pedidoId, nuevoEstado) => {
        try {
            await actualizarEstadoPedido(pedidoId, nuevoEstado);

            // Socket will update all connected clients
            // If "listo" state, we'll keep it in the list for 5 seconds for visual confirmation
            toast.success(`Pedido #${pedidoId} marcado como ${nuevoEstado}`);
        } catch (error) {
            console.error("Error updating pedido estado:", error);
            toast.error(`Error al actualizar el estado del pedido #${pedidoId}`);
        }
    };

    // Memoize filtered pedidos to prevent unnecessary recalculations
    const filteredPedidos = useMemo(() => {
        return pedidos.filter(pedido => {
            if (activeFilter === 'todos') return true;
            return pedido.estado === activeFilter;
        });
    }, [pedidos, activeFilter]);

    // Update prevActiveFilter when activeFilter changes
    useEffect(() => {
        setPrevActiveFilter(activeFilter);
    }, [activeFilter]);

    // Replace the problematic useEffect with a simpler one
    useEffect(() => {
        if (activeFilter !== prevActiveFilter) {
            // Reset order when filter changes
            setDisplayedPedidos(filteredPedidos);
        } else {
            // Preserve drag-and-drop order while updating items
            setDisplayedPedidos(prevDisplayed => {
                const currentIds = new Set(filteredPedidos.map(p => p.id));
                const prevIds = new Set(prevDisplayed.map(p => p.id));
                
                // If the set of IDs is completely different, reset
                if (currentIds.size !== prevIds.size || 
                    [...currentIds].some(id => !prevIds.has(id)) ||
                    [...prevIds].some(id => !currentIds.has(id))) {
                    
                    // Find which items are new and which should be removed
                    const newItems = filteredPedidos.filter(p => !prevIds.has(p.id));
                    const keptItems = prevDisplayed
                        .filter(p => currentIds.has(p.id))
                        .map(prevItem => {
                            // Update properties of kept items
                            const latestData = filteredPedidos.find(p => p.id === prevItem.id);
                            return latestData || prevItem;
                        });
                    
                    // Add new items at the end, preserving existing order
                    return [...keptItems, ...newItems];
                } else {
                    // Just update properties of existing items, preserve order
                    return prevDisplayed.map(prevItem => {
                        const latestData = filteredPedidos.find(p => p.id === prevItem.id);
                        return latestData || prevItem;
                    });
                }
            });
        }
    }, [filteredPedidos, activeFilter, prevActiveFilter]);

    // Handle custom drag start
    const handleDragStart = (e, pedido, index) => {
        setDraggedItem({ pedido, originalIndex: index });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');
    };

    // Handle drag over with position calculation
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggedItem) return;
        
        const container = e.currentTarget;
        const containerRect = container.getBoundingClientRect();
        const position = calculateGridPosition(e.clientX, e.clientY, containerRect);
        
        // Limit the position to valid indices
        const maxIndex = displayedPedidos.length - 1;
        const targetIndex = Math.min(position.index, maxIndex);
        
        setDragOverPosition(targetIndex);
    };

    // Handle drop with position-based reordering
    const handleDrop = (e) => {
        e.preventDefault();
        
        if (!draggedItem || dragOverPosition === null) return;
        
        const sourceIndex = draggedItem.originalIndex;
        const targetIndex = dragOverPosition;
        
        if (sourceIndex !== targetIndex) {
            const newItems = [...displayedPedidos];
            const [movedItem] = newItems.splice(sourceIndex, 1);
            newItems.splice(targetIndex, 0, movedItem);
            setDisplayedPedidos(newItems);
        }
        
        setDraggedItem(null);
        setDragOverPosition(null);
    };

    // Handle drag end cleanup
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverPosition(null);
    };

    // Get timing indicators - how long the order has been in the current state
    const getTimingIndicator = (timeString, fecha) => {
        if (!timeString) return null;
        const hoy = new Date(); 
        const [d,m,y] = fecha.split('-').map(Number);  
        if (d != hoy.getDate()) 
            return 'text-red-500';


        // Check if it's a time format (HH:MM) or a full timestamp
        if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}$/)) {
            // It's in HH:MM format, create a date for today with this time
            const now = new Date();
            const [orderHours, orderMinutes] = timeString.split(':').map(Number);
            const orderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), orderHours, orderMinutes);
            
            const diffMinutes = Math.floor((now - orderTime) / 60000);
            
            if (diffMinutes < 5) return 'text-green-500';
            if (diffMinutes < 15) return 'text-yellow-500';
            return 'text-red-500';
        }
        
        return 'text-gray-500';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header and filters */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <h1 className="text-2xl text-gray-900 font-bold mb-4 md:mb-0">
                        <Utensils className="inline-block mr-2" />
                        Comanda de Cocina
                    </h1>

                    <div className="flex flex-col md:flex-row gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-800 bg-white rounded-md shadow border hover:bg-gray-50"
                        >
                            <Filter size={18} /> Filtros
                        </button>

                        {/* <button 
                            onClick={fetchPedidos}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Actualizar
                        </button> */}
                    </div>
                </div>

                {/* Filter bar */}
                {showFilters && (
                    <div className="mb-6 bg-white p-4 rounded-md shadow">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveFilter('todos')}
                                className={`px-4 py-2 rounded-md ${activeFilter === 'todos'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-700 hover:bg-gray-200'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setActiveFilter('pendiente')}
                                className={`px-4 py-2 rounded-md ${activeFilter === 'pendiente'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-yellow-400 hover:bg-yellow-200'}`}
                            >
                                Pendientes
                            </button>
                            <button
                                onClick={() => setActiveFilter('confirmado')}
                                className={`px-4 py-2 rounded-md ${activeFilter === 'confirmado'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-400 hover:bg-blue-200'}`}
                            >
                                Confirmados
                            </button>
                            <button
                                onClick={() => setActiveFilter('en preparacion')}
                                className={`px-4 py-2 rounded-md ${activeFilter === 'en preparacion'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-purple-400 hover:bg-purple-200'}`}
                            >
                                En Preparación
                            </button>
                        </div>
                    </div>
                )}

                {/* Orders grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : displayedPedidos.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <Coffee size={48} className="mx-auto text-gray-400" />
                        <p className="mt-4 text-lg text-gray-600">
                            No hay pedidos {activeFilter !== 'todos' ? `en estado "${activeFilter}"` : ''}
                        </p>
                    </div>
                ) : (
                    <div
                        className="grid gap-4 relative"
                        style={{
                            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                            minHeight: '200px'
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragLeave={() => setDragOverPosition(null)}
                    >
                        {displayedPedidos.map((pedido, index) => {
                            const isDragging = draggedItem?.originalIndex === index;
                            const draggedIndex = draggedItem?.originalIndex;
                            const targetIndex = dragOverPosition;
                            
                            // Calculate if this card should move and in which direction
                            let shouldMove = false;
                            let moveDirection = '';
                            
                            if (targetIndex !== null && draggedIndex !== null && targetIndex !== draggedIndex) {
                                if (draggedIndex < targetIndex) {
                                    // Dragging forward: cards between original and target move backward
                                    shouldMove = index > draggedItem.originalIndex && index <= targetIndex;
                                    moveDirection = 'backward';
                                } else {
                                    // Dragging backward: cards between target and original move forward
                                    shouldMove = index >= targetIndex && index < draggedItem.originalIndex;
                                    moveDirection = 'forward';
                                }
                            }
                            
                            return (
                                <div
                                    key={pedido.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, pedido, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`${obtenerEstiloEstado(pedido.estado, 'card')} rounded-lg shadow-lg overflow-hidden flex flex-col h-80 transition-all duration-400 ease-out cursor-move ${
                                        isDragging ? 'opacity-40 scale-90 rotate-3 shadow-2xl z-50' : ''
                                    } ${
                                        shouldMove && moveDirection === 'forward' ? 'transform translate-x-8 translate-y-2 scale-105 shadow-xl' : ''
                                    } ${
                                        shouldMove && moveDirection === 'backward' ? 'transform -translate-x-8 -translate-y-2 scale-105 shadow-xl' : ''
                                    }`}
                                    style={{
                                        zIndex: isDragging ? 1000 : shouldMove ? 100 : 1,
                                        transformOrigin: 'center',
                                        willChange: 'transform, opacity'
                                    }}
                                >
                                    {/* Order header */}
                                    <div className="flex justify-between items-start p-4 border-b ">
                                        <div>
                                            <span className="text-lg font-semibold block">Pedido #{pedido.id}</span>
                                            <div className="text-sm text-gray-600">
                                                Mesa: {pedido.mesa ? `#${pedido.mesa.numero}` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold `}>
                                                {pedido.hora}
                                            </div>
                                            <div className={`text-xs flex items-center justify-end mt-1 ${getTimingIndicator(pedido.hora, pedido.fecha)}`} key={`relative-${currentTime.getTime()}`}>
                                                <Clock size={12} className="mr-1" />
                                                {formatTimeComanda(pedido.hora, pedido.fecha)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order items summary */}
                                    <div className="p-4 bg-white flex-grow overflow-y-auto">
                                        <h4 className="font-medium text-gray-700 mb-1">Items:</h4>
                                        <ul className="space-y-1">
                                            {pedido.items?.map((item, index) => (
                                                <li key={index} className="flex justify-between text-sm">
                                                    <span className="truncate max-w-[70%]">{item.nombre}</span>
                                                    <span className="font-medium">x{item.cantidad}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Order actions */}
                                    <div className="p-3 bg-gray-50 border-t border-gray-200 mt-auto">
                                        <div className="flex gap-2 justify-around">
                                            {pedido.estado === 'confirmado' && (
                                                <button
                                                    onClick={() => handleUpdateEstado(pedido.id, 'en preparacion')}
                                                    title="Iniciar Preparación"
                                                    aria-label="Iniciar Preparación"
                                                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition flex items-center justify-center aspect-square"
                                                >
                                                    <Utensils size={18} />
                                                </button>
                                            )}

                                            {pedido.estado === 'en preparacion' && (
                                                <button
                                                    onClick={() => handleUpdateEstado(pedido.id, 'listo')}
                                                    title="Marcar Listo"
                                                    aria-label="Marcar Listo"
                                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition flex items-center justify-center aspect-square"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {pedido.estado === 'pendiente' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateEstado(pedido.id, 'confirmado')}
                                                        title="Aceptar Pedido"
                                                        aria-label="Aceptar Pedido"
                                                        className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition flex items-center justify-center aspect-square"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateEstado(pedido.id, 'rechazado')}
                                                        title="Rechazar Pedido"
                                                        aria-label="Rechazar Pedido"
                                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition flex items-center justify-center aspect-square"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setSelectedPedido(pedido)}
                                                title="Ver Detalles"
                                                aria-label="Ver Detalles"
                                                className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition flex items-center justify-center aspect-square"
                                            >
                                                <Info size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order details modal */}
            {selectedPedido && (
                <PedidoModal
                    pedido={selectedPedido}
                    onClose={() => setSelectedPedido(null)}
                    onUpdateEstado={handleUpdateEstado}
                />
            )}
        </div>
    );
}

export default Comanda;