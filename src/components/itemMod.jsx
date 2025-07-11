import Modal from "./modal";
import { useState, useEffect } from "react";

function itemMod({producto, onSubmit, cat, setMostrarModal, handleCloseModal}) { 
    const [nuevoItem, setNuevoItem] = useState(producto || {});
    const [imagenesPreview, setImagenesPreview] = useState([]);
    const [imagenes, setImagenes] = useState([]); // Para almacenar las imágenes seleccionadas
    const [categorias, setCategorias] = useState(cat || []); // Para almacenar las categorías seleccionadas
    const [tags, setTags] = useState([]); // Para almacenar las etiquetas seleccionadas

    const handleSubmit = (e) => {

        onSubmit(nuevoItem); 
    }

    const handleUpdate = (e) => {
        onSubmit(nuevoItem); 
    }
    const handleTagChange = (e) => {
    } 
    
    

    return ( 
    <form className="space-y-3 overflow-auto max-h-[80vh] w-full">
        <div className="grid grid-cols-12 gap-4">
            {/* Panel izquierdo: Información principal */}
            <div className="col-span-12 md:col-span-7 space-y-3">
            {/* Nombre del producto */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Nombre:</label>
                <input
                type="text"
                placeholder="Nombre del producto"
                value={nuevoItem.nombre}
                onChange={(e) => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
                className="bg-white text-black placeholder-gray-400 border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            
            {/* Precio y Categoría */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Precio:</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={nuevoItem.precio}
                    onChange={(e) => setNuevoItem({ ...nuevoItem, precio: e.target.value })}
                    className="border bg-white text-black placeholder-gray-400 p-2 pl-8 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    />
                </div>
                </div>
                
                <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Categoría:</label>
                <div className="relative">
                    <select
                    value={nuevoItem.categoriaId}
                    onChange={(e) => setNuevoItem({ ...nuevoItem, categoriaId: e.target.value })}
                    className="border bg-white text-black p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                    > 
                    <option value="">Seleccionar</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Descripción */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Descripción:</label>
                <textarea
                placeholder="Describe el producto en detalle..."
                value={nuevoItem.descripcion}
                onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                className="border bg-white align-text-top text-black placeholder-gray-400 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
            </div>
            
            {/* Etiquetas dietéticas */}
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                <label className="block text-gray-700 text-sm font-bold mb-2">Etiquetas dietéticas:</label>
                <div className="text-black grid grid-cols-2 gap-2">
                <label className="inline-flex items-center p-1 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <input 
                    type="checkbox" 
                    name="tag" 
                    value="GF" 
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={nuevoItem.tag?.includes('GF')}
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
                    checked={nuevoItem.tag?.includes('Veg')}
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
                    checked={nuevoItem.tag?.includes('V')}
                    onChange={(e) => handleTagChange(e)}
                    />
                    <span className="ml-1 text-sm">Vegano</span>
                </label>

                <label className="inline-flex items-center p-1 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <input 
                    type="checkbox" 
                    name="tag" 
                    value="SF" 
                    className="form-checkbox h-4 w-4 text-red-600 rounded"
                    checked={nuevoItem.tag?.includes('SF')}
                    onChange={(e) => handleTagChange(e)}
                    />
                    <span className="ml-1 text-sm">Sin TACC</span>
                </label>
                </div>
            </div>
            </div>
            
            {/* Panel derecho: Imágenes */}
            <div className="col-span-12 md:col-span-5">
            <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                <h3 className="text-gray-700 text-sm font-bold">Imágenes del producto</h3>
                <span className="text-xs text-gray-500">{imagenesPreview.length}/5</span>
                </div>

                {/* Carrusel de imágenes */}
                {imagenesPreview.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {imagenesPreview.map((img, index) => (
                    <div key={index} className="relative h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                        src={img.preview} 
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">No hay imágenes</p>
                    </div>
                </div>
                )}

                {/* Botón para agregar imágenes */}
                <div className="mt-2">
                <label 
                    className={`cursor-pointer flex items-center justify-center w-full py-2 px-3 rounded-lg text-sm ${
                    imagenesPreview.length >= 5 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {imagenesPreview.length >= 5 ? 'Límite alcanzado' : 'Añadir imágenes'}
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    multiple
                    disabled={imagenesPreview.length >= 5}
                    />
                </label>
                <p className="text-xs text-gray-500 mt-1 text-center">Máx. 5 imágenes - 2MB c/u</p>
                </div>
            </div>
            </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3 pt-3 mt-2 border-t border-gray-100">
            <button 
            type="button" 
            onClick={() => {setMostrarModal(false); handleCloseModal()}}
            className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg w-1/2 hover:bg-gray-200 font-medium text-sm"
            >
            Cancelar
            </button>
            <button 
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg w-1/2 hover:from-blue-600 hover:to-blue-800 font-medium shadow-sm text-sm"
            onClick={nuevoItem.id ? handleUpdate() : handleSubmit()}
            >
            {nuevoItem.id ? "Actualizar" : "Añadir"}
            </button>
        </div>
    </form>
)}

export default itemMod;