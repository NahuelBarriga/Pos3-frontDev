// import React, { useState, useRef, useEffect } from 'react';
// // import { useDrag, useDrop } from 'react-dnd';
// import { useAuth } from '../context/authContext';
// import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Coffee, Calendar, Edit, Check, Plus, Trash2, XCircle, Save, AlertCircle } from 'lucide-react';

// // Componente Mesa
// export const Mesa = ({ mesa, onMove, selected, onSelect, onOpenEditModal, interactivo = true }) => {
//   const {user} = useAuth();
//   // const ref = useRef(null);
//   // const [{ isDragging }, drag] = useDrag(() => ({
//   //   type: 'mesa',
//   //   item: { id: mesa.id },
//   //   collect: (monitor) => ({ isDragging: monitor.isDragging() }),
//   //   canDrag: () => interactivo && !(mesa.estado === 'no disponible' && user.cargo !== 'admin')
//   // }));

//   const getColor = () => {
//     switch (mesa.estado) {
//       case 'ocupada': return 'bg-red-600';
//       case 'reservada': return 'bg-yellow-500';
//       case 'no disponible': return 'bg-gray-300';
//       case 'disponible': return 'bg-green-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (!selected) return;
//       if (!interactivo) return;
//       if (mesa.estado === 'no disponible' && user.cargo !== 'admin') return;
      
//       if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
//         e.preventDefault();

//         // Safely extract x and y, handling both array and object locacion
//         let x, y;
//         if (Array.isArray(mesa.locacion)) {
//           [x, y] = mesa.locacion;
//         } else {
//           x = mesa.locacion.x;
//           y = mesa.locacion.y;
//         }

//         switch (e.key) {
//           case 'ArrowUp': y -= 10; break;
//           case 'ArrowDown': y += 10; break;
//           case 'ArrowLeft': x -= 10; break;
//           case 'ArrowRight': x += 10; break;
//           default: return;
//         }
        
//         onMove(mesa.id, [x, y]);
//       }
//     };

//     if (selected && interactivo) window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [selected, mesa, onMove, user, interactivo]);

//   const handleSingleClick = () => {
//     if (interactivo) {
//       onSelect(mesa);
//     } else {
//       onSelect(mesa); // Ahora selecciona la mesa para mostrar detalles en el panel derecho
//     }
//   };

//   const handleDoubleClick = () => {
//     if (interactivo) {
//       onOpenEditModal(mesa);
//     } else {
//       onOpenEditModal(mesa); // Abre modal para cambiar estado (ocupada/disponible)
//     }
//   };

//   return (
//     <div
//       // ref={(node) => {
//       //   drag(node);
//       //   ref.current = node;
//       // }}
//       className={`absolute rounded border-2 border-gray-400 p-2 shadow-md flex flex-col items-center justify-center transition-all 
//                   ${selected ? 'ring-2 ring-blue-500' : ''} ${getColor()} 
//                   ${(!interactivo || (mesa.estado === 'no disponible' && user.cargo !== 'admin')) ? 'cursor-pointer' : 'cursor-move'}`}
//       style={{
//         left: `${Array.isArray(mesa.locacion) ? mesa.locacion[0] : mesa.locacion.x}px`,
//         top: `${Array.isArray(mesa.locacion) ? mesa.locacion[1] : mesa.locacion.y}px`,
//         // opacity: isDragging ? 0.5 : 1,
//         width: mesa.width || '80px',
//         height: mesa.height || '80px',
//         zIndex: 10
//       }}
//       onClick={handleSingleClick}
//       onDoubleClick={handleDoubleClick}
//       tabIndex={0}
//     >
//       <span className="font-bold text-gray-100">Mesa {mesa.numero || mesa.id}</span>
//       {mesa.estado === 'ocupada' && mesa.pedido && mesa.pedido.estado === 'pendiente' && (
//         <div className="flex items-center mt-1 text-gray-200">
//           <Coffee size={16} />
//           <span className="ml-1">!!</span>
//         </div>
//       )}
//       {mesa.estado === 'ocupada' && mesa.pedido && mesa.pedido.estado === 'aprobado' && (
//         <div className="flex items-center mt-1 text-gray-200">
//           <Coffee size={16} />
//         </div>
//       )}
//       {mesa.estado === 'reservada' && (
//         <div className="flex items-center mt-1 text-gray-200">
//           <Calendar size={16} />
//         </div>
//       )}
//     </div>
//   );
// };

// // Componente LayoutCanvas
// export const LayoutCanvas = ({ floorPlan, mesas, onMoveMesa, onSelectMesa, onOpenEditModal, interactivo, selectedMesaId }) => {
//   const {user} = useAuth();
//   // const containerRef = useRef(null);
//   // const [, drop] = useDrop(() => ({
//   //   accept: 'mesa',
//   //   drop: (item, monitor) => {
//   //     const delta = monitor.getDifferenceFromInitialOffset();
//   //     console.log("delta",delta); //!sacar
//   //     const mesa = mesas.find((m) => m.id === item.id);
//   //     console.log('mesas',mesas); //!sacar
//   //     console.log('mesa',mesa); //!sacar
//   //     if (mesa) {
//   //       const newX = Math.round(mesa.locacion.x + delta.x);
//   //       const newY = Math.round(mesa.locacion.y + delta.y);
//   //       console.log("newX",newX); //!sacar
//   //       onMoveMesa(item.id, [newX, newY]);
//   //     }
//   //   }
//   // }));

//   return (
//     <div
//       // ref={drop}
//       className="relative bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden"
//       style={{ width: '100%', height: '500px' }}
//     >
//       {floorPlan && (
//         <img
//           src={floorPlan}
//           alt="Plano del local"
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       )}
//       {mesas.map((mesa) => (
//         <Mesa
//           key={mesa.id}
//           mesa={mesa}
//           onMove={onMoveMesa}
//           selected={mesa.id === selectedMesaId}  // Compare mesa.id with selectedMesaId
//           onSelect={onSelectMesa}
//           onOpenEditModal={onOpenEditModal}
//           interactivo={interactivo}
//         />
//       ))}
//     </div>
//   );
// };

// // Modal para editar atributos de la mesa
// export const MesaEditModal = ({ visible, onClose, mesa, onSave, floorPlansLenght }) => {
//   const [mesaEdit, setMesaEdit] = useState({...mesa});
  
//   useEffect(() => {
//     if (visible && mesa) {
//       setMesaEdit({...mesa});
//     }
//   }, [visible, mesa]);

//   if (!visible || !mesa) return null;

//   const handleChange = (e) => {
//     setMesaEdit({ ...mesaEdit, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(mesaEdit);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96">
//         <h2 className="text-xl font-bold mb-2">Editar Mesa #{mesaEdit.numero || ''}</h2>
//         <div className="text-sm text-gray-400 ml-2 mb-4">
//           {mesaEdit.locacion ? 
//             `Posición: [${Array.isArray(mesaEdit.locacion) ? 
//             mesaEdit.locacion.join(',') : 
//             mesaEdit.locacion.x + ',' + mesaEdit.locacion.y}]` 
//             : ``}
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Número</label>
//             <input
//               type="text"
//               name="numero"
//               value={mesaEdit.numero || ''}
//               onChange={handleChange}
//               className="w-full p-2 rounded bg-gray-700 text-gray-100"
//             />
//           </div>
//           {floorPlansLenght > 0 && (
//             <div className="mb-4">
//               <label className="block text-sm mb-1">Piso</label>
//               <input
//                 type="text"
//                 name="piso"
//                 value={mesaEdit.piso || ''}
//                 onChange={handleChange}
//                 max={floorPlansLenght - 1}
//                 className="w-full p-2 rounded bg-gray-700 text-gray-100"
//                 placeholder="Ej. 1, 2, etc."
//               />
//             </div>
//           )}
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Estado</label>
//             <select
//               name="estado"
//               value={mesaEdit.estado || 'disponible'}
//               onChange={handleChange}
//               className="w-full p-2 rounded bg-gray-700 text-gray-100"
//             >
//               <option value="disponible">Disponible</option>
//               <option value="no disponible">No Disponible</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Tamaño</label>
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 name="width"
//                 value={mesaEdit.width?.replace('px', '') || '80'}
//                 onChange={(e) => setMesaEdit({...mesaEdit, width: `${e.target.value}px`})}
//                 className="w-1/2 p-2 rounded bg-gray-700 text-gray-100"
//                 placeholder="Ancho (px)"
//               />
//               <input
//                 type="number"
//                 name="height"
//                 value={mesaEdit.height?.replace('px', '') || '80'}
//                 onChange={(e) => setMesaEdit({...mesaEdit, height: `${e.target.value}px`})}
//                 className="w-1/2 p-2 rounded bg-gray-700 text-gray-100"
//                 placeholder="Alto (px)"
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
//               Cancelar
//             </button>
//             <button 
//               onClick={handleSubmit}
//               type="submit" className="px-4 py-2 bg-green-700 rounded hover:bg-green-600">
//               Guardar
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Modal para cambiar estado rápido (ocupada/disponible/reservada)
// export const MesaStatusModal = ({ visible, onClose, mesa, onUpdateEstado }) => {
//   const [nuevoEstado, setNuevoEstado] = useState(mesa?.estado || 'disponible');

//   useEffect(() => {
//     if (visible && mesa) {
//       setNuevoEstado(mesa.estado || 'disponible');
//     }
//   }, [visible, mesa]);

//   if (!visible || !mesa) return null;

//   const handleSubmit = () => {
//     onUpdateEstado(mesa.id, nuevoEstado);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-80">
//         <h2 className="text-xl font-bold mb-4">Cambiar estado - Mesa {mesa.numero || mesa.id}</h2>
//         <div className="mb-4">
//           <label className="block text-sm mb-2">Estado de la mesa</label>
//           <select
//             value={nuevoEstado}
//             onChange={(e) => setNuevoEstado(e.target.value)}
//             className="w-full p-2 rounded bg-gray-700 text-gray-100"
//           >
//             <option value="disponible">Disponible</option>
//             <option value="ocupada">Ocupada</option>
//             <option value="reservada">Reservada</option>
//             <option value="no disponible">No Disponible</option>
//           </select>
//         </div>
//         <div className="flex justify-end gap-3 mt-4">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
//             Cancelar
//           </button>
//           <button 
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-green-700 rounded hover:bg-green-600">
//             Guardar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Modal para gestión de pedidos
// export const OrderModal = ({ visible, onClose, mesa, onUpdatePedido, onMigrarMesa }) => {
//   const [pedido, setPedido] = useState(mesa?.pedido || {});

//   useEffect(() => {
//     if (visible && mesa) {
//       setPedido(mesa.pedido || {});
//     }
//   }, [visible, mesa]);

//   if (!visible || !mesa) return null;

//   const handleChange = (e) => {
//     setPedido({ ...pedido, [e.target.name]: e.target.value });
//   };

//   const handleAddOrModify = () => {
//     onUpdatePedido(mesa.id, pedido);
//   };

//   const handleAceptar = () => {
//     onUpdatePedido(mesa.id, { ...pedido, estado: 'aprobado' });
//   };

//   const handleRechazar = () => {
//     onUpdatePedido(mesa.id, { ...pedido, estado: 'rechazado' });
//   };

//   const handleMigrar = () => {
//     onMigrarMesa(mesa.id);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96">
//         <h2 className="text-xl font-bold mb-4">Pedido - Mesa {mesa.numero || mesa.id}</h2>
//         <div className="mb-4">
//           <label className="block text-sm mb-1">Detalles del Pedido</label>
//           <textarea
//             name="detalles"
//             value={pedido.detalles || ''}
//             onChange={handleChange}
//             className="w-full p-2 rounded bg-gray-700 text-gray-100"
//             placeholder="Ingrese detalles..."
//             rows={4}
//           />
//         </div>
//         <div className="flex justify-between items-center">
//           <button onClick={handleAddOrModify} className="bg-blue-600 p-2 rounded hover:bg-blue-500">Guardar</button>
//           <button onClick={handleAceptar} className="bg-green-600 p-2 rounded hover:bg-green-500">Aceptar</button>
//           <button onClick={handleRechazar} className="bg-red-600 p-2 rounded hover:bg-red-500">Rechazar</button>
//           <button onClick={handleMigrar} className="bg-yellow-600 p-2 rounded hover:bg-yellow-500">Migrar</button>
//         </div>
//         <button onClick={onClose} className="mt-4 w-full bg-gray-600 p-2 rounded hover:bg-gray-500">Cerrar</button>
//       </div>
//     </div>
//   );
// };

// // Panel de detalles de mesa
// export const MesaDetailsPanel = ({ mesa, onUpdatePedido, onMigrarMesa, onOpenOrderModal }) => {
//   if (!mesa) return (
//     <div className="bg-gray-800 border border-gray-700 rounded-md p-4 h-full flex flex-col items-center justify-center text-gray-400">
//       <Coffee size={48} className="mb-2 opacity-50" />
//       <p>Seleccione una mesa para ver detalles</p>
//     </div>
//   );

//   return (
//     <div className="bg-gray-800 border border-gray-700 rounded-md p-4 h-full overflow-y-auto">
//       <h2 className="text-xl font-bold mb-4 text-gray-100">Mesa #{mesa.numero || mesa.id}</h2>
      
//       <div className="mb-4 p-2 bg-gray-700 rounded-md">
//         <div className="flex justify-between items-center">
//           <div className="font-semibold text-gray-100">Estado:</div>
//           <div className={`px-2 py-1 rounded text-white ${
//             mesa.estado === 'disponible' ? 'bg-green-500' : 
//             mesa.estado === 'ocupada' ? 'bg-red-600' : 
//             mesa.estado === 'reservada' ? 'bg-yellow-500' : 'bg-gray-300'
//           }`}>
//             {mesa.estado?.charAt(0).toUpperCase() + mesa.estado?.slice(1) || 'No definido'}
//           </div>
//         </div>
//       </div>
      
//       {mesa.pedido && (
//         <div className="mt-4">
//           <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-700">Detalles del Pedido</h3>
//           <div className="p-3 bg-gray-700 rounded-md mb-2">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-gray-300">Estado:</span>
//               <span className={`px-2 py-1 rounded text-xs ${
//                 mesa.pedido.estado === 'pendiente' ? 'bg-yellow-600' : 
//                 mesa.pedido.estado === 'aprobado' ? 'bg-green-600' : 
//                 mesa.pedido.estado === 'rechazado' ? 'bg-red-600' : 'bg-gray-600'
//               }`}>
//                 {mesa.pedido.estado?.toUpperCase() || 'No definido'}
//               </span>
//             </div>
            
//             <h4 className="text-sm font-semibold text-gray-300 mt-2">Contenido:</h4>
//             <p className="p-2 bg-gray-800 rounded mt-1 text-gray-300 text-sm">
//               {mesa.pedido.detalles || "Sin detalles."}
//             </p>
//           </div>
          
//           <div className="mt-4 flex flex-col gap-2">
//             <div className="grid grid-cols-2 gap-2">
//               <button 
//                 onClick={() => onUpdatePedido(mesa.id, { ...mesa.pedido, estado: 'aprobado' })} 
//                 className="bg-green-600 p-2 rounded hover:bg-green-500 flex items-center justify-center"
//               >
//                 <Check size={16} className="mr-1" /> Aceptar
//               </button>
//               <button 
//                 onClick={() => onUpdatePedido(mesa.id, { ...mesa.pedido, estado: 'rechazado' })} 
//                 className="bg-red-600 p-2 rounded hover:bg-red-500 flex items-center justify-center"
//               >
//                 <XCircle size={16} className="mr-1" /> Rechazar
//               </button>
//             </div>
//             <button 
//               onClick={() => onOpenOrderModal(mesa)} 
//               className="bg-blue-600 p-2 rounded hover:bg-blue-500 flex items-center justify-center"
//             >
//               <Edit size={16} className="mr-1" /> Editar Pedido
//             </button>
//             <button 
//               onClick={() => onMigrarMesa(mesa.id)} 
//               className="bg-yellow-600 p-2 rounded hover:bg-yellow-500 flex items-center justify-center"
//             >
//               <ArrowRight size={16} className="mr-1" /> Migrar Mesa
//             </button>
//           </div>
//         </div>
//       )}
      
//       {mesa.estado === 'reservada' && (
//         <div className="mt-4">
//           <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-700">Detalles de la Reserva</h3>
//           <div className="p-3 bg-gray-700 rounded-md">
//             <p className="flex items-center text-gray-300">
//               <Calendar size={16} className="mr-2" />
//               {mesa.reserva?.fecha || "Fecha no especificada"}
//             </p>
//             <p className="text-gray-300 mt-2">
//               {mesa.reserva?.cliente || "Cliente no especificado"}
//             </p>
//           </div>
//         </div>
//       )}
      
//       {(mesa.estado === 'disponible' || !mesa.pedido) && mesa.estado !== 'reservada' && (
//         <div className="p-4 flex flex-col items-center justify-center text-gray-400 mt-4">
//           <Coffee size={32} className="mb-2 opacity-50" />
//           <p>Sin pedidos activos</p>
//           <button 
//             onClick={() => onOpenOrderModal(mesa)} 
//             className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 text-white mt-4 flex items-center"
//           >
//             <Plus size={16} className="mr-1" /> Crear Pedido
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Panel de detalles para edición de mesa
// export const MesaEditorPanel = ({ mesa, onSaveMesaEdits, floorPlansLength }) => {
//   const [mesaEdit, setMesaEdit] = useState({...mesa} || {});
  
//   useEffect(() => {
//     if (mesa) {
//       setMesaEdit({...mesa});
//     }
//   }, [mesa]);

//   if (!mesa) return (
//     <div className="bg-gray-800 border border-gray-700 rounded-md p-4 h-full flex flex-col items-center justify-center text-gray-400">
//       <Edit size={48} className="mb-2 opacity-50" />
//       <p>Seleccione una mesa para editar</p>
//     </div>
//   );

//   const handleChange = (e) => {
//     setMesaEdit({ ...mesaEdit, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSaveMesaEdits(mesaEdit);
//   };

//   return (
//     <div className="bg-gray-800 border border-gray-700 rounded-md p-4 h-full overflow-y-auto">
//       <h2 className="text-xl font-bold mb-4 text-gray-100">Editar Mesa #{mesaEdit.numero || mesaEdit.id}</h2>
      
//       <div className="mb-4 p-2 bg-gray-700 rounded-md">
//         <div className="font-semibold text-gray-100 mb-1">Posición actual:</div>
//         <div className="text-gray-300 flex justify-between items-center">
//           <span>X: {Array.isArray(mesaEdit.locacion) ? mesaEdit.locacion[0] : mesaEdit.locacion?.x}</span>
//           <span>Y: {Array.isArray(mesaEdit.locacion) ? mesaEdit.locacion[1] : mesaEdit.locacion?.y}</span>
//         </div>
//       </div>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm mb-1 text-gray-300">Número de Mesa</label>
//           <input
//             type="text"
//             name="numero"
//             value={mesaEdit.numero || ''}
//             onChange={handleChange}
//             className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
//           />
//         </div>
        
//         {floorPlansLength > 0 && (
//           <div>
//             <label className="block text-sm mb-1 text-gray-300">Piso</label>
//             <input
//               type="number"
//               name="piso"
//               value={mesaEdit.piso || '0'}
//               onChange={handleChange}
//               max={floorPlansLength - 1}
//               min={0}
//               className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
//             />
//             <p className="text-xs text-gray-400 mt-1">Pisos disponibles: 0-{floorPlansLength - 1}</p>
//           </div>
//         )}
        
//         <div>
//           <label className="block text-sm mb-1 text-gray-300">Estado</label>
//           <select
//             name="estado"
//             value={mesaEdit.estado || 'disponible'}
//             onChange={handleChange}
//             className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
//           >
//             <option value="disponible">Disponible</option>
//             <option value="no disponible">No Disponible</option>
//             <option value="ocupada">Ocupada</option>
//             <option value="reservada">Reservada</option>
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm mb-1 text-gray-300">Tamaño (px)</label>
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="text-xs text-gray-400">Ancho</label>
//               <input
//                 type="number"
//                 name="width"
//                 value={mesaEdit.width?.replace('px', '') || '80'}
//                 onChange={(e) => setMesaEdit({...mesaEdit, width: `${e.target.value}px`})}
//                 className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-gray-400">Alto</label>
//               <input
//                 type="number"
//                 name="height"
//                 value={mesaEdit.height?.replace('px', '') || '80'}
//                 onChange={(e) => setMesaEdit({...mesaEdit, height: `${e.target.value}px`})}
//                 className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
//               />
//             </div>
//           </div>
//         </div>
        
//         <div className="pt-4 border-t border-gray-700">
//           <button 
//             type="submit"
//             className="w-full bg-green-600 py-2 rounded hover:bg-green-500 flex items-center justify-center"
//           >
//             <Save size={16} className="mr-2" /> Guardar Cambios
//           </button>
//         </div>
//       </form>
      
//       <div className="mt-6 bg-gray-700 p-3 rounded-md">
//         <h3 className="text-sm font-bold text-gray-200 mb-2">Instrucciones de Edición</h3>
//         <ul className="space-y-2 text-xs text-gray-300">
//           <li className="flex items-start">
//             <ArrowUp size={14} className="mr-1 mt-0.5" /> <ArrowDown size={14} className="mr-1 mt-0.5" /> <ArrowLeft size={14} className="mr-1 mt-0.5" /> <ArrowRight size={14} className="mr-1 mt-0.5" /> 
//             Use las flechas del teclado para mover la mesa seleccionada
//           </li>
//           <li className="flex items-start">
//             <Edit size={14} className="mr-1 mt-0.5" /> 
//             Modifique los valores en este panel para cambiar propiedades
//           </li>
//           <li className="flex items-start text-yellow-300">
//             <AlertCircle size={14} className="mr-1 mt-0.5" /> 
//             Recuerde presionar "Guardar Layout" para confirmar todos los cambios
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// // Modal de confirmación para salir sin guardar
// export const UnsavedChangesModal = ({ visible, onCancel, onConfirm }) => {
//   if (!visible) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96">
//         <h2 className="text-xl font-bold mb-4 text-yellow-300 flex items-center">
//           <AlertCircle size={24} className="mr-2" />
//           Cambios no guardados
//         </h2>
//         <p className="mb-6">
//           Tienes cambios en el layout que no han sido guardados. Si sales ahora perderás estos cambios.
//         </p>
//         <div className="flex justify-end gap-3">
//           <button 
//             onClick={onCancel} 
//             className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
//           >
//             Cancelar
//           </button>
//           <button 
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
//           >
//             Salir sin guardar
//           </button>
//           <button 
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
//           >
//             Salir sin guardar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Modal para migrar mesa
// export const MesaMigrationModal = ({ visible, onClose, mesa, mesas, onMigrarPedido }) => {
//   const [mesaDestino, setMesaDestino] = useState('');

//   useEffect(() => {
//     if (visible) {
//       setMesaDestino('');
//     }
//   }, [visible]);

//   if (!visible || !mesa) return null;

//   // Filtrar mesas disponibles (no incluir la mesa actual)
//   const mesasDisponibles = mesas.filter(m => 
//     m.id !== mesa.id && m.estado === 'disponible'
//   );

//   const handleSubmit = () => {
//     if (mesaDestino) {
//       onMigrarPedido(mesa.id, mesaDestino);
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-gray-800 text-gray-100 p-6 rounded-md w-96">
//         <h2 className="text-xl font-bold mb-4">Migrar Pedido - Mesa {mesa.numero || mesa.id}</h2>
        
//         {mesasDisponibles.length === 0 ? (
//           <div className="p-4 bg-gray-700 rounded-md mb-4 text-center">
//             <AlertCircle size={24} className="mx-auto mb-2 text-yellow-400" />
//             <p>No hay mesas disponibles para migrar el pedido.</p>
//           </div>
//         ) : (
//           <>
//             <div className="mb-4">
//               <label className="block text-sm mb-2">Seleccione mesa destino:</label>
//               <select
//                 value={mesaDestino}
//                 onChange={(e) => setMesaDestino(e.target.value)}
//                 className="w-full p-2 rounded bg-gray-700 text-gray-100"
//               >
//                 <option value="">-- Seleccionar Mesa --</option>
//                 {mesasDisponibles.map((m) => (
//                   <option key={m.id} value={m.id}>
//                     Mesa {m.numero || m.id}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <button 
//               onClick={handleSubmit}
//               disabled={!mesaDestino}
//               className={`w-full p-2 rounded mb-4 flex items-center justify-center
//                          ${mesaDestino ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
//             >
//               <ArrowRight size={16} className="mr-2" /> Migrar Pedido
//             </button>
//           </>
//         )}
        
//         <button onClick={onClose} className="w-full bg-gray-600 p-2 rounded hover:bg-gray-500">
//           Cancelar
//         </button>
//       </div>
//     </div>
//   );
// };

// // Componente principal de gestión de mesas
// export const TableManager = () => {
//   const [mesas, setMesas] = useState([]);
//   const [selectedMesa, setSelectedMesa] = useState(null);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [statusModalOpen, setStatusModalOpen] = useState(false);
//   const [orderModalOpen, setOrderModalOpen] = useState(false);
//   const [migrationModalOpen, setMigrationModalOpen] = useState(false);
//   const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
//   const [modoEdicion, setModoEdicion] = useState(false);
//   const [floorPlans, setFloorPlans] = useState(['/floorplan-default.jpg']);
//   const [currentFloor, setCurrentFloor] = useState(0);
//   const [originalMesas, setOriginalMesas] = useState([]);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [exitAction, setExitAction] = useState(null);

//   useEffect(() => {
//     // Cargar mesas desde API o localStorage
//     const storedMesas = localStorage.getItem('mesas');
//     const storedFloorPlans = localStorage.getItem('floorPlans');
    
//     if (storedMesas) {
//       const parsedMesas = JSON.parse(storedMesas);
//       setMesas(parsedMesas);
//       setOriginalMesas(JSON.parse(JSON.stringify(parsedMesas))); // Deep copy
//     } else {
//       // Mesas de ejemplo
//       const exampleMesas = [
//         { id: '1', numero: '1', estado: 'disponible', locacion: [100, 100], width: '80px', height: '80px', piso: 0 },
//         { id: '2', numero: '2', estado: 'ocupada', locacion: [200, 100], width: '80px', height: '80px', piso: 0, 
//           pedido: { detalles: 'Café y medialunas', estado: 'pendiente' } },
//         { id: '3', numero: '3', estado: 'reservada', locacion: [300, 100], width: '80px', height: '80px', piso: 0,
//           reserva: { fecha: '29/03/2025 20:00', cliente: 'Juan Pérez' } }
//       ];
//       setMesas(exampleMesas);
//       setOriginalMesas(JSON.parse(JSON.stringify(exampleMesas))); // Deep copy
//     }
    
//     if (storedFloorPlans) {
//       setFloorPlans(JSON.parse(storedFloorPlans));
//     }
//   }, []);

//   // Detectar cambios en las mesas
//   useEffect(() => {
//     if (modoEdicion && originalMesas.length > 0) {
//       const checkChanges = () => {
//         if (mesas.length !== originalMesas.length) return true;
        
//         for (let i = 0; i < mesas.length; i++) {
//           const mesa = mesas[i];
//           const original = originalMesas.find(m => m.id === mesa.id);
          
//           if (!original) return true;
          
//           // Comparar propiedades relevantes
//           if (mesa.numero !== original.numero) return true;
//           if (mesa.estado !== original.estado) return true;
//           if (mesa.piso !== original.piso) return true;
//           if (mesa.width !== original.width) return true;
//           if (mesa.height !== original.height) return true;
          
//           // Comparar locación
//           const mesaX = Array.isArray(mesa.locacion) ? mesa.locacion[0] : mesa.locacion.x;
//           const mesaY = Array.isArray(mesa.locacion) ? mesa.locacion[1] : mesa.locacion.y;
//           const originalX = Array.isArray(original.locacion) ? original.locacion[0] : original.locacion.x;
//           const originalY = Array.isArray(original.locacion) ? original.locacion[1] : original.locacion.y;
          
//           if (mesaX !== originalX || mesaY !== originalY) return true;
//         }
        
//         return false;
//       };
      
//       setHasChanges(checkChanges());
//     }
//   }, [mesas, originalMesas, modoEdicion]);

//   // Filtrar mesas por piso actual
//   const mesasActuales = mesas.filter(mesa => mesa.piso === currentFloor);

//   const handleMoveMesa = (id, newPosition) => {
//     setMesas(mesas.map(mesa => 
//       mesa.id === id ? {...mesa, locacion: newPosition} : mesa
//     ));
//   };

//   const handleSelectMesa = (mesa) => {
//     setSelectedMesa(mesa);
//   };

//   const handleOpenEditModal = (mesa) => {
//     if (modoEdicion) {
//       setSelectedMesa(mesa);
//       setEditModalOpen(true);
//     } else {
//       setSelectedMesa(mesa);
//       setStatusModalOpen(true);
//     }
//   };

//   const handleSaveMesaEdit = (mesaEditada) => {
//     setMesas(mesas.map(mesa => 
//       mesa.id === mesaEditada.id ? mesaEditada : mesa
//     ));
//     setSelectedMesa(mesaEditada);
//     setEditModalOpen(false);
//   };

//   const handleUpdateEstado = (id, nuevoEstado) => {
//     setMesas(mesas.map(mesa => 
//       mesa.id === id ? {
//         ...mesa, 
//         estado: nuevoEstado,
//         // Si la mesa pasa a estar ocupada y no tiene pedido, crear uno vacío
//         pedido: nuevoEstado === 'ocupada' && !mesa.pedido ? { detalles: '', estado: 'pendiente' } : mesa.pedido,
//         // Si la mesa pasa a estar disponible, eliminar pedido
//         ...((nuevoEstado === 'disponible' && mesa.estado === 'ocupada') ? { pedido: null } : {})
//       } : mesa
//     ));
    
//     // Si no estamos en modo edición, guardar cambios inmediatamente
//     if (!modoEdicion) {
//       localStorage.setItem('mesas', JSON.stringify(
//         mesas.map(mesa => 
//           mesa.id === id ? {
//             ...mesa, 
//             estado: nuevoEstado,
//             pedido: nuevoEstado === 'ocupada' && !mesa.pedido ? { detalles: '', estado: 'pendiente' } : mesa.pedido,
//             ...((nuevoEstado === 'disponible' && mesa.estado === 'ocupada') ? { pedido: null } : {})
//           } : mesa
//         )
//       ));
//     }
//   };

//   const handleUpdatePedido = (id, nuevoPedido) => {
//     setMesas(mesas.map(mesa => 
//       mesa.id === id ? {
//         ...mesa, 
//         pedido: nuevoPedido,
//         estado: nuevoPedido ? 'ocupada' : mesa.estado
//       } : mesa
//     ));
    
//     // Si no estamos en modo edición, guardar cambios inmediatamente
//     if (!modoEdicion) {
//       localStorage.setItem('mesas', JSON.stringify(
//         mesas.map(mesa => 
//           mesa.id === id ? {
//             ...mesa, 
//             pedido: nuevoPedido,
//             estado: nuevoPedido ? 'ocupada' : mesa.estado
//           } : mesa
//         )
//       ));
//     }
//   };

//   const handleOpenOrderModal = (mesa) => {
//     setSelectedMesa(mesa);
//     setOrderModalOpen(true);
//   };

//   const handleOpenMigrationModal = (mesaId) => {
//     const mesa = mesas.find(m => m.id === mesaId);
//     if (mesa) {
//       setSelectedMesa(mesa);
//       setMigrationModalOpen(true);
//     }
//   };

//   const handleMigrarPedido = (origenId, destinoId) => {
//     const mesaOrigen = mesas.find(m => m.id === origenId);
//     const pedido = mesaOrigen?.pedido;
    
//     if (!pedido) return;
    
//     const newMesas = mesas.map(mesa => {
//       if (mesa.id === origenId) {
//         return { ...mesa, estado: 'disponible', pedido: null };
//       } else if (mesa.id === destinoId) {
//         return { ...mesa, estado: 'ocupada', pedido: pedido };
//       }
//       return mesa;
//     });
    
//     setMesas(newMesas);
    
//     // Si no estamos en modo edición, guardar cambios inmediatamente
//     if (!modoEdicion) {
//       localStorage.setItem('mesas', JSON.stringify(newMesas));
//     }
//   };

//   const handleAddMesa = () => {
//     const newId = Date.now().toString();
//     const newMesa = {
//       id: newId,
//       numero: (mesas.length + 1).toString(),
//       estado: 'disponible',
//       locacion: [150, 150],
//       width: '80px',
//       height: '80px',
//       piso: currentFloor
//     };
    
//     setMesas([...mesas, newMesa]);
//     setSelectedMesa(newMesa);
//   };

//   const handleDeleteMesa = () => {
//     if (!selectedMesa) return;
    
//     setMesas(mesas.filter(m => m.id !== selectedMesa.id));
//     setSelectedMesa(null);
//   };

//   const handleSaveLayout = () => {
//     localStorage.setItem('mesas', JSON.stringify(mesas));
//     localStorage.setItem('floorPlans', JSON.stringify(floorPlans));
//     setOriginalMesas(JSON.parse(JSON.stringify(mesas))); // Deep copy
//     setHasChanges(false);
//     alert('Layout guardado correctamente');
//   };

//   const handleToggleMode = () => {
//     if (modoEdicion && hasChanges) {
//       // Si hay cambios sin guardar, mostrar modal de confirmación
//       setUnsavedChangesModalOpen(true);
//       setExitAction(() => () => {
//         setModoEdicion(false);
//         setMesas(JSON.parse(JSON.stringify(originalMesas))); // Restaurar estado original
//         setHasChanges(false);
//         setSelectedMesa(null);
//       });
//     } else {
//       // Si no hay cambios o no estamos en modo edición, cambiar directamente
//       setModoEdicion(!modoEdicion);
//       if (modoEdicion) {
//         setSelectedMesa(null);
//       }
//     }
//   };

//   const handleUnsavedChangesCancel = () => {
//     setUnsavedChangesModalOpen(false);
//     setExitAction(null);
//   };

//   const handleUnsavedChangesConfirm = () => {
//     setUnsavedChangesModalOpen(false);
//     if (exitAction) {
//       exitAction();
//       setExitAction(null);
//     }
//   };

//   const handleChangeFloor = (newFloor) => {
//     if (newFloor >= 0 && newFloor < floorPlans.length) {
//       setCurrentFloor(newFloor);
//       setSelectedMesa(null);
//     }
//   };

//   return (
//     <div className="bg-gray-900 text-gray-100 p-4 h-screen flex flex-col">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
//         <div className="flex items-center gap-4">
//           {floorPlans.length > 1 && (
//             <div className="flex items-center">
//               <span className="mr-2">Piso:</span>
//               <select
//                 value={currentFloor}
//                 onChange={(e) => handleChangeFloor(parseInt(e.target.value))}
//                 className="bg-gray-700 p-2 rounded"
//               >
//                 {floorPlans.map((_, index) => (
//                   <option key={index} value={index}>Piso {index}</option>
//                 ))}
//               </select>
//             </div>
//           )}
          
//           <button 
//             onClick={handleToggleMode}
//             className={`px-4 py-2 rounded ${modoEdicion ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'}`}
//           >
//             {modoEdicion ? 'Modo Empleado' : 'Modo Edición'}
//           </button>
          
//           {modoEdicion && (
//             <button 
//               onClick={handleSaveLayout}
//               className={`px-4 py-2 rounded flex items-center ${hasChanges ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600'}`}
//               disabled={!hasChanges}
//             >
//               <Save size={16} className="mr-2" />
//               Guardar Layout
//               {hasChanges && <span className="ml-1 text-xs">*</span>}
//             </button>
//           )}
//         </div>
//       </div>
      
//       <div className="flex flex-1 gap-4">
//         <div className="flex-1">
//           <LayoutCanvas
//             floorPlan={floorPlans[currentFloor]}
//             mesas={mesasActuales}
//             onMoveMesa={handleMoveMesa}
//             onSelectMesa={handleSelectMesa}
//             onOpenEditModal={handleOpenEditModal}
//             interactivo={modoEdicion}
//             selectedMesaId={selectedMesa?.id}
//           />
          
//           {modoEdicion && (
//             <div className="mt-4 flex gap-2">
//               <button 
//                 onClick={handleAddMesa}
//                 className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 flex items-center"
//               >
//                 <Plus size={16} className="mr-2" /> Añadir Mesa
//               </button>
//               <button 
//                 onClick={handleDeleteMesa}
//                 disabled={!selectedMesa}
//                 className={`px-4 py-2 rounded flex items-center ${selectedMesa ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 cursor-not-allowed'}`}
//               >
//                 <Trash2 size={16} className="mr-2" /> Eliminar Mesa
//               </button>
//             </div>
//           )}
//         </div>
        
//         <div className="w-80">
//           {modoEdicion ? (
//             <MesaEditorPanel 
//               mesa={selectedMesa} 
//               onSaveMesaEdits={handleSaveMesaEdit}
//               floorPlansLength={floorPlans.length}
//             />
//           ) : (
//             <MesaDetailsPanel 
//               mesa={selectedMesa}
//               onUpdatePedido={handleUpdatePedido}
//               onMigrarMesa={handleOpenMigrationModal}
//               onOpenOrderModal={handleOpenOrderModal}
//             />
//           )}
//         </div>
//       </div>
      
//       {/* Modals */}
//       <MesaEditModal
//         visible={editModalOpen}
//         onClose={() => setEditModalOpen(false)}
//         mesa={selectedMesa}
//         onSave={handleSaveMesaEdit}
//         floorPlansLenght={floorPlans.length}
//       />
      
//       <MesaStatusModal
//         visible={statusModalOpen}
//         onClose={() => setStatusModalOpen(false)}
//         mesa={selectedMesa}
//         onUpdateEstado={handleUpdateEstado}
//       />
      
//       <OrderModal
//         visible={orderModalOpen}
//         onClose={() => setOrderModalOpen(false)}
//         mesa={selectedMesa}
//         onUpdatePedido={handleUpdatePedido}
//         onMigrarMesa={handleOpenMigrationModal}
//       />
      
//       <MesaMigrationModal
//         visible={migrationModalOpen}
//         onClose={() => setMigrationModalOpen(false)}
//         mesa={selectedMesa}
//         mesas={mesas}
//         onMigrarPedido={handleMigrarPedido}
//       />
      
//       <UnsavedChangesModal
//         visible={unsavedChangesModalOpen}
//         onCancel={handleUnsavedChangesCancel}
//         onConfirm={handleUnsavedChangesConfirm}
//       />
//     </div>
//   );
// };

// export default TableManager;