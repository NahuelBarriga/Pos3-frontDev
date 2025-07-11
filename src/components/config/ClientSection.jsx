import { useState } from 'react';
import { History, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Section from './Section';

const ITEMS_PER_PAGE = 5;

// Helper to format date as DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr instanceof Date) {
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return `${day}/${month}/${year}`;
  }
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length !== 4) {
      return dateStr.replace(/-/g, '/');
    }
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const obtenerColorEstado = (estado) => {
  return estado === 'pendiente' ? "bg-yellow-300 text-yellow-900" :
    estado === 'confirmado' || estado === 'aceptada' ? "bg-green-300 text-green-900" :
      estado === 'finalizado' || estado === 'finalizada' ? "bg-blue-300 text-green-900" :
        estado === 'rechazado' || estado === 'rechazada' ? "bg-red-300 text-red-900" : "bg-gray-300 text-gray-900";
};

const getPaginatedData = (data, currentPage) => {
  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  return {
    currentItems: data.slice(indexOfFirst, indexOfLast),
    totalPages: Math.ceil(data.length / ITEMS_PER_PAGE),
    indexOfFirst: indexOfFirst + 1,
    indexOfLast: Math.min(indexOfLast, data.length)
  };
};

const createPaginationHandlers = (currentPage, setCurrentPage, totalPages) => ({
  nextPage: () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  },
  prevPage: () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  },
  goToPage: (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }
});

export default function ClientSection({ pedidos, reservas, expandedSections, toggleSection }) {
  const [currentPagePedidos, setCurrentPagePedidos] = useState(1);
  const [currentPageReservas, setCurrentPageReservas] = useState(1);

  return (
    <>
      {/* Historial de pedidos */}
      <Section
        title="Historial de Pedidos"
        icon={<History />}
        isExpanded={expandedSections.ordersHistory}
        toggleExpand={() => toggleSection('ordersHistory')}
      >
        {pedidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  const { currentItems } = getPaginatedData(pedidos, currentPagePedidos);
                  return currentItems.map((pedido, index) => (
                    <tr
                      key={pedido.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${index !== currentItems.length - 1
                        ? "border-b border-gray-200"
                        : ""
                        }`}
                    >
                      <td className="px-4 py-2 text-black whitespace-nowrap text-sm">{pedido.id}</td>
                      <td className="px-4 py-2 text-black whitespace-nowrap text-sm">{formatDate(pedido.dia)}</td>
                      <td className="px-4 py-2 text-black text-sm">{pedido.items.map(item => item.nombre).join(', ')}</td>
                      <td className="px-4 py-2 text-black whitespace-nowrap text-sm font-medium">${pedido.total}</td>
                      <td className="px-4 py-2 text-black whitespace-nowrap text-sm">
                        <span className={`px-2 text-black py-1 text-xs rounded-full ${obtenerColorEstado(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            
            {/* Pagination for pedidos */}
            {(() => {
              const { totalPages, indexOfFirst, indexOfLast } = getPaginatedData(pedidos, currentPagePedidos);
              const { nextPage, prevPage, goToPage } = createPaginationHandlers(currentPagePedidos, setCurrentPagePedidos, totalPages);
              
              return totalPages > 1 && (
                <div className="mt-4 px-4 py-3 bg-gray-50 flex items-center justify-between rounded-lg">
                  {/* ...existing pagination code... */}
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirst}</span> a{' '}
                        <span className="font-medium">{indexOfLast}</span>{' '}
                        de <span className="font-medium">{pedidos.length}</span> pedidos
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPagePedidos === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPagePedidos === 1
                            ? 'border-gray-300 bg-gray-100 text-gray-300'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToPage(idx + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${currentPagePedidos === idx + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button
                          onClick={nextPage}
                          disabled={currentPagePedidos === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPagePedidos === totalPages
                            ? 'border-gray-300 bg-gray-100 text-gray-300'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay pedidos registrados.</p>
        )}
      </Section>

      {/* Historial de reservas */}
      <Section
        title="Historial de Reservas"
        icon={<Calendar />}
        isExpanded={expandedSections.reservationsHistory}
        toggleExpand={() => toggleSection('reservationsHistory')}
      >
        {reservas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  const { currentItems } = getPaginatedData(reservas, currentPageReservas);
                  return currentItems.map(reserva => (
                    <tr key={reserva.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-black">{reserva.id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-black">{formatDate(reserva.fecha)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-black">{reserva.hora}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-black">{reserva.cantPersonas}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 text-black py-1 text-xs rounded-full ${obtenerColorEstado(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            {/* Similar pagination for reservas... */}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay reservas registradas.</p>
        )}
      </Section>
    </>
  );
}
