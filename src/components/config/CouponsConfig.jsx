import { useState } from "react";
import {
  Ticket,
  Plus,
  ArchiveX,
  Archive,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Section from "./Section";

const ITEMS_PER_PAGE = 5;

const getPaginatedData = (data, currentPage) => {
  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  return {
    currentItems: data.slice(indexOfFirst, indexOfLast),
    totalPages: Math.ceil(data.length / ITEMS_PER_PAGE),
    indexOfFirst: indexOfFirst + 1,
    indexOfLast: Math.min(indexOfLast, data.length),
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
  },
});

export default function CouponsConfig({
  cupones,
  currentPageCupones,
  setCurrentPageCupones,
  newCupon,
  expandedSections,
  toggleSection,
  handleCuponChange,
  handleSubmitCupon,
  handleDeleteCupon,
  handleUpdateCuponEstado,
  copyToClipboard,
}) {
  return (
    <Section
      title="Cupones y promociones"
      icon={<Ticket />}
      isExpanded={expandedSections.CuponesSettings}
      toggleExpand={() => toggleSection("CuponesSettings")}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-black">Cupones activos</h3>
        <div className="flex flex-col space-y-2">
          {!cupones || cupones.length === 0 ? (
            <p className="text-gray-500 italic">No hay cupones configurados</p>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validez
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const { currentItems } = getPaginatedData(
                      cupones,
                      currentPageCupones
                    );
                    return currentItems.map((cupon) => {
                      const isExpired =
                        new Date(cupon.fechaFin) <
                        new Date(new Date().setHours(0, 0, 0, 0));
                      return (
                        <tr key={cupon.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            <div className="relative group inline-flex items-center">
                              <span className="mr-2">{cupon.codigo}</span>
                              <button
                                onClick={() => copyToClipboard(cupon.codigo)}
                                className="absolute bottom-0 left-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 bg-transparent focus:outline-none"
                                title="Copiar código"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {cupon.tipo === "porcentaje"
                              ? `${cupon.descuento}%`
                              : `-$${cupon.descuento}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {new Date(cupon.fechaInicio).toLocaleDateString()} -{" "}
                            {new Date(cupon.fechaFin).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                cupon.estado === "activo"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {cupon.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleUpdateCuponEstado(cupon)}
                                disabled={isExpired}
                                className={`${
                                  cupon.estado === "activo"
                                    ? "text-blue-600 hover:text-blue-900"
                                    : "text-green-600 hover:text-green-900"
                                } focus:outline-none bg-transparent ${
                                  isExpired
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title={
                                  cupon.estado === "activo"
                                    ? "Desactivar cupón"
                                    : "Activar cupón"
                                }
                              >
                                {cupon.estado === "activo" ? (
                                  <ArchiveX size={16} />
                                ) : (
                                  <Archive size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteCupon(cupon)}
                                className="text-red-600 hover:text-red-900 focus:outline-none bg-transparent"
                                title="Eliminar cupón"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>

              {/* Pagination for cupones */}
              {(() => {
                const { totalPages, indexOfFirst, indexOfLast } =
                  getPaginatedData(cupones, currentPageCupones);
                const { nextPage, prevPage, goToPage } =
                  createPaginationHandlers(
                    currentPageCupones,
                    setCurrentPageCupones,
                    totalPages
                  );

                return (
                  totalPages > 1 && (
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={prevPage}
                          disabled={currentPageCupones === 1}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            currentPageCupones === 1
                              ? "text-gray-300 bg-gray-100"
                              : "text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          Anterior
                        </button>
                        <button
                          onClick={nextPage}
                          disabled={currentPageCupones === totalPages}
                          className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
                            currentPageCupones === totalPages
                              ? "text-gray-300 bg-gray-100"
                              : "text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          Siguiente
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Mostrando{" "}
                            <span className="font-medium">{indexOfFirst}</span>{" "}
                            a <span className="font-medium">{indexOfLast}</span>{" "}
                            de{" "}
                            <span className="font-medium">
                              {cupones.length}
                            </span>{" "}
                            cupones
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={prevPage}
                              disabled={currentPageCupones === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                                currentPageCupones === 1
                                  ? "border-gray-300 bg-gray-100 text-gray-300"
                                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Anterior</span>
                              <ChevronLeft
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>

                            {Array.from({ length: totalPages }).map(
                              (_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => goToPage(idx + 1)}
                                  className={`relative inline-flex items-center px-4 py-2 border ${
                                    currentPageCupones === idx + 1
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              )
                            )}

                            <button
                              onClick={nextPage}
                              disabled={currentPageCupones === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                                currentPageCupones === totalPages
                                  ? "border-gray-300 bg-gray-100 text-gray-300"
                                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Siguiente</span>
                              <ChevronRight
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">
            Crear nuevo cupón
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="descuento"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descuento
              </label>
              <input
                type="number"
                id="descuento"
                name="descuento"
                value={newCupon.descuento}
                onChange={handleCuponChange}
                min="0"
                max={newCupon.tipo === "porcentaje" ? "100" : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
                placeholder={
                  newCupon.tipo === "porcentaje" ? "Ej: 10 (máx 100)" : "Ej: 10"
                }
              />
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de descuento
              </label>
              <select
                id="tipo"
                name="tipo"
                value={newCupon.tipo}
                onChange={handleCuponChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="numerico">Monto fijo ($)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="fechaInicio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha inicio
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={newCupon.fechaInicio}
                onChange={handleCuponChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="fechaFin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha fin
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={newCupon.fechaFin}
                onChange={handleCuponChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSubmitCupon}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Plus size={18} className="mr-2" /> Crear cupón
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
