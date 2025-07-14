import { useCarrito } from "../context/carritoContext";
import { usePedidos } from "../context/pedidosContext";
import { useAuth } from "../context/authContext";
import {
  postPedido,
  cancelarPedidoPendiente,
  validarCupon,
} from "../services/carritoHelper";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Plus,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { obtenerEstiloEstado } from "../utils/estadoUtils";


// Helper function to get proper state labels
const obtenerLabelEstado = (estado) => {
  const labels = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    rechazado: "Rechazado",
    finalizado: "Finalizado",
    "en preparacion": "En Preparación",
    listo: "Listo",
    pago_pendiente: "Pago Pendiente",
  };
  return labels[estado] || estado?.charAt(0).toUpperCase() + estado?.slice(1);
};

function Carrito() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
    comentario,
    mesaInfoGuardada,
    setComentario,
    cupon,
    setCupon,
    limpiarCarrito,
  } = useCarrito();

  const { user } = useAuth();
  const { pedidos, eliminarPedido, crearPedido, loading } = usePedidos();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);


  // Verificar cupon
  const verificarCupon = async () => {
    if (!cupon.trim()) {
      toast.info("Por favor ingrese un código de cupón");
      return;
    }
    setEnviando(true);
    const response = await validarCupon(cupon.trim());
    if (response.status === 200) {
      const descuento = response.data; // Asumiendo que la respuesta contiene el descuento
      setDescuentoAplicado(descuento);
      if (descuento.tipo === "procentaje")
        toast.success(`Cupón aplicado: ${descuento.descuento}% de descuento`);
      else if (descuento.tipo === "monto_fijo")
        toast.success(`Cupón aplicado: $${descuento.descuento} de descuento`);
      totalConDescuento(); // Actualizar el total con el nuevo descuento
    } else if (response.status === 404) {
      toast.error("Cupón no encontrado o inválido");
      setDescuentoAplicado(null);
    }
    setEnviando(false);
  };

  // Calcular el total con descuento
  const totalConDescuento = () => {
    const subtotal = calcularTotal();
    if (descuentoAplicado?.tipo === "numerico")
      return subtotal - descuentoAplicado?.descuento;
    else if (descuentoAplicado?.tipo === "porcentaje")
      return subtotal - subtotal * (descuentoAplicado?.descuento / 100);
    else return subtotal; // Sin descuento
  };

  // Enviar pedido
  const enviarPedido = async () => {
    // Validar que haya productos en el carrito

    setEnviando(true);
    try {
      const pedidoNuevo = {
        items: carrito,
        comentario,
        cupon,
        mesaId: mesaInfoGuardada.id,
        subtotal: calcularTotal(),
        total: totalConDescuento(),
        usuarioId: user?.id,
      };

      const response = await postPedido(pedidoNuevo);
      console.log("Pedido enviado en carrito:", response.data); //! Debugging line

      // Limpiar el carrito
      limpiarCarrito();
      setComentario("");
      setCupon("");
      setDescuentoAplicado(null);
      crearPedido(response.data); // Añadir el pedido al contexto
    } catch (error) {
      toast.error("error al realizar el pedido, intentolo nuevamente");
    } finally {
      setEnviando(false);
    }
  };

  // Proceder al pago de todos los pedidos aprobados
  const procederAlPago = () => {
    // Filtrar solo los pedidos aprobados
    const pedidosAprobados = pedidos.filter(
      (p) =>
        (p.estado === "confirmado" ||
          p.estado === "listo" ||
          p.estado === "en preparacion") &&
        p.usuarioId === user.id
    );

    if (pedidosAprobados.length === 0) {
      toast.info("No hay pedidos aprobados para pagar");
      return;
    }

    // Guardar los pedidos aprobados para la página de pago
    localStorage.setItem("pedidosAprobados", JSON.stringify(pedidosAprobados));

    // Redirigir a la página de pago
    navigate("/pago");
  };

  // Generar nuevo pedido
  const generarNuevoPedido = () => {
    // Limpiar el carrito y redireccionar al menú
    limpiarCarrito();
    setComentario("");
    setCupon("");
    setDescuentoAplicado(null);

    // Mantener el pedido actual en localStorage
    navigate("/");
  };

  // Cancelar un pedido específico
  const cancelarPedido = async (pedidoId) => {
    try {
      const response = await cancelarPedidoPendiente(pedidoId);
      if (response.status === 200) {
        // Eliminar el pedido del estado local
        eliminarPedido(pedidoId);
        toast.success("Pedido cancelado exitosamente");
      } else {
        toast.error("Error al cancelar el pedido. Intente nuevamente.");
      }
    } catch (error) {
      toast.error("Error al cancelar el pedido. Intente nuevamente.");
    }
  };

  // Calcular el total de todos los pedidos aprobados
  const calcularTotalPedidosAprobados = () => {
    return pedidos
      .filter((p) => p.estado === "confirmado")
      .reduce((total, pedido) => total + pedido.total, 0);
  };

  // Renderizar la lista de pedidos pendientes
  const renderPedidosPendientes = () => {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mb-6 w-full max-w-4xl">
        <h2 className="text-gray-800 text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          📋 Tus Pedidos
        </h2>

        {/* Pedidos pendientes */}
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`border-2 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${obtenerEstiloEstado(
                pedido.estado,
                "card"
              )}`}
            >
              <div className="flex flex-col gap-3">
                {/* Header with pedido number, time and status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {pedido.estado === "pendiente" && (
                      <Clock
                        size={20}
                        className="text-yellow-500 flex-shrink-0"
                      />
                    )}
                    {(pedido.estado === "confirmado" ||
                      pedido.estado === "pago_pendiente") && (
                      <CheckCircle
                        size={20}
                        className="text-green-500 flex-shrink-0"
                      />
                    )}
                    {pedido.estado === "rechazado" && (
                      <XCircle
                        size={20}
                        className="text-red-500 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-gray-800 font-bold text-base sm:text-lg">
                          Pedido #{pedido.id?.toString().substring(0, 8)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {pedido.hora}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${obtenerEstiloEstado(
                      pedido.estado,
                      "badge"
                    )}`}
                  >
                    {obtenerLabelEstado(pedido.estado)}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-transparent rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total del pedido
                    </p>
                    <p className="font-bold text-base sm:text-lg text-gray-800">
                      ${pedido.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-transparent rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-gray-600">Entrega</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800">
                      {pedido.mesa.id
                        ? `🪑 Mesa #${pedido.mesa.numero}`
                        : mesaInfoGuardada.tipo === "delivery"
                        ? "🚚 Delivery"
                        : "📦 Para llevar"}
                    </p>
                  </div>
                </div>

                {/* /* Products list */}
                <div className="bg-transparent rounded-lg p-2 sm:p-3">
                  <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    📦 Productos:
                  </p>
                  <ul className="space-y-1">
                    {pedido.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-xs sm:text-sm"
                      >
                        <span className="text-gray-700 whitespace-nowrap">
                          {item.nombre} x{item.cantidad}
                        </span>
                        <span className="flex-1 border-b border-dotted border-gray-300 mx-2"></span>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cancel button */}
                {pedido.estado === "pendiente" && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => cancelarPedido(pedido.id)}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                    >
                      Cancelar pedido
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="mt-8 space-y-4">
          {/* Mostrar botón de pago si hay pedidos aprobados */}
          {pedidos.some(
            (p) => p.estado === "confirmado" || p.estado === "pago pendiente"
          ) && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <span className="text-gray-800 font-semibold text-sm sm:text-base">
                  💰 Total a pagar:
                </span>
                <span className="text-green-700 font-bold text-xl sm:text-2xl">
                  ${calcularTotalPedidosAprobados().toFixed(2)}
                </span>
              </div>
              <button
                onClick={procederAlPago}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200"
              >
                <CreditCard size={20} className="sm:w-6 sm:h-6" />
                Pagar pedidos aprobados
              </button>
            </div>
          )}
          {carrito.length === 0 && (
            <button
              onClick={generarNuevoPedido}
              className="w-full bg-naranja hover:bg-orange-600 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200"
            >
              <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
              Hacer nuevo pedido
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center p-3 sm:p-5">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-naranja mb-2 flex items-center justify-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Carrito de Compras
          </h1>
          <div className="w-20 h-1 bg-naranja mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Carrito actual */}
      {carrito.length === 0 ? (
        <div className="text-center w-full mb-16 max-w-2xl">
          {pedidos.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-orange-100 rounded-full p-8 mb-6">
                  <ShoppingCart className="w-16 h-16 text-naranja" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  ¡Tu carrito está vacío!
                </h2>
                <p className="text-gray-600 mb-2 text-center max-w-md">
                  Aún no has agregado productos a tu carrito.
                </p>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                  ¡Descubre nuestras deliciosas opciones!
                </p>

                <Link to="/" className="flex-1">
                  <button className="w-full bg-orange-100 hover:bg-orange-200 text-gray-800 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300">
                    ← Volver al Menú
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6 mb-16">
          {/* Mesa/Delivery Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6">
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="bg-blue-500 rounded-full p-2">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                {/*//! acomodar esta logica para mostrar todos los tipos */}
                {mesaInfoGuardada ? (
                  <p className="text-gray-800 font-semibold">
                    Mesa #{mesaInfoGuardada.numero}
                  </p>
                ) : mesaInfoGuardada.tipo === "delivery" ? (
                  <p className="text-gray-800 font-semibold">🚚 Delivery</p>
                ) : (
                  <p className="text-gray-800 font-semibold">📦 Para llevar</p>
                )}
                <p className="text-sm text-gray-600">Tipo de pedido</p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white p-2rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-naranja p-4 sm:p-6">
              <h3 className="text-white font-bold text-lg sm:text-xl">
                Productos seleccionados
              </h3>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left text-gray-700 font-semibold py-3 px-2">
                        Producto
                      </th>
                      <th className="text-center text-gray-700 font-semibold py-3 px-2">
                        Cantidad
                      </th>
                      <th className="text-right text-gray-700 font-semibold py-3 px-2">
                        Precio
                      </th>
                      <th className="text-right text-gray-700 font-semibold py-3 px-2">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-2">
                          <div className="font-medium text-gray-800">
                            {item.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            # {item.SKU}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              className="bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                              onClick={() =>
                                item.cantidad === 1
                                  ? eliminarDelCarrito(item.id)
                                  : actualizarCantidad(
                                      item.id,
                                      item.cantidad - 1
                                    )
                              }
                            >
                              {item.cantidad == 1 ? (
                                <Trash2
                                  size={18}
                                  className="text-gray-700 -m-1"
                                />
                              ) : (
                                <Minus
                                  size={18}
                                  className="text-gray-700 -m-1"
                                />
                              )}
                            </button>
                            <span className="bg-gray-50 px-3 py-1 rounded-lg font-medium text-gray-800 min-w-[40px] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              className="bg-naranja hover:bg-orange-600  rounded-lg flex items-center justify-center transition-colors"
                              onClick={() =>
                                actualizarCantidad(item.id, item.cantidad + 1)
                              }
                            >
                              <Plus size={18} className="text-white -m-1" />
                            </button>
                          </div>
                        </td>
                        <td className="text-right py-4 px-2 text-gray-800 font-medium">
                          ${item.precio.toFixed(2)}
                        </td>
                        <td className="text-right py-4 px-2 text-gray-800 font-semibold">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>
                  {descuentoAplicado && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-medium">
                        {descuentoAplicado?.tipo === "procentaje"
                          ? `Descuento (${descuentoAplicado?.descuento}%):`
                          : `Descuento ($${descuentoAplicado?.descuento}):`}
                      </span>
                      <span className="font-semibold">
                        -$
                        {descuentoAplicado?.tipo === "procentaje"
                          ? (
                              calcularTotal() *
                              (descuentoAplicado?.descuento / 100)
                            ).toFixed(2)
                          : (descuentoAplicado?.descuento).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-naranja">
                      ${totalConDescuento().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
              📝 Información adicional
            </h3>

            <div className="space-y-4">
              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comentarios o instrucciones especiales:
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-naranja focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-500"
                  placeholder="Ej: Sin cebolla, extra salsa, temperatura específica..."
                  rows="3"
                ></textarea>
              </div>

              {/* Coupon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💳 Cupón de descuento:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={cupon}
                    onChange={(e) => setCupon(e.target.value)}
                    className="flex-grow p-3 border-2 border-gray-200 rounded-xl focus:border-naranja focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-500"
                    placeholder="Ej: A1B2C3D4"
                  />
                  <button
                    onClick={verificarCupon}
                    disabled={enviando}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {enviando ? "..." : "Aplicar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300">
                ← Volver al Menú
              </button>
            </Link>

            <button
              onClick={enviarPedido}
              disabled={enviando || carrito.length === 0}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                enviando || carrito.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {enviando ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      )}
      {/* Mostrar lista de pedidos pendientes */}
      {renderPedidosPendientes()}
    </div>
  );
}

export default Carrito;
