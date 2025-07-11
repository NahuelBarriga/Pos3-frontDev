import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { getMenu } from "../../services/layoutHelper";
import { validarCupon } from "../../services/carritoHelper";
import { Trash2 } from "lucide-react";

const OrderModal = ({
  visible,
  onClose,
  selectedPedido,
  mesa,
  onUpdatePedido,
  onSubmitPedido,
}) => {
  const [pedido, setPedido] = useState({
    items: [],
    comentario: "",
    cupon: "",
  });
  const [menu, setMenu] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const searchInputRef = useRef(null);
  const confirmButtonRef = useRef(null);

  async function getMenuPedido() {
    const MenuData = await getMenu();
    setMenu(MenuData);
  }

  useEffect(() => {
    if (visible && mesa) {
      getMenuPedido();

      setIsEditMode(selectedPedido != null);

      if (selectedPedido) {
        // Cargar datos del pedido existente
        setPedido({
          ...selectedPedido,
          comentario: selectedPedido.comentario || "",
          cupon: selectedPedido.cupon || "",
        });

        // Cargar items al carrito
        setCarrito(
          selectedPedido.items.map((item) => ({
            id: item.id,
            cod: item.cod,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad || 1,
            tag: item.tag,
            SKU: item.SKU,
          }))
        );
      } else {
        // Inicializar pedido nuevo
        setPedido({ items: [], comentario: "", cupon: "" });
        setCarrito([]);
      }

      // Reset coupon validation state
      setDescuentoAplicado(null);

      // Auto-focus search input when modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else if (!visible) {
      // Reset search term when modal closes
      setSearchTerm("");
    }
  }, [visible, mesa, selectedPedido]);

  const filteredMenu = useMemo(() => {
    if (searchTerm != "") {
      return menu.filter((item) =>
        item.SKU?.toString().includes(searchTerm.toString())
      );
    } else {
      return menu;
    }
  }, [menu, searchTerm]);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }, [carrito]);

  // Calcular total (con descuento de cupón si existe)
  const total = useMemo(() => {
    console.log(descuentoAplicado)
    if (descuentoAplicado?.tipo === "porcentaje") 
      return subtotal - descuentoAplicado?.descuento / 100 * (subtotal);
    else if (descuentoAplicado?.tipo === "numerico")
      return subtotal - descuentoAplicado?.descuento;
    return subtotal;
  }, [subtotal, descuentoAplicado]);

  if (!visible || !mesa) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPedido({ ...pedido, [name]: value });

    // Reset coupon validation when coupon field changes
    if (name === "cupon") {
      setDescuentoAplicado(null);
    }
  };

  const validarCuponHandler = async () => {
    const cupon = pedido.cupon; 
    if (!cupon.trim()) {
      toast.info("Por favor ingrese un código de cupón");
      return;
    }
    const response = await validarCupon(cupon.trim());
    if (response.status === 200) {
      const descuento = response.data; // Asumiendo que la respuesta contiene el descuento
      setDescuentoAplicado(descuento);
      if (descuento.tipo === "porcentaje")
        toast.success(`Cupón aplicado: ${descuento.descuento}% de descuento`);
      else if (descuento.tipo === "monto_fijo")
        toast.success(`Cupón aplicado: $${descuento.descuento} de descuento`);
      totalConDescuento(); // Actualizar el total con el nuevo descuento
    } else if (response.status === 404) {
      toast.error("Cupón no encontrado o inválido");
      setDescuentoAplicado(null);
    }
  };

  const handleAddToCart = (item) => {
    const existingItemIndex = carrito.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // El item ya existe, incrementar cantidad
      const updatedCarrito = [...carrito];
      updatedCarrito[existingItemIndex].cantidad += 1;
      setCarrito(updatedCarrito);
    } else {
      // Añadir nuevo item
      setCarrito([...carrito, { ...item, cantidad: 1 }]);
    }
  };

  // Handle Enter key press to add first filtered item
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredMenu.length > 0) {
      e.preventDefault();
      handleAddToCart(filteredMenu[0]);

      // Maintain focus on search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    } else if (e.key === "+" && filteredMenu.length > 0) {
      e.preventDefault();
      handleAddToCart(filteredMenu[0]);

      // Maintain focus on search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    } else if (e.key === "-" && carrito.length > 0) {
      e.preventDefault();
      // Remove one unit from the last item in cart, or remove it if quantity is 1
      const lastItem = carrito[carrito.length - 1];
      if (lastItem.cantidad > 1) {
        handleUpdateCartItem(lastItem.id, "decrement");
      } else {
        handleRemoveCartItem(lastItem.id);
      }

      // Maintain focus on search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    } else if (e.key === "/" || e.key === "*") {
      e.preventDefault();
      // Clear search bar to allow entering new SKU
      setSearchTerm("");

      // Maintain focus on search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    } else if (e.key === "." || e.key === "Tab") {
      e.preventDefault();
      // Move focus to confirm button
      if (confirmButtonRef.current && carrito.length > 0) {
        confirmButtonRef.current.focus();
      }
    }
  };

  // Handle confirm button key events
  const handleConfirmKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (carrito.length > 0) {
        handleSubmitOrder();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Return focus to search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  const handleUpdateCartItem = (id, action) => {
    const updatedCarrito = carrito.map((item) => {
      if (item.id === id) {
        if (action === "increment") {
          return { ...item, cantidad: item.cantidad + 1 };
        } else if (action === "decrement") {
          if (item.cantidad > 1) {
            return { ...item, cantidad: item.cantidad - 1 };
          } else {
            return null;
          }
        }
      }
      return item;
    });

    setCarrito(updatedCarrito.filter((item) => item !== null));
  };

  const handleRemoveCartItem = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const handleSubmitOrder = () => {
    const updatedPedido = {
      ...pedido,
      items: carrito,
      mesaId: mesa.id,
      subtotal: subtotal,
      total: total,
      estado: "confirmado",
    };
    if (!isEditMode) {
      onSubmitPedido(mesa.id, updatedPedido);
    } else {
      onUpdatePedido(mesa.id, updatedPedido);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-gray-800 text-gray-100 p-3 sm:p-6 rounded-md w-full max-w-4xl h-full sm:h-5/6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          {isEditMode
            ? `Editar Pedido - Mesa ${mesa.numero || mesa.id}`
            : `Nuevo Pedido - Mesa ${mesa.numero || mesa.id}`}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-grow overflow-hidden">
          {/* Columna izquierda: Menú */}
          <div className="flex flex-col overflow-hidden">
            <div className="mb-3 sm:mb-4">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por codigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full p-2 text-sm sm:text-base rounded bg-gray-700 text-gray-100"
              />
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-700 rounded p-2">
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Menú Disponible
              </h3>
              <ul className="space-y-2">
                {filteredMenu.map((item) => (
                  <li
                    key={item.id}
                    className="bg-gray-600 rounded p-2 sm:p-3 flex justify-between items-center"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {item.nombre}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-300">
                        ${item.precio} - {item.tag}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-blue-600 p-1.5 sm:p-2 rounded hover:bg-blue-500 flex-shrink-0"
                    >
                      +
                    </button>
                  </li>
                ))}
                {filteredMenu.length === 0 && (
                  <li className="text-center py-4 text-gray-400 text-sm">
                    No se encontraron items
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Columna derecha: Carrito y totales */}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              {isEditMode ? "Detalles del Pedido" : "Tu Pedido"}
            </h3>
            <div className="flex-grow overflow-y-auto bg-gray-700 rounded p-2 mb-3 sm:mb-4">
              {carrito.length === 0 ? (
                <p className="text-center py-4 text-gray-400 text-sm">
                  El carrito está vacío
                </p>
              ) : (
                <ul className="space-y-2">
                  {carrito.map((item) => (
                    <li
                      key={item.id}
                      className="bg-gray-600 rounded p-2 sm:p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm sm:text-base truncate mr-2">
                          {item.nombre}
                        </h4>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <p className="text-xs sm:text-sm">
                          ${item.precio} x {item.cantidad} = $
                          {(item.precio * item.cantidad).toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="bg-gray-500 text-red-500 items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded hover:text-red-400 flex"
                          >
                            <Trash2 size={12} className="sm:hidden" />
                            <Trash2 size={16} className="hidden sm:block" />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateCartItem(item.id, "decrement")
                            }
                            className="bg-gray-500 w-6 h-6 sm:w-8 sm:h-8 rounded hover:bg-gray-400 flex items-center justify-center text-xs sm:text-base"
                            disabled={item.cantidad <= 1}
                          >
                            -
                          </button>
                          <span className="text-xs sm:text-base min-w-[20px] text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateCartItem(item.id, "increment")
                            }
                            className="bg-gray-500 w-6 h-6 sm:w-8 sm:h-8 rounded hover:bg-gray-400 flex items-center justify-center text-xs sm:text-base"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gray-700 rounded p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="mb-3">
                <label className="block text-xs sm:text-sm mb-1">
                  Cupón de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="cupon"
                    value={pedido.cupon || ""}
                    onChange={handleChange}
                    className={`flex-1 p-2 text-sm rounded bg-gray-600 text-gray-100`}
                    placeholder="Ingrese cupón si tiene uno"
                  />
                  <button
                    type="button"
                    onClick={validarCuponHandler}
                    disabled={!pedido.cupon || pedido.cupon.trim() === ""}
                    className={`px-3 py-2 text-sm rounded transition-colors bg-blue-600 hover:bg-blue-500'
                    } ${
                      !pedido.cupon || pedido.cupon.trim() === ""
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {"Validar"}
                  </button>
                </div>
            
                {descuentoAplicado && (
                  <p className="text-green-400 text-xs mt-1">
                    Cupón aplicado:  
                    <spam> 
                      {descuentoAplicado?.tipo === "porcentaje" ? ` ${(descuentoAplicado?.descuento).toFixed(2)}%` : ` -$${(descuentoAplicado?.descuento).toFixed(2)}`}
                      
                    </spam>
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-xs sm:text-sm mb-1">
                  Comentario adicional
                </label>
                <textarea
                  name="comentario"
                  value={pedido.comentario || ""}
                  onChange={handleChange}
                  className="w-full p-2 text-sm rounded bg-gray-600 text-gray-100"
                  placeholder="Ingrese detalles adicionales..."
                  rows={2}
                />
              </div>

              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {descuentoAplicado && (
                <div className="flex justify-between mb-2 text-green-400 text-sm sm:text-base">
                  <span>Descuento:</span>
                  <span>
                    {descuentoAplicado?.tipo === "porcentaje"
                      ? `-$${((descuentoAplicado?.descuento / 100) * subtotal ).toFixed(2)}`
                      : `-$${(descuentoAplicado?.descuento).toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
          <button
            ref={confirmButtonRef}
            onClick={handleSubmitOrder}
            onKeyDown={handleConfirmKeyDown}
            className={`p-2 sm:p-3 rounded flex-grow text-sm sm:text-base transition-colors ${
              carrito.length === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500"
            }`}
            disabled={carrito.length === 0}
          >
            {isEditMode ? "Actualizar Pedido" : "Confirmar Pedido"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 p-2 sm:p-3 rounded hover:bg-gray-500 text-sm sm:text-base transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
