import React, { useEffect, useState } from "react";
import {
  Coffee,
  Calendar,
  Plus,
  ArrowRight,
  CreditCard,
  Edit,
  Info,
} from "lucide-react";
import PedidoModal from "../modals/PedidoModal";
import { obtenerEstiloEstado } from "../../utils/estadoUtils";

// Helper function to parse date in DD-MM-YYYY format
const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // If already a Date object
  if (dateStr instanceof Date) return dateStr;

  // Handle DD-MM-YYYY format
  if (dateStr.includes("-") && dateStr.split("-").length === 3) {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  // Try direct parsing as fallback
  return new Date(dateStr);
};

const MesaDetailsPanel = ({
  mesa,
  onUpdatePedidoEstado,
  onMigrarMesa,
  onOpenOrderModal,
  onOpenReservaModal,
  onUpdateEstado,
  onEfectuarPago,
  onPago,
  user,
}) => {
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Always define hooks before any return
  let total = 0;
  if (mesa && Array.isArray(mesa.pedido)) {
    total = calculaTotal(mesa.pedido);
  }

  useEffect(() => {
    if (mesa && Array.isArray(mesa.pedido)) {
      onPago(calculaTotal(mesa.pedido));
    }
  }, [mesa, mesa?.pedido]);

  function calculaTotal(pedidos) {
    let total = 0;
    if (pedidos && Array.isArray(pedidos)) {
      total = pedidos
        .filter((pedido) => pedido.estado === "confirmado")
        .reduce((sum, pedido) => sum + (pedido.total || 0), 0);
    }
    return total;
  }

  if (!mesa)
    return (
      <div className="p-3 sm:p-4 h-full flex flex-col text-center items-center justify-center text-gray-400">
        <Coffee size={32} className="sm:hidden mb-2 opacity-70" />
        <Coffee size={48} className="hidden sm:block mb-2 opacity-70" />
        <p className="text-gray-400 text-sm sm:text-base">
          Seleccione una mesa para ver detalles
        </p>
      </div>
    );

  return (
    <div className="p-3 sm:p-4 h-full overflow-y-auto flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100">
          Mesa #{mesa.numero || mesa.id}
        </h2>

        {mesa.estado === "ocupada" && mesa.pedido && mesa.pedido.length > 0 && (
          <button
            onClick={() => onMigrarMesa(mesa.id)}
            className="bg-yellow-600 hover:bg-yellow-500 px-2 sm:px-3 py-1 sm:py-1.5 rounded flex items-center justify-center text-xs sm:text-sm transition-colors w-full sm:w-auto"
          >
            <span className="mr-1">Migrar Mesa</span>
            <ArrowRight size={14} className="sm:hidden" />
            <ArrowRight size={16} className="hidden sm:block" />
          </button>
        )}
      </div>

      <div
        className={`mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700 rounded-md ${
          mesa.estado === "ocupada" &&
          Array.isArray(mesa.reserva) &&
          mesa.reserva.some((reserva) => {
            const reservaDate = parseDate(reserva.fecha);
            if (!reservaDate) return false;

            if (reserva.hora) {
              const [hours, minutes] = reserva.hora.split(":").map(Number);
              reservaDate.setHours(hours, minutes, 0, 0);
            }

            return reservaDate <= new Date(Date.now() + 2 * 60 * 60 * 1000);
          })
            ? "border-2 border-yellow-500"
            : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="font-semibold text-gray-100 text-sm sm:text-base">
            Estado:
          </div>
          <div
            className={`px-2 py-1 rounded text-white cursor-pointer text-xs sm:text-sm text-center w-full sm:w-auto ${
              mesa.estado === "disponible"
                ? "bg-green-500"
                : mesa.estado === "ocupada"
                ? "bg-red-600"
                : mesa.estado === "reservada"
                ? "bg-yellow-500"
                : mesa.estado === "no disponible"
                ? "bg-gray-500"
                : "bg-gray-300"
            }`}
            onClick={async () => {
              if (mesa.estado !== "no disponible") {
                mesa.estado = await onUpdateEstado(
                  mesa,
                  mesa.estado === "ocupada" ? "disponible" : "ocupada"
                );
              }
            }}
          >
            {mesa.estado?.charAt(0).toUpperCase() + mesa.estado?.slice(1) ||
              "No definido"}
          </div>
        </div>

        {mesa.pedido &&
          mesa.pedido.some((pedido) => pedido.estado === "confirmado") && (
            <div className="flex justify-center mt-3">
              <button
                onClick={() => onEfectuarPago()}
                className="bg-green-600 hover:bg-green-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-white flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto transition-colors"
              >
                <CreditCard size={14} className="sm:hidden mr-1" />
                <CreditCard size={18} className="hidden sm:block mr-2" />
                <span className="mr-1 sm:mr-2">Efectuar pago:</span>
                <span>${total}</span>
              </button>
            </div>
          )}
      </div>

      <div className="overflow-y-auto flex-grow">
        {mesa.estado === "ocupada" &&
          Array.isArray(mesa.pedido) &&
          mesa.pedido.length > 0 && (
            <div className="mt-2">
              <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-700 text-sm sm:text-base">
                Detalles de pedidos
              </h3>
              {mesa.pedido.map((pedido) => (
                <details key={pedido.id} className="mb-2 group">
                  <summary
                    className={`p-2 sm:p-3 rounded-md list-none cursor-pointer ${obtenerEstiloEstado(
                      pedido.estado,
                      "summary"
                    )}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-gray-200 text-sm sm:text-base">
                        Pedido #{pedido.id}
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="text-gray-300 text-xs sm:text-sm">
                          {pedido.hora || ""}
                        </span>
                        <span className="font-semibold text-gray-300 text-xs sm:text-sm">
                          ${pedido.total || "0.00"}
                        </span>
                      </div>
                    </div>
                  </summary>

                  <div className="mt-2 p-2 sm:p-3 bg-gray-700 rounded-md relative">
                    <div className="flex flex-row justify-between align-middle items-center">
                      {/* Estado del pedido */}
                      <div className="mb-2 pt-0.5">
                        <span
                          className={`px-2 py-1 rounded text-xs ${obtenerEstiloEstado(
                            pedido.estado,
                            "badge"
                          )}`}
                        >
                          {pedido.estado?.toUpperCase() || "No definido"}
                        </span>
                      </div>
                      {(pedido.estado === "pendiente" ||
                        pedido.estado === "confirmado") && (
                        <button
                          onClick={() => onOpenOrderModal(mesa, pedido)}
                          className="bg-transparent pt-0.5"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>

                    {/* Fecha completa */}
                    <div className="mb-2 text-gray-300 text-xs sm:text-sm">
                      <span>
                        {`${pedido.hora || ""} | ${pedido.fecha || ""}` ||
                          "No disponible"}
                      </span>
                    </div>

                    {/* Nombre del cliente */}
                    <div className="mb-2 text-gray-300 text-xs sm:text-sm">
                      <span>
                        {`${pedido?.cliente?.nombre}` || "No disponible"}
                      </span>
                    </div>

                    {/* Items */}
                    {pedido.items && pedido.items.length > 0 && (
                      <div className="mb-2">
                        <div className="bg-gray-600 rounded p-2">
                          <div className="text-gray-300 flex justify-between items-center mb-1 text-xs sm:text-sm">
                            <span>Items</span>
                            <span className="bg-gray-800 text-gray-300 text-xs rounded-full px-2 py-1">
                              {pedido.items.reduce(
                                (sum, item) => sum + item.cantidad,
                                0
                              )}
                            </span>
                          </div>
                          <div className="pl-2">
                            <ul className="space-y-1">
                              {pedido.items.map((item, index) => (
                                <li
                                  key={index}
                                  className="text-gray-300 text-xs flex justify-between"
                                >
                                  <div>
                                    <span>
                                      {item.nombre || "no disponible"}
                                    </span>
                                    <span className="text-xs items-end ml-1 text-gray-400">
                                      #{item.SKU || "no disponible"}
                                    </span>
                                  </div>
                                  <span>x{item.cantidad}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {pedido.comentario !== "null" && pedido.comentario && (
                      <div className="mb-2 text-xs sm:text-sm text-gray-300 bg-gray-600 rounded p-2">
                        <span className="font-semibold">Comentario:</span>{" "}
                        {pedido.comentario}
                      </div>
                    )}

                    {/* Buttons section - Made more responsive */}
                    <div className="mt-4 flex justify-between gap-2 sm:gap-3">
                      {pedido.estado === "pendiente" ? (
                        <div className="flex gap-2 sm:gap-3 w-full">
                          <button
                            onClick={() =>
                              onUpdatePedidoEstado(pedido.id, "confirmado")
                            }
                            className="bg-green-600 hover:bg-green-500 p-2 sm:p-3 rounded flex items-center justify-center flex-1 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() =>
                              onUpdatePedidoEstado(pedido.id, "rechazado")
                            }
                            className="bg-red-600 hover:bg-red-500 p-2 sm:p-3 rounded flex items-center justify-center flex-1 transition-colors"
                          >
                            ✗
                          </button>
                          <button
                            onClick={() => setSelectedPedido(pedido)}
                            className="bg-gray-600 hover:bg-gray-500 p-2 sm:p-3 rounded flex items-center justify-center flex-1 transition-colors"
                          >
                            <Info size={16} className="sm:hidden" />
                            <Info size={18} className="hidden sm:block" />
                          </button>
                        </div>
                      ) : pedido.estado === "confirmado" ||
                        pedido.estado === "listo" ||
                        pedido.estado === "en preparacion" ? (
                        <div className="flex gap-2 sm:gap-3 w-full">
                          <button
                            onClick={() => onEfectuarPago(pedido.id)}
                            className="bg-green-600 hover:bg-green-500 p-2 sm:p-3 rounded flex items-center justify-center flex-grow-[3] text-xs sm:text-sm transition-colors"
                          >
                            <CreditCard size={14} className="sm:hidden mr-1" />
                            <CreditCard
                              size={18}
                              className="hidden sm:block mr-2"
                            />
                            <span className="hidden sm:inline">Pagar </span>$
                            {pedido.total || 0}
                          </button>
                          <button
                            onClick={() => setSelectedPedido(pedido)}
                            className="bg-gray-600 hover:bg-gray-500 p-2 sm:p-3 rounded flex items-center justify-center flex-grow-[1] transition-colors"
                          >
                            <Info size={16} className="sm:hidden" />
                            <Info size={18} className="hidden sm:block" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPedido(pedido)}
                          className="bg-gray-600 hover:bg-gray-500 p-2 sm:p-3 rounded flex items-center justify-center w-full text-xs sm:text-sm transition-colors"
                        >
                          <Info size={16} className="sm:hidden mr-1" />
                          <Info size={18} className="hidden sm:block mr-2" />
                          Ver detalles
                        </button>
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

        {mesa.estado === "reservada" &&
          Array.isArray(mesa.reserva) &&
          mesa.reserva.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-700">
                Detalles de la Reserva
              </h3>
              {/* Mostrar la reserva más próxima */}
              {(() => {
                const proximaReserva = mesa.reserva[0];
                return proximaReserva ? (
                  <div className="p-3 bg-gray-700 rounded-md">
                    <p className="flex items-center text-gray-300">
                      <Calendar size={16} className="mr-2" />
                      {proximaReserva.hora} hs
                    </p>
                    <p className="text-gray-300 mt-2">
                      <span className="font-semibold">Cliente:</span>{" "}
                      {proximaReserva.clienteNombre || "No especificado"}
                    </p>
                    <p className="text-gray-300 mt-2">
                      <span className="font-semibold">Personas:</span>{" "}
                      {proximaReserva.cantPersonas || "No especificado"}
                    </p>
                    {proximaReserva.comentario && (
                      <p className="text-gray-300 mt-2">
                        <span className="font-semibold">Comentario:</span>{" "}
                        {proximaReserva.comentario}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}

        <div className="p-2 sm:p-4 flex flex-col items-center justify-center text-gray-400">
          {mesa.estado === "ocupada" && (
            <div>
              {(!Array.isArray(mesa.pedido) || mesa.pedido.length === 0) && (
                <div className="flex flex-col text-white items-center">
                  <Coffee size={24} className="sm:hidden mb-2 opacity-50" />
                  <Coffee
                    size={32}
                    className="hidden sm:block mb-2 opacity-50"
                  />
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Sin pedidos activos
                  </p>
                </div>
              )}
              <button
                onClick={() => onOpenOrderModal(mesa)}
                className="bg-blue-600 hover:bg-blue-500 px-3 sm:px-4 py-1.5 sm:py-2 w-full max-w-44 rounded text-white mt-3 sm:mt-4 flex items-center justify-center text-xs sm:text-sm transition-colors"
              >
                <Plus size={14} className="sm:hidden mr-1" />
                <Plus size={16} className="hidden sm:block mr-1" />
                <span className="hidden sm:inline">Crear Pedido</span>
                <span className="sm:hidden">Pedido</span>
              </button>
            </div>
          )}

          <div className="flex flex-col items-center w-full">
            {mesa.estado !== "no disponible" && (
              <button
                onClick={() => onOpenReservaModal(mesa)}
                className="bg-yellow-600 hover:bg-yellow-500 px-3 sm:px-4 py-1.5 sm:py-2 w-full max-w-44 rounded text-white mt-3 sm:mt-4 flex justify-center items-center text-xs sm:text-sm transition-colors"
              >
                <Calendar size={14} className="sm:hidden mr-1" />
                <Calendar size={16} className="hidden sm:block mr-1" />
                <span className="hidden sm:inline">Crear Reserva</span>
                <span className="sm:hidden">Reserva</span>
              </button>
            )}

            {/* Listado de reservas futuras - Fixed reversed sorting */}
            {Array.isArray(mesa.reserva) &&
              ((mesa.estado !== "reservada" && mesa.reserva.length > 0) ||
                mesa.reserva.length > 1) && (
                <div className="mt-4 w-full">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">
                    Próximas Reservas
                  </h4>
                  <div className="bg-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
                    {mesa.reserva
                      .slice(mesa.estado === "reservada" ? 1 : 0)
                      .sort((a, b) => {
                        // Sort by date and time - REVERSED ORDER
                        const dateA = parseDate(a.fecha);
                        const dateB = parseDate(b.fecha);

                        if (dateA && dateB) {
                          if (a.hora) {
                            const [hoursA, minutesA] = a.hora
                              .split(":")
                              .map(Number);
                            dateA.setHours(hoursA, minutesA);
                          }

                          if (b.hora) {
                            const [hoursB, minutesB] = b.hora
                              .split(":")
                              .map(Number);
                            dateB.setHours(hoursB, minutesB);
                          }

                          // Reversed order - sort newest first
                          return dateB - dateA;
                        }
                        return 0;
                      })
                      .map((reserva, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-300 py-1 px-2 mb-1 bg-gray-600 rounded flex justify-between"
                        >
                          {console.log(reserva)}
                          <span>{reserva.hora} hs</span>
                          <span>{reserva.cantPersonas} personas</span>
                        </div>
                      ))}
                    {mesa.reserva.length === 0 && (
                      <p className="text-xs text-gray-400 text-center">
                        No hay reservas futuras
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {selectedPedido && (
        <PedidoModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
          onUpdateEstado={onUpdatePedidoEstado}
          onProcessPayment={onEfectuarPago}
        />
      )}
    </div>
  );
};

export default MesaDetailsPanel;
