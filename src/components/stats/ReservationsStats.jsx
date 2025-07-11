import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReservationsStats = ({ 
  loading, 
  reservations, 
  ensureArray,
  LoadingIndicator,
  NoDataMessage 
}) => {
  // Get today's reservations if available
  const todaysReservations = reservations?.todaysReservations || [];
  // Get chart data
  const chartData = ensureArray(reservations?.reservations || []);

  return (
    <div className="space-y-6">
      {/* Reservas próximas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Reservas Próximas (14 días)</h3>
        <div className="h-64">
          {loading.reservations ? (
            <LoadingIndicator />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de reservas disponibles para mostrar" />
          )}
        </div>
      </div>
      
      {/* Lista de reservas para hoy */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Reservas de Hoy</h3>
        <div className="overflow-x-auto">
          {loading.reservations ? (
            <LoadingIndicator />
          ) : todaysReservations.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todaysReservations.map((reservation, index) => (
                  <tr key={reservation.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.hora}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.mesa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.personas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        reservation.estado === 'aceptada' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.estado === 'pendiente' ? 'Pendiente' : 
                         reservation.estado === 'aceptada' ? 'Confirmada' : 'Rechazada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NoDataMessage message="No hay reservas para hoy" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsStats;
