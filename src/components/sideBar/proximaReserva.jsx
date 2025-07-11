import { useState, useEffect } from "react";
import { getReservaUser } from "../../services/reservaHelper";
import { Calendar, Clock, Home } from 'lucide-react';

const ProximaReservaCard = () => {
    const [proximaReserva, setProximaReserva] = useState(null);

    useEffect(() => { 
        //agregar el listener de socket 

        const getReservasUser = async () => { 
            try {
                const todasReservas = await getReservaUser(); 
                if (todasReservas && todasReservas.length > 0) {
                    const reservasAceptadas = todasReservas.filter(r => r.estado === 'aceptada');
                    const sortedReservas = reservasAceptadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                    const nextRes = sortedReservas.find(r => new Date(r.fecha) >= new Date() && r.estado === 'aceptada'); 
                    setProximaReserva(nextRes || null);
                }
            } catch (error) {
                console.error("Error fetching user reservations:", error);
                setProximaReserva(null);
            }
        }
        getReservasUser(); 
    }, []) 

    if (!proximaReserva) {
        return (
            <></>
        );
    }
    
    return (
        <div className="w-full mt-3 bg-amber-50 border border-amber-200 shadow-sm rounded-lg p-3 transition-all duration-300 hover:shadow-md">
            <h2 className="text-sm font-bold text-amber-800 mb-2">Próxima Reserva</h2>
            
            <div className="space-y-2">
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-amber-500 mr-2" />
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Fecha:</span> {proximaReserva.fecha ? new Date(proximaReserva.fecha).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
                
                <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Hora:</span> {proximaReserva.hora || 'N/A'}
                    </p>
                </div>
                
                <div className="flex items-center">
                    <Home className="h-4 w-4 text-amber-500 mr-2" />
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Mesa:</span> {proximaReserva.mesa && proximaReserva.mesa.numero ? `#${proximaReserva.mesa.numero}` : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProximaReservaCard;