import React, { useState, useEffect } from 'react';

const MesaEditModal = ({ user, visible, onClose, mesa, onSave, floorPlansLenght }) => {
  const [mesaEdit, setMesaEdit] = useState({ ...mesa });

  useEffect(() => {
    if (visible && mesa) {
      setMesaEdit({ ...mesa });
    }
  }, [visible, mesa]);

  if (!visible || !mesa) return null;

  const handleChange = (e) => {
    setMesaEdit({ ...mesaEdit, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(mesaEdit);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-2">Editar Mesa #{mesaEdit.numero || ''}</h2>
        <div className="text-sm text-gray-400 ml-2 mb-4">
          {mesaEdit.locacion ?
            `Posición: [${Array.isArray(mesaEdit.locacion) ?
              mesaEdit.locacion.join(',') :
              mesaEdit.locacion.x + ',' + mesaEdit.locacion.y}]`
            : ``}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm mb-1">Número</label>
            <input
              type="text"
              name="numero"
              value={mesaEdit.numero || ''}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            />
          </div>
          {floorPlansLenght > 0 && (
            <div className="mb-4">
              <label className="block text-sm mb-1">Piso</label>
              <input
                type="text"
                name="piso"
                value={mesaEdit.piso || ''}
                onChange={handleChange}
                min={0}
                className="w-full p-2 rounded bg-gray-700 text-gray-100"
                placeholder="Ej. 1, 2, etc."
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm mb-1">Estado</label>
            <select
              name="estado"
              value={mesaEdit.estado || 'disponible'}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            >
              <option value="disponible">Disponible</option>
              <option value="no disponible">No Disponible</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Tamaño</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="width"
                value={mesaEdit.width?.replace('px', '') || '80'}
                onChange={(e) => handleChange({ target: { name: 'width', value: `${e.target.value}px` } })}
                className="w-1/2 p-2 rounded bg-gray-700 text-gray-100"
                placeholder="Ancho (px)"
              />
              <input
                type="number"
                name="height"
                value={mesaEdit.height?.replace('px', '') || '80'}
                onChange={(e) => handleChange({ target: { name: 'height', value: `${e.target.value}px` } })}
                className="w-1/2 p-2 rounded bg-gray-700 text-gray-100"
                placeholder="Alto (px)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              type="submit" className="px-4 py-2 bg-green-700 rounded hover:bg-green-600">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MesaEditModal;
