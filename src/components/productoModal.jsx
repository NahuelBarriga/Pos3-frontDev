import { useEffect, useState } from "react";
import { Trash2, EyeOff, Eye, Pencil, ChevronLeft, ChevronRight, Plus, Minus, ImageOff } from "lucide-react"
import MesaModal from "./mesaModal"
import GFIcon from "../styles/icons/gf_icon.png";
import veganIcon from "../styles/icons/V_icon.png";
import veggieIcon from "../styles/icons/veg_icon2.png";;

function ProductoModal({ producto, onClose, onEdit, onDelete, onStock, user, onAddToCart, cant, mesa, onSetMesa }) {
  const cantOriginal = cant;
  const [cantidad, setCantidad] = useState(cant);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Para agregar la mesa 
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [mesaInfo, setMesaInfo] = useState(mesa || { tipo: "", numero: "" });



  useEffect(() => { //!sacar
    console.log('infoMesa', mesaInfo);
  }, [mesaInfo]);


  const handleAddToCart = () => {
    if (cantidad != cantOriginal)
      onAddToCart(cantidad)
    onClose()
  };

  const handleStock = () => {
    onStock(producto)
  }

  const handleAddCant = () => {
    if (!mesa.tipo) {
      setShowMesaModal(true);
    }
    setCantidad(cantidad + 1);
  }

  const handleMinusCant = () => {
    if (cantidad > 0) //jamas deberia ser menor a 0 y tener el boton, pero por si acaso
      setCantidad(cantidad - 1);
  }

  const nextImage = () => {
    if (producto) {
      setCurrentImageIndex((currentImageIndex + 1) % producto.imagenes.length);
    }
  };
  const prevImage = () => {
    if (producto) {
      setCurrentImageIndex((currentImageIndex - 1 + producto.imagenes.length) % producto.imagenes.length);
    }
  };

  const handleClose = () => {
    if (cantidad != cantOriginal)
      onAddToCart(cantidad);
    onClose();
  }

  const handleEdit = () => {
    onEdit(producto);
    onClose();
  }

  // const handleSetMesaInfo = (mesa) => { 
  //   setMesaInfo(mesa);
  // }



  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
        {/* imagenes */}
        <div className="relative">
          <div className="relative w-full h-72 overflow-hidden rounded-lg mb-4">
            {producto.imagenes.length > 0 ? (
              <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                {producto.imagenes?.map((img, index) => (
                  <div key={index} className="w-full h-72 flex-shrink-0">
                    <img
                      src={img}
                      alt={`${producto.name} - imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 h-64 w-full flex justify-center items-center bg-gray-100">
                <ImageOff size={36} />
              </div>
            )}

            {/* Navigation buttons */}
            {producto.imagenes && producto.imagenes.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Indicator dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {producto.imagenes.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap flex-col justify-between items-center gap-4">
            {/* Botón para cerrar */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-black/30 text-white p-1 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {user?.cargo === 'admin' && (
            <div className="flex flex-wrap flex-col justify-between items-center gap-4">
              {/* Boton de stock */}
              <button
                onClick={handleStock}
                className="absolute top-2 left-2 bg-black/30 text-white p-1 rounded-full"
              >
                {producto.stock ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          )}
          <div className="p-4 pb-2 flex justify-between">
            <div className="flex items-end">
              <h2 className="text-xl font-bold text-gray-800">{producto.nombre}</h2>
              {/* //todo: cambiar por codigo */}
              {producto.SKU && (
                <h2 className="text-gray-500 text-sm pl-1"> #{producto.SKU}</h2>
              )}

            </div>
            <p className="text-lg font-bold text-green-600">${producto.precio}</p>
          </div>

          {/* etiquetas */}
          <div className="flex flex-wrap justify-evenly gap-1 mt-2">
            {/* Tags de producto */}
            {producto.tag && (
              <div className="flex justify-center gap-1 mb-2">
                {producto.tag.includes('GF') && (
                  <div className="flex items-center gap-1 bg-gray-200 rounded-xl px-2 py-1">
                    <span className="text-gray-500 text-sm">Sin TACC</span>
                    <img src={GFIcon} alt="Gluten Free" className="w-6 h-6" />
                  </div>
                )}
                {producto.tag.includes('Veg') && (
                  <div className="flex items-center gap-1 bg-gray-200 rounded-xl px-2 py-1">
                    <span className="text-gray-500 text-sm">Veggie</span>
                    <img src={veggieIcon} alt="veggie" className="w-6 h-6" />
                  </div>
                )}
                {producto.tag.includes('V') && (
                  <div className="flex items-center gap-1 bg-gray-200 rounded-xl px-2 py-1">
                    <span className="text-gray-500 text-sm">Vegano</span>
                    <img src={veganIcon} alt="vegan" className="w-6 h-6" />
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600 pt-1 p-4">{producto.descripcion}</p>
          <div className="flex justify-center pt-4 space-x-1">
            {user?.cargo === 'cliente' && (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2 bg-gray-300 rounded-lg">
                  <button
                    className="p-1 bg-gray-400"
                    onClick={handleMinusCant}
                  >
                    <Minus />
                  </button>
                  <span className="text-black text-center bg-gray-300 p-1 w-10 rounded-lg"> {cantidad} </span>
                  <button
                    className="bg-gray-400 p-1"
                    onClick={handleAddCant}
                  >
                    <Plus />
                  </button>
                </div>
                {cantidad > 0 ? (
                  <button
                    className="bg-blue-600 rounded-2xl w-44 pl-4 pr-4"
                    onClick={handleAddToCart}
                  >
                    Agregar al carrito
                  </button>
                ) : (
                  <button
                    className="bg-red-600 rounded-2xl w-44 pl-4 pr-4"
                    onClick={handleClose}
                  >
                    Cancelar
                  </button>
                )}

              </div>
            )}
            {user?.cargo === 'admin' && (
              <div className="flex flex-row justify-between gap-4 items-center">
                <button
                  className="bg-green-600 rounded-2xl w-44"
                  onClick={handleEdit}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 rounded-2xl w-44 "
                  onClick={onDelete}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* mesa modal */}
      {showMesaModal && (
        <MesaModal
          infoMesa={mesaInfo || null}
          onSetMesaInfo={onSetMesa}
          visible={true}
          onClose={() => {
            setShowMesaModal(false);
          }}
        />
      )}
    </div>
  );
}

export default ProductoModal;
