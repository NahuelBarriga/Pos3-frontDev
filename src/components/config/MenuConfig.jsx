import { StretchHorizontal, Menu, Plus, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Section from './Section';

export default function MenuConfig({ 
  categorias,
  newCategoria,
  setNewCategoria,
  expandedSections,
  toggleSection,
  handleDragEnd,
  handleSubmitCategoria,
  handleDeleteCategory
}) {
  return (
    <Section
      title="Configuración del Menú"
      icon={<StretchHorizontal />}
      isExpanded={expandedSections.MenuSettings}
      toggleExpand={() => toggleSection('MenuSettings')}
    >
      <form className="space-y-4" onSubmit={handleSubmitCategoria}>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-black">Categorias</h3>
          <div className="flex flex-col space-y-2">
            {categorias?.length === 0 ? (
              <p className="text-gray-500 italic">No hay categorías configuradas</p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="categorias">
                  {(droppableProvider) => (
                    <div
                      ref={droppableProvider.innerRef}
                      {...droppableProvider.droppableProps}
                      className="space-y-2"
                    >
                      {categorias?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((cat, index) => (
                        <Draggable
                          key={cat.id.toString()}
                          draggableId={cat.id.toString()}
                          index={index}
                        >
                          {(draggableProvider) => (
                            <div
                              ref={draggableProvider.innerRef}
                              {...draggableProvider.draggableProps}
                              {...draggableProvider.dragHandleProps}
                              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                            >
                              <div className="flex flex-row items-center gap-4">
                                <Menu size={18} className="text-gray-400 mr-2" />
                                <span className="text-gray-900">{cat.nombre}</span>
                                <span className='text-gray-700 text-sm bg-gray-200 px-2 py-1 rounded-full'>{cat.cant || 0}</span>
                              </div>
                              <div className='flex flex-row items-center gap-2'>
                                <span className="text-xs text-gray-500">Orden: {cat.order || ''}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-gray-500 bg-transparent hover:text-red-700"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {droppableProvider.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-grow w-full">
            <label htmlFor="newCategoria" className="block text-sm text-black font-medium text-gray-700 mb-1">
              Nueva categoría
            </label>
            <div className='flex flex-row gap-2'>
              <input
                type="text"
                id="newCategoria"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                value={newCategoria}
                onChange={(e) => setNewCategoria(e.target.value)}
                placeholder="Nombre de la categoría"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmitCategoria}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center h-10"
          >
            <Plus size={18} className="mr-1" /> Agregar
          </button>
        </div>
      </form>
    </Section>
  );
}
