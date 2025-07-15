import { useEffect, useState } from "react";
import {
  getMenu,
  postItem,
  getAllCat,
  deleteItem,
  updateItem,
  updateItemDisp,
} from "../services/menuHelper";
import { useAuth } from "../context/authContext";
import { useCarrito } from "../context/carritoContext";
import socket from "../config/socket";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Armchair } from "lucide-react";
import GFIcon from "../styles/icons/gf_icon.png";
import veganIcon from "../styles/icons/V_icon.png";
import veggieIcon from "../styles/icons/veg_icon2.png";

import ProductoModal from "../components/productoModal";
import MesaModal from "../components/mesaModal";
import Modal from "../components/modal";
import LoadingScreen from "../components/utils/LoadingScreen";
import HelpModal from "../components/modals/HelpModal";

function RenderMenu() {
  const [menu, setMenu] = useState([]);
  const { user } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoItem, setNuevoItem] = useState({
    id: "",
    nombre: "",
    precio: "",
    descripcion: "",
    categoriaId: "",
    SKU: "",
    tag: [],
    imagenes: [],
  });
  const [categorias, setCategorias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito, carrito, eliminarDelCarrito } = useCarrito();

  // Para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  // Para filtrar por tags dietéticos
  const [activeFilters, setActiveFilters] = useState([]);


  //mesas
  const [mesaInfo, setMesaInfo] = useState({ tipo: "", numero: "" });
  const [showMesaModal, setShowMesaModal] = useState(false);

  //imagenes de items
  const [imagenesPreview, setImagenesPreview] = useState([]);

  // Estado para el hover del botón admin
  const [showPromoButton, setShowPromoButton] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  //estado para el boton de ayuda 
  const [showHelpButton, setShowHelpButton] = useState(false);
  //estado para el boton de mesa 
  const [showMesaButton, setShowMesaButton] = useState(false);



  // Función para refrescar el menú
  const refresh = async () => {
    try {
      const updatedMenu = await getMenu();
      toast.info("menu actualizado");
      setMenu(updatedMenu);
    } catch (error) {
      console.error("Error al refrescar el menú:", error);
      toast.error("Error al refrescar el menú");
    }
  };

  // Función para verificar si un item cumple con los filtros activos
  const passesFilters = (item) => {
    if (activeFilters.length === 0) return true;

    const itemTags = item.tag || [];
    // Find the category object for this item
    const itemCategory = categorias.find(
      (cat) => String(cat.id) === String(item.categoriaId)
    );
    const itemCategoryName = itemCategory
      ? itemCategory.nombre.toLowerCase()
      : "";

    // Si hay algún filtro de categoría, el item debe pertenecer a esa categoría
    // Si hay algún filtro de tag, el item debe tener ese tag
    // Si hay ambos, debe cumplir ambos
    let passesCategory = true;
    let passesTag = true;

    // Separar filtros de tags y de categorías
    const tagFilters = activeFilters.filter((f) =>
      ["GF", "Veg", "V"].includes(f)
    );
    const categoryFilters = activeFilters.filter((f) =>
      categorias.some((cat) => cat.nombre.toLowerCase() === f.toLowerCase())
    );

    if (tagFilters.length > 0) {
      passesTag = tagFilters.every((filter) => itemTags.includes(filter));
    }
    if (categoryFilters.length > 0) {
      passesCategory = categoryFilters.some(
        (filter) => itemCategoryName === filter.toLowerCase()
      );
    }

    return passesTag && passesCategory;
  };

  // Cargar menú y categorías al montar el componente
  useEffect(() => {
    async function fetchData() {
      try {
        const menuData = await getMenu();
        const catData = await getAllCat();

        setMenu(menuData);
        setCategorias(catData || []);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Cargar la información de mesa desde localStorage si existe
    //limpiarInfoMesa();
    const savedMesaInfo = sessionStorage.getItem("mesaInfo");
    if (savedMesaInfo) {
      try {
        setMesaInfo(JSON.parse(savedMesaInfo));
      } catch (error) {
        console.error("Error al cargar la información de mesa:", error);
      }
    }

    socket.on("item:creado", ({item}) => { 
      toast.success(`Nuevo item disponible ${item.nombre}`);
      setMenu((prevMenu) => [...prevMenu, item]);
    });

    socket.on("item:actualizado", refresh);

    socket.on("item:eliminado", ({id}) => { 
      setMenu((prevMenu) => prevMenu.filter((item) => item.id != id));
      if (productoSeleccionado?.id == id) {
        setProductoSeleccionado(null);
      }
    });

    socket.on("item:estadoActualizado", ({ id }) => { 
      setMenu((prevMenu) =>
        prevMenu.map((item) =>
          item.id === id ? { ...item, disp: !item.disp } : item
        )
      );
      if (productoSeleccionado?.id === id) {
        setProductoSeleccionado((prev) => ({
          ...prev,
          disp: !prev.disp,
        }));
      }
      setProductoSeleccionado(null); // Reset selected product
      toast.info("Estado del item actualizado");
    });

    return () => {
      socket.off("item:creado");
      socket.off("item:actualizado");
      socket.off("item:eliminado");
      socket.off("item:estadoActualizado");
    }
  }, []);

  // Organizar el menú por categorías
  const menuPorCategoria = categorias
    .slice() // Create a copy to avoid mutating the original array
    .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order attribute
    .map((cat) => {
      // Filtrar productos para esta categoría, asegurándose de comparar correctamente los tipos
      const categoryItems = menu.filter((item) => {
        // Convertir ambos a string para comparación segura
        return String(item.categoriaId) === String(cat.id);
      });

      return {
        ...cat,
        items: categoryItems,
      };
    });

  // Reset form when closing modal
  const handleCloseModal = () => {
    // Liberar URLs de objeto creados para evitar pérdidas de memoria
    imagenesPreview.forEach((img) => {
      if (!img.isExisting && img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImagenesPreview([]);
    setNuevoItem({
      id: "",
      nombre: "",
      precio: "",
      descripcion: "",
      categoriaId: "",
      tag: [],
      imagenes: [],
      SKU: "",
    });
    setMostrarModal(false);
  };

  // Maneja la visibilidad de items (actualiza disp)
  const handleDisp = async (producto) => {
    try {
      await updateItemDisp(producto.id, !producto.disp);
    } catch (error) {
      console.error("Error al actualizar el disp:", error);
      toast.error("Error al actualizar disponibilidad");
    }
  };

  // Añadir nuevo ítem al menú
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postItem(nuevoItem);
      if (response.status === 201) {
        toast.success("Ítem añadido con éxito");
        handleCloseModal();
        refresh();
      }
    } catch (error) {
      console.error("Error al añadir el ítem:", error);
      toast.error("Error al añadir el ítem");
    }
  };

  // Preparar eliminación de ítem
  const prepareDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Eliminar ítem del menú
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await deleteItem(itemToDelete);
      if (response.status === 200) {
        toast.success("Ítem eliminado correctamente");

        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setProductoSeleccionado(null);
        setMostrarModal(false);
      }
    } catch (error) {
      console.error("Error al eliminar el ítem:", error);
      toast.error("Error al eliminar el ítem");
    }
  };

  // Preparar formulario para editar ítem
  const handleEdit = (producto) => {
    //const productoEditar = { ...producto };
    setNuevoItem(producto);
    cargarImagenesParaEditar(producto);

    //cargarImagenesParaEditar(productoEditar);
    setMostrarModal(true);
  };

  // Actualizar ítem existente
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateItem(nuevoItem);
      setProductoSeleccionado(false);
      if (response.status === 200) {
        toast.success("Ítem actualizado correctamente");
        setProductoSeleccionado(null);
        setMostrarModal(false);
        // Emitir evento de menú actualizado
        handleCloseModal();
        refresh();
      }
    } catch (error) {
      console.error("Error al actualizar el ítem:", error);
      toast.error("Error al actualizar el ítem");
    }
  };

  // Función para manejar la carga de múltiples imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Verificar si excederíamos el límite de 5 imágenes
    if (imagenesPreview.length + files.length > 5) {
      toast.warning("Solo puedes subir un máximo de 5 imágenes");
      // Tomar solo las imágenes que podemos agregar hasta el límite de 5
      const remainingSlots = 5 - imagenesPreview.length;
      files.splice(remainingSlots);
    }

    // Validar y procesar cada archivo
    const newImages = [];

    files.forEach((file) => {
      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} no es un formato de imagen válido`);
        return;
      }

      // Validar tamaño máximo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} excede el tamaño máximo de 2MB`);
        return;
      }

      // Crear URL temporal para vista previa
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    });

    // Actualizar el estado con las nuevas imágenes
    setImagenesPreview([...imagenesPreview, ...newImages]);

    // Actualizar el estado del ítem para incluir los nuevos archivos
    const currentFiles = nuevoItem.imagenes ? [...nuevoItem.imagenes] : [];
    const newFiles = newImages.map((img) => img.file);

    setNuevoItem({
      ...nuevoItem,
      imagenes: [...currentFiles, ...newFiles],
    });
  };

  // Función para eliminar una imagen de la lista
  const handleRemoveImage = (index) => {
    // Crear copias de los arrays para no mutar el estado directamente
    const newPreviews = [...imagenesPreview];
    const newFiles = nuevoItem.imagenes ? [...nuevoItem.imagenes] : [];

    // Liberar la URL de la memoria
    URL.revokeObjectURL(newPreviews[index].preview);

    // Eliminar la imagen del array
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    // Actualizar estados
    setImagenesPreview(newPreviews);
    setNuevoItem({ ...nuevoItem, imagenes: newFiles });
  };

  // Borra la mesa en sessionStorage
  const limpiarInfoMesa = () => {
    setMesaInfo({ tipo: "", numero: "" });
    sessionStorage.removeItem("mesaInfo");
  };

  const handleSetMesa = (mesa) => {
    setMesaInfo(mesa);
  };

  // Función para actualizar las vistas previas de imágenes cuando se carga un producto para editar
  const cargarImagenesParaEditar = (producto) => {
    // Limpiar cualquier imagen previa
    imagenesPreview.forEach((img) => URL.revokeObjectURL(img.preview));
    setImagenesPreview([]);
    // Si el producto tiene imágenes, crear sus vistas previas
    if (producto.imagenes && producto.imagenes.length > 0) {
      const previews = producto.imagenes.map((img) => {
        // Si es un URL, usarlo directamente
        if (typeof img === "string") {
          return { preview: img, isExisting: true, url: img };
        }
        // Si es un archivo, crear URL de vista previa
        const preview = URL.createObjectURL(img);
        return { file: img, preview };
      });

      setImagenesPreview(previews);
    }
  };

  // Función para manejar el cambio de etiquetas dietéticas
  const handleTagChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    // Inicializar tags como array vacío si no existe
    let currentTags = nuevoItem.tag || [];

    if (isChecked) {
      // Agregar tag si no existe
      if (!currentTags.includes(value)) {
        currentTags.push(value);
      }
    } else {
      // Eliminar tag si existe
      currentTags = currentTags.filter((tag) => tag != value);
    }

    // Actualizar estado con los tags actualizados
    setNuevoItem({
      ...nuevoItem,
      tag: currentTags,
    });
  };

  const handleGestionarDisp = () => {
    console.log("gestion de disp proximamente");
  };

  // Función para manejar el hover del botón admin
  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowPromoButton(true);
    }, 500); // 2.5 segundos
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowPromoButton(false);
  };

  // Función para obtener la cantidad de un item en el carrito
  const getCantidadEnCarrito = (itemId) => {
    const itemEnCarrito = carrito.find((item) => item.id === itemId);
    return itemEnCarrito ? itemEnCarrito.cantidad : 0;
  };

  // Si no hay categorías o el menú está vacío pero ya cargó, mostrar todos los productos
  const mostrarMenuCompleto =
    !loading &&
    menu.length > 0 &&
    (categorias.length === 0 ||
      menuPorCategoria.every((cat) => cat.items.length === 0));

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center h-full w-full min-h-scree p-5">
      <h1 className="text-3xl font-bold text-naranja mb-5">
        Menú de Pixel Café
      </h1>

      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div>
          <p className="ml-3 text-naranja font-semibold">Cargando menú...</p>
        </div>
      )}

      {!loading && menu.length === 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="text-lg">
            No hay productos disponibles en este momento.
          </p>
        </div>
      )}

      {/* Indicador de Mesa/Tipo de pedido */}
      {mesaInfo.tipo && user?.cargo === "cliente" && (
        <div
          className="mb-5 bg-white p-3 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-gray-50 border border-naranja"
          onClick={() => {
            setShowMesaModal(true);
          }}
        >
          <div>
            {/* acomodar esto para que soporte otros tipos de pedidos */}
            {mesaInfo ? (
              <p className="font-medium text-gray-700">
                <span className="text-naranja">Mesa {mesaInfo.numero}</span>
              </p>
            ) : mesaInfo.tipo === "delivery" ? (
              <p className="font-medium text-gray-700">
                <span className="text-naranja">Pedido a domicilio</span>
              </p>
            ) : (
              <p className="font-medium text-gray-700">
                <span className="text-naranja">Pedido para llevar</span>
              </p>
            )}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>
      )}

      {/* Filtros y búsqueda */}
      {!loading && menu.length > 0 && (
        <div className="w-full max-w-5xl mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {/* Tags para filtrar */}
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${activeFilters.includes("GF")
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                onClick={() => {
                  setActiveFilters((prev) =>
                    prev.includes("GF")
                      ? prev.filter((f) => f !== "GF")
                      : [...prev, "GF"]
                  );
                }}
              >
                Sin TACC
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${activeFilters.includes("Veg")
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                onClick={() => {
                  setActiveFilters((prev) =>
                    prev.includes("Veg")
                      ? prev.filter((f) => f !== "Veg")
                      : [...prev, "Veg"]
                  );
                }}
              >
                Vegetariano
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${activeFilters.includes("V")
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                  }`}
                onClick={() => {
                  setActiveFilters((prev) =>
                    prev.includes("V")
                      ? prev.filter((f) => f !== "V")
                      : [...prev, "V"]
                  );
                }}
              >
                Vegano
              </button>
              {/* Categorías para filtrar */}
              {categorias
                .filter((cat) =>
                  menu.some(
                    (item) => String(item.categoriaId) === String(cat.id)
                  )
                )
                .map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${activeFilters.includes(cat.nombre)
                      ? "bg-orange-400 text-white"
                      : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                      }`}
                    onClick={() => {
                      setActiveFilters((prev) =>
                        prev.includes(cat.nombre)
                          ? prev.filter((f) => f !== cat.nombre)
                          : [...prev, cat.nombre]
                      );
                    }}
                  >
                    {cat.nombre}
                  </button>
                ))}
              {activeFilters.length > 0 && (
                <button
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 text-sm"
                  onClick={() => setActiveFilters([])}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información de debugging */}
      {/* {!loading && process.env.NODE_ENV !== 'production' && (
        <div className="text-black w-full max-w-5xl mb-4 p-2 bg-yellow-100 text-xs border border-yellow-400 rounded">
          <p>Total productos cargados: {menu.length}</p>
          <p>Total categorías: {categorias.length}</p>
        </div>
      )} */}

      {/* Menú organizado por categorías */}
      {!mostrarMenuCompleto && (
        <div className="w-full max-w-5xl">
          {menuPorCategoria.map((cat) => {
            // Filtra los items según el tipo de usuario y disponibilidad
            const visibleItems = cat.items.filter(
              (item) =>
                ((user && user?.cargo !== "cliente") || item.disp !== false) &&
                passesFilters(item)
            );

            // Solo muestra la categoría si tiene ítems para mostrar
            return visibleItems.length > 0 ? (
              <div key={cat.id} className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-naranja pb-2">
                  {cat.nombre}
                </h2>
                <div className="overflow-x-auto pb-4 hide-scrollbar smooth-scroll">
                  <div className="flex space-x-4" /*"grid grid-cols-3 gap-6"*/>
                    {visibleItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex-shrink-0 overflow-hidden shadow-md rounded-2xl p-4 text-center transition-all w-72 cursor-pointer menu-card ${item.disp === false
                          ? "bg-gray-300 opacity-70"
                          : "bg-white hover:shadow-lg"
                          }`}
                        onClick={() => setProductoSeleccionado(item)}
                      >
                        <div className="flex h-32">
                          <div className="w-1/2 bg-gray-200 rounded-2xl relative">
                            <img
                              src={`${import.meta.env.VITE_IMG_URL}${item.imagenes[0]}` || null}
                              alt={item.nombre || null}
                              className="w-full h-full object-cover rounded-lg"
                            ></img>
                            {/* Cart quantity indicator */}
                            {getCantidadEnCarrito(item.id) > 0 && (
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                                {getCantidadEnCarrito(item.id)}
                              </div>
                            )}
                          </div>
                          <div className="w-1/2 p-3 flex flex-col justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800">
                                {item.nombre}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                ${item.precio.toFixed(2)}
                              </p>
                            </div>
                            {item.disp === true && (
                              <div className="flex flex-wrap justify-evenly gap-1 mt-2">
                                {/* Tags de producto */}
                                {item.tag && (
                                  <div className="flex justify-center gap-1 mb-2">
                                    {item.tag.includes("GF") && (
                                      <img
                                        src={GFIcon}
                                        alt="Gluten Free"
                                        className="w-6 h-6"
                                      />
                                    )}
                                    {item.tag.includes("Veg") && (
                                      <img
                                        src={veggieIcon}
                                        alt="veggie"
                                        className="w-6 h-6"
                                      />
                                    )}
                                    {item.tag.includes("V") && (
                                      <img
                                        src={veganIcon}
                                        alt="vegan"
                                        className="w-6 h-6"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Botón para manejar disp (admin) - solo muestra "No Disponible" */}
                            {user?.cargo === "admin" && item.disp === false && (
                              <p className=" text-red-600 font-bold">
                                No Disponible
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Botón flotante del carrito (solo para clientes) */}
      {user?.cargo === "cliente" && (
        <Link to="/carrito">
          <button className="fixed bottom-5 right-5 bg-naranja text-white p-4 rounded-full shadow-lg text-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center">
            <span className="mr-1">🛒</span>
            <span className="bg-white text-naranja rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
              {carrito.reduce((total, item) => total + item.cantidad, 0)}
            </span>
          </button>
        </Link>
      )}

      {/* Botón flotante de mesa seleccionada (solo para clientes) */}
      {user?.cargo === "cliente" && (
        <div>
          {mesaInfo?.numero ? (
            <button
              className="fixed bottom-5 left-5 bg-blue-600 text-white p-4 rounded-full shadow-lg text-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-40"
              onClick={() => setShowHelpButton(true)}
              title={`Mesa ${mesaInfo.numero}`}
            >
              <User size={24} />
            </button>
          ) : (
            <button
              className="fixed bottom-5 left-5 bg-green-600 text-white p-4 rounded-full shadow-lg text-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center z-40"
              onClick={() => setShowMesaButton(true)}
              title={`Mesa ${mesaInfo.numero}`}
            >
              <Armchair size={24} />
            </button>
          )}
        </div>
      )}

      {/* Botón para agregar ítem (solo admin) */}
      {user?.cargo === "admin" && (
        <div
          className="fixed bottom-5 right-5 flex flex-col gap-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Botón de promo que aparece con hover */}
          {showPromoButton && (
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-purple-600 text-white p-4 rounded-full shadow-lg text-lg hover:bg-purple-700 transition-all duration-300 animate-fadeIn"
            >
              Agregar PROMO +
            </button>
          )}
          <button
            onClick={() => setMostrarModal(true)}
            className=" bg-blue-500 text-white p-4 pl-8 pr-8 rounded-full shadow-lg text-lg hover:bg-blue-700 transition-all duration-300"
          >
            Agregar ítem +
          </button>
        </div>
      )}

      {/* Modal de detalle de producto */}
      {productoSeleccionado && (
        <ProductoModal
          producto={productoSeleccionado}
          mesa={mesaInfo || null}
          onSetMesa={handleSetMesa}
          onClose={() => setProductoSeleccionado(null)}
          onEdit={handleEdit}
          onDelete={() => {
            prepareDelete(productoSeleccionado.id);
            handleDelete();
          }}
          onStock={handleDisp}
          user={user}
          onAddToCart={(cantidad) => {
            agregarAlCarrito(productoSeleccionado, cantidad);
            toast.success(
              `${cantidad} ${productoSeleccionado.nombre}(s) agregado(s) al carrito`
            );
            setProductoSeleccionado(null);
          }}
          cant={getCantidadEnCarrito(productoSeleccionado.id)}
        />
      )}

      {/* Modal para agregar/editar ítem - Diseño optimizado */}
      {mostrarModal && (
        <Modal
          titulo={nuevoItem.id ? "Editar Ítem" : "Añadir Nuevo Ítem"}
          onClose={() => {
            setMostrarModal(false);
            handleCloseModal();
          }}
        >
          <form
            onSubmit={nuevoItem.id ? handleUpdate : handleSubmit}
            className="space-y-3 overflow-auto max-h-[80vh] w-96"
          >
            <div className="flex flex-col-2 gap-4">
              {/* Panel izquierdo: Información principal */}
              <div className="col-1 md:col-span-7 space-y-3">
                {/* Nombre del producto */}
                <div className="flex flex-row gap-2">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoItem.nombre}
                      onChange={(e) =>
                        setNuevoItem({ ...nuevoItem, nombre: e.target.value })
                      }
                      className="bg-white text-black placeholder-gray-400 border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="w-3/4">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      SKU:
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Codigo de producto"
                      value={nuevoItem.SKU}
                      onChange={(e) =>
                        setNuevoItem({ ...nuevoItem, SKU: e.target.value })
                      }
                      className="bg-white text-black placeholder-gray-400 border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Precio y Categoría */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Precio:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={nuevoItem.precio}
                        onChange={(e) =>
                          setNuevoItem({ ...nuevoItem, precio: e.target.value })
                        }
                        className="border bg-white text-black placeholder-gray-400 p-2 pl-8 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Categoría:
                    </label>
                    <div className="relative">
                      <select
                        value={nuevoItem.categoriaId}
                        onChange={(e) =>
                          setNuevoItem({
                            ...nuevoItem,
                            categoriaId: e.target.value,
                          })
                        }
                        className="border bg-white text-black p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="">Seleccionar</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho: Imágenes */}
              <div className="col-span-12 md:col-span-5">
                <div className="">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-gray-700 text-sm font-bold">
                      Imágenes del producto
                    </h3>
                    <span className="text-xs text-gray-500">
                      {imagenesPreview.length}/5
                    </span>
                  </div>

                  {/* Carrusel de imágenes */}
                  {imagenesPreview.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                      {imagenesPreview.map((img, index) => (
                        <div
                          key={index}
                          className="relative h-20 rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={`${img.preview}`}
                            alt={`Vista previa ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mx-auto mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs">No hay imágenes</p>
                      </div>
                    </div>
                  )}

                  {/* Botón para agregar imágenes */}
                  <div className="mt-2">
                    <label
                      className={`cursor-pointer flex items-center justify-center w-full py-2 px-3 rounded-lg text-sm ${imagenesPreview.length >= 5
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {imagenesPreview.length >= 5
                        ? "Límite alcanzado"
                        : "Añadir imágenes"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        multiple
                        disabled={imagenesPreview.length >= 5}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Máx. 5 imágenes - 2MB c/u
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-gray-700 text-sm font-boldz mb-1">
                Descripción:
              </label>
              <textarea
                placeholder="Describe el producto en detalle..."
                value={nuevoItem.descripcion}
                onChange={(e) =>
                  setNuevoItem({ ...nuevoItem, descripcion: e.target.value })
                }
                className="border bg-white align-text-top text-black placeholder-gray-400 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              />
            </div>

            {/* Etiquetas dietéticas */}
            <div className="bg-gray-50  rounded-lg shadow-sm">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Etiquetas dietéticas:
              </label>
              <div className="text-black grid grid-cols-3 gap-2">
                <label className="inline-flex items-center p-1 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tag"
                    value="GF"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={nuevoItem.tag?.includes("GF")}
                    onChange={(e) => handleTagChange(e)}
                  />
                  <span className="ml-1 text-sm">Sin gluten</span>
                </label>

                <label className="inline-flex items-center p-1 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tag"
                    value="Veg"
                    className="form-checkbox h-4 w-4 text-green-600 rounded"
                    checked={nuevoItem.tag?.includes("Veg")}
                    onChange={(e) => handleTagChange(e)}
                  />
                  <span className="ml-1 text-sm">Vegetariano</span>
                </label>

                <label className="inline-flex items-center p-1 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tag"
                    value="V"
                    className="form-checkbox h-4 w-4 text-purple-600 rounded"
                    checked={nuevoItem.tag?.includes("V")}
                    onChange={(e) => handleTagChange(e)}
                  />
                  <span className="ml-1 text-sm">Vegano</span>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-3 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setMostrarModal(false);
                  handleCloseModal();
                }}
                className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg w-1/2 hover:bg-gray-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg w-1/2 hover:from-blue-600 hover:to-blue-800 font-medium shadow-sm text-sm"
              >
                {nuevoItem.id ? "Actualizar" : "Añadir"}
              </button>
            </div>
            <div className="w-full flex justify-center">
              <button
                onClick={handleGestionarDisp}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg w-1/2 hover:from-orange-600 hover:to-orange-700 font-medium shadow-sm text-sm"
              >
                Gestionar disp
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <Modal
          titulo="Confirmar eliminación"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="p-4 flex flex-col items-center">
            <p className="mb-4 text-center text-gray-700">
              ¿Estás seguro de que deseas eliminar este ítem? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* mesa modal */}
      {showMesaModal && (
        <MesaModal
          infoMesa={mesaInfo || null}
          onSetMesaInfo={handleSetMesa}
          visible={true}
          onClose={() => {
            setShowMesaModal(false);
          }}
        />
      )}

      {showHelpButton && (
        <HelpModal
          isOpen={showHelpButton}
          onClose={() => setShowHelpButton(false)}
          mesaInfo={mesaInfo}
        />
      )}
      {showMesaButton && (
        <MesaModal
          infoMesa={mesaInfo || null}
          onSetMesaInfo={handleSetMesa}
          visible={true}
          onClose={() => {
            setShowMesaButton(false);
          }}
        />
      )}
    </div>
  );
}

export default RenderMenu;
