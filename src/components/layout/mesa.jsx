import { useRef, useState, useEffect } from "react";
import { Coffee, Calendar } from "lucide-react";


function Mesa({ mesa, onMove, selected, onSelect, onOpenEditModal, interactivo = true, user }) {
    const [isFlashing, setIsFlashing] = useState(false);
    const prevStateRef = useRef(mesa.estado);
    const mesaRef = useRef(null);

    const getColor = () => {
        switch (mesa.estado) {
            case 'ocupada': return isFlashing ? 'bg-red-500' : 'bg-red-600';
            case 'reservada': return isFlashing ? 'bg-yellow-400' : 'bg-yellow-500';
            case 'no disponible': return isFlashing ? 'bg-gray-200' : 'bg-gray-300';
            case 'disponible': return isFlashing ? 'bg-green-400' : 'bg-green-500';
            default: return isFlashing ? 'bg-gray-400' : 'bg-gray-500';
        }
    };

    useEffect(() => {
        // Detectar cambios en el estado o pedidos para activar el parpadeo
        if (
            prevStateRef.current !== mesa.estado ||
            (Array.isArray(mesa.pedido) && mesa.pedido.some(p => p.estado === 'pendiente'))
        ) {
            setIsFlashing(true);

            // Efecto de parpadeo: alternar cada 300ms por 2 segundos
            const flashIntervals = [];
            for (let i = 0; i < 4; i++) {
                flashIntervals.push(
                    setTimeout(() => setIsFlashing(prev => !prev), i * 300)
                );
            }
            
            // Asegurarnos de terminar con isFlashing = false
            const finalTimer = setTimeout(() => {
                setIsFlashing(false);
            }, 1500);

            prevStateRef.current = mesa.estado;
            
            // Limpiar todos los timers si el componente se desmonta
            return () => {
                flashIntervals.forEach(timer => clearTimeout(timer));
                clearTimeout(finalTimer);
            };
        }
    }, [mesa.estado, mesa.pedido]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selected) return;
            if (!interactivo) return;
            if (mesa.estado === 'no disponible' && user.cargo !== 'admin') return;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();

                // Safely extract x and y, handling both array and object locacion
                let x, y;
                if (Array.isArray(mesa.locacion)) {
                    [x, y] = mesa.locacion;
                } else {
                    x = mesa.locacion.x;
                    y = mesa.locacion.y;
                }

                switch (e.key) {
                    case 'ArrowUp': y -= 10; break;
                    case 'ArrowDown': y += 10; break;
                    case 'ArrowLeft': x -= 10; break;
                    case 'ArrowRight': x += 10; break;
                    default: return;
                }

                onMove(mesa.id, { 'x': x, 'y': y });
            }
        };

        if (selected && interactivo) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selected, mesa, onMove, user, interactivo]);

    const handleSingleClick = () => {
        if (selected) 
            onSelect(null); // Deseleccionar si ya está seleccionado
        else
            onSelect(mesa);
    };

    const handleDoubleClick = () => {
        if (interactivo && onOpenEditModal) {
            onOpenEditModal(mesa);
        }
    };

    // Calcular tamaño de la mesa proporcionalmente
    const calculateSize = () => {
        // Obtener dimensiones base desde mesa.size o valores por defecto
        const baseWidth = mesa.size?.width ? parseFloat(mesa.size.width) : 80;
        const baseHeight = mesa.size?.height ? parseFloat(mesa.size.height) : 80;
        
        return {
            width: baseWidth,
            height: baseHeight
        };
    };

    // Calcular la posición absoluta
    const calculatePosition = () => {
        let x, y;
        if (Array.isArray(mesa.locacion)) {
            x = mesa.locacion[0];
            y = mesa.locacion[1];
        } else {
            x = mesa.locacion.x || 0;
            y = mesa.locacion.y || 0;
        }
        
        return { x, y };
    };

    const size = calculateSize();
    const position = calculatePosition();


    // Determinar si es una mesa pequeña
    const isSmall = size.height < 55 || size.width < 50;
    const isTiny = size.height < 40 || size.width < 40;

    return (
        <div
            ref={mesaRef}
            className={`absolute rounded border-2 shadow-md flex flex-col items-center justify-center transition-all duration-300
                    ${selected ? 'ring-4 ring-blue-500 border-blue-300' : 'border-gray-400'} 
                    ${getColor()} 
                    ${(!interactivo || (mesa.estado === 'no disponible' && user?.cargo !== 'admin')) ? 'cursor-pointer' : 'cursor-move'}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: selected ? 20 : 10,
                padding: isTiny ? '2px' : isSmall ? '4px' : '8px',
                transition: "background-color 0.2s ease-in-out"
            }}
            onClick={handleSingleClick}
            onDoubleClick={handleDoubleClick}
            tabIndex={0}
        >
            {/* Contenedor adaptativo para número/texto e icono */}
            <div className={`w-full flex ${isSmall ? 'flex-row justify-center gap-1 items-center' : 'flex-col items-center'}`}>
                {/* Texto de la mesa */}
                <div className={`font-bold text-center text-gray-100 ${isTiny ? 'text-xs' : isSmall ? 'text-sm' : 'text-base'}`}>
                    {isTiny ? (
                        <span>{mesa.numero || mesa.id}</span>
                    ) : isSmall ? (
                        <span>{mesa.numero || mesa.id}</span>
                    ) : (
                        <span>Mesa {mesa.numero || mesa.id}</span>
                    )}
                </div>
                {/* Iconos de estado */}
                {(!isTiny || mesa.estado !== 'libre') && (
                    <div className={`flex items-center ${isSmall ? '' : ''}`}>
                        {/* Icono café: mostrar si hay algún pedido pendiente o confirmado */}
                        {mesa.estado === 'ocupada' && Array.isArray(mesa.pedido) && mesa.pedido.length > 0 && (
                            <div className="flex items-center text-gray-200">
                                <Coffee size={isTiny ? 8 : (isSmall ? 12 : 16)} />
                                {mesa.pedido.some(p => p.estado === 'pendiente') && (
                                    <span className={`text-yellow-300 font-bold ml-1 ${isTiny ? 'text-xs' : ''}`}>!</span>
                                )}
                            </div>
                        )}
                        {mesa.estado === 'reservada' && (
                            <div className="flex items-center text-gray-200">
                                <Calendar size={isTiny ? 8 : (isSmall ? 12 : 16)} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Mesa;