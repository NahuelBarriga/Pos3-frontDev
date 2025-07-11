import { useState } from 'react';
import { ShoppingBasket, Plus, Pencil, ArchiveX, Archive, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Section from './Section';

const ITEMS_PER_PAGE = 5;

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

export default function ProviderConfig({ 
  proveedores,
  currentPageProveedores,
  setCurrentPageProveedores,
  expandedSections,
  toggleSection,
  handleOpenAddProveedor,
  handleOpenEditProveedor,
  handleOpenViewProveedor,
  handleDeleteProveedor,
  handleToggleProveedorStatus
}) {
  return (
    <Section
      title="Configuración de proveedores"
      icon={<ShoppingBasket />}
      isExpanded={expandedSections.ProvSeetings}
      toggleExpand={() => toggleSection('ProvSeetings')}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-black">Proveedores</h3>
        <div className="flex flex-col space-y-2">
          {!proveedores || proveedores?.length === 0 ? (
            <p className="text-gray-500 italic">No hay proveedores cargados</p>
          ) : (
            <div>
              <ul className="border rounded-xl divide-y">
                {(() => {
                  const { currentItems } = getPaginatedData(proveedores, currentPageProveedores);
                  return currentItems.map((prov) => (
                    <li
                      key={prov.id}
                      className={`flex justify-between items-center p-3 hover:bg-gray-200 ${prov.activo ? '' : 'opacity-60'}`}
                      onClick={() => handleOpenViewProveedor(prov)}
                    >
                      <div className='flex flex-col justify-between '>
                        <span>
                          <span className={prov.activo ? 'text-gray-900' : 'text-gray-400'}>
                            {prov.nombre}
                          </span>
                          <span className={prov.activo ? 'text-gray-700 text-end text-xs' : 'text-gray-400 text-end text-xs'}>
                            #{prov.ref}
                          </span>
                          {!prov.activo && (
                            <span className="text-xs text-red-500 ml-3">no activo</span>
                          )}
                        </span>
                        <span className={prov.activo ? "text-gray-600 ml-2 text-sm" : "text-gray-400 ml-2 text-sm"}>
                          {prov.rubro}
                        </span>
                        {prov.direccion && (
                          <span className={prov.activo ? "text-gray-500 ml-2 text-xs" : "text-gray-400 ml-2 text-xs"}>
                            📍 {prov.direccion}
                          </span>
                        )}
                      </div>
                      <div className='flex'>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditProveedor(prov);
                          }}
                          className={`text-gray-500 bg-transparent hover:text-blue-700 mr-2 ${!prov.activo ? 'pointer-events-none opacity-40' : ''}`}
                          disabled={!prov.activo}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProveedorStatus(prov.id);
                          }}
                          className={`text-gray-500 bg-transparent ${prov.activo ? 'hover:text-orange-700' : 'hover:text-green-700'} mr-2`}
                        >
                          {prov.activo ? (
                            <ArchiveX size={18} />
                          ) : (
                            <Archive size={18} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProveedor(prov.id);
                          }}
                          className="text-gray-500 bg-transparent hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ));
                })()}
              </ul>

              {/* Pagination for proveedores */}
              {(() => {
                const { totalPages, indexOfFirst, indexOfLast } = getPaginatedData(proveedores, currentPageProveedores);
                const { nextPage, prevPage, goToPage } = createPaginationHandlers(currentPageProveedores, setCurrentPageProveedores, totalPages);
                
                return totalPages > 1 && (
                  <div className="mt-4 px-4 py-3 bg-gray-50 flex items-center justify-between rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={prevPage}
                        disabled={currentPageProveedores === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPageProveedores === 1
                          ? 'text-gray-300 bg-gray-100'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={nextPage}
                        disabled={currentPageProveedores === totalPages}
                        className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${currentPageProveedores === totalPages
                          ? 'text-gray-300 bg-gray-100'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-medium">{indexOfFirst}</span> a{' '}
                          <span className="font-medium">{indexOfLast}</span>{' '}
                          de <span className="font-medium">{proveedores.length}</span> proveedores
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={prevPage}
                            disabled={currentPageProveedores === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPageProveedores === 1
                              ? 'border-gray-300 bg-gray-100 text-gray-300'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            <span className="sr-only">Anterior</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>

                          {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => goToPage(idx + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border ${currentPageProveedores === idx + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                              {idx + 1}
                            </button>
                          ))}

                          <button
                            onClick={nextPage}
                            disabled={currentPageProveedores === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPageProveedores === totalPages
                              ? 'border-gray-300 bg-gray-100 text-gray-300'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            <span className="sr-only">Siguiente</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleOpenAddProveedor}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus size={18} className="mr-2" /> Agregar proveedor
          </button>
        </div>
      </div>
    </Section>
  );
}
