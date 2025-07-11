import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Clock, DollarSign } from 'lucide-react';
import { usePedidos } from "../../context/pedidosContext";
import { obtenerEstiloEstado } from "../../utils/estadoUtils";
import socket from "../../config/socket";

const PedidoCard = () => {
    const { pedidos } = usePedidos();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState('next');
    const containerRef = useRef(null);
   

    const handleCardClick = () => {
        if (pedidos.length <= 1 || isTransitioning) return;

        setIsTransitioning(true);
        setDirection('next');
        
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % pedidos.length);
            setIsTransitioning(false);
        }, 500);
    };

    if (pedidos.length === 0) {
        return <></>;
    }

    const CardContent = ({ pedido, showCounter = false, counterText = "" }) => (
        <div className="p-4">
            <div className="flex flex-row justify-between items-center mb-3">
                <h2 className={`text-sm font-bold ${obtenerEstiloEstado(pedido.estado, 'text')}`}>
                    Pedido #{pedido.id || 'N/A'}
                </h2>
                <div className="flex items-center gap-2">
                    {showCounter && (
                        <span className={`text-xs ${obtenerEstiloEstado(pedido.estado, 'text')} px-2 py-1 rounded-full font-medium bg-white bg-opacity-60`}>
                            {counterText}
                        </span>
                    )}
                    <div className={`${obtenerEstiloEstado(pedido.estado, 'summary')} rounded-lg text-xs px-2 py-1 font-medium`}>
                        {pedido.estado}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center">
                    <Clock className={`h-4 w-4 ${obtenerEstiloEstado(pedido.estado, 'text')} mr-2 flex-shrink-0`} />
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Hora:</span> {pedido.hora || 'N/A'}
                    </p>
                </div>
                <div className="flex items-center">
                    <DollarSign className={`h-4 w-4 ${obtenerEstiloEstado(pedido.estado, 'text')} mr-2 flex-shrink-0`} />
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Total:</span> ${pedido.total?.toFixed(2) || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );

    // Create an array of all visible cards with their positions
    const getVisibleCards = () => {
        const cards = [];
        const totalCards = pedidos.length;
        
        for (let i = 0; i < Math.min(3, totalCards); i++) {
            const index = (currentIndex + i) % totalCards;
            const pedido = pedidos[index];
            const zIndex = 30 - i * 10;
            const opacity = i === 0 ? 1 : (i === 1 ? 0.7 : 0.4);
            const translateY = i * 4;
            const scale = i === 0 ? 1 : (i === 1 ? 0.98 : 0.96);
            
            cards.push({
                pedido,
                index,
                zIndex,
                opacity,
                translateY,
                scale,
                isActive: i === 0
            });
        }
        
        return cards;
    };

    const visibleCards = getVisibleCards();

    return (
        <div 
            ref={containerRef}
            className="relative w-full mt-3 h-32"
            style={{ perspective: '1000px' }}
        >
            {visibleCards.map((card, cardIndex) => (
                <div
                    key={`${card.pedido.id}-${card.index}`}
                    onClick={card.isActive ? handleCardClick : undefined}
                    className={`
                        absolute inset-0 ${obtenerEstiloEstado(card.pedido.estado, 'card')} 
                        rounded-lg shadow-lg transition-all duration-500 ease-out
                        ${card.isActive && pedidos.length > 1 ? 'cursor-pointer' : ''}
                        ${card.isActive && !isTransitioning ? 'hover:shadow-xl hover:-translate-y-1' : ''}
                        ${isTransitioning && card.isActive ? 'animate-slide-out' : ''}
                    `}
                    style={{
                        zIndex: card.zIndex,
                        opacity: isTransitioning && card.isActive ? 0 : card.opacity,
                        transform: `translateY(${card.translateY}px) scale(${card.scale}) ${
                            isTransitioning && card.isActive ? 'translateX(-100%) rotate(-5deg)' : ''
                        }`,
                        transitionDelay: isTransitioning && !card.isActive ? `${cardIndex * 50}ms` : '0ms'
                    }}
                >
                    <CardContent 
                        pedido={card.pedido} 
                        showCounter={card.isActive && pedidos.length > 1}
                        counterText={`${currentIndex + 1}/${pedidos.length}`}
                    />
                </div>
            ))}
            
            {/* Progress dots */}
            {pedidos.length > 1 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {pedidos.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                    ? 'bg-blue-500 w-4' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            )}
            
            {/* Custom CSS for slide animation */}
            <style jsx>{`
                @keyframes slide-out {
                    0% {
                        transform: translateY(0px) scale(1) translateX(0%) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0px) scale(0.8) translateX(-120%) rotate(-8deg);
                        opacity: 0;
                    }
                }
                
                .animate-slide-out {
                    animation: slide-out 500ms ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PedidoCard;
