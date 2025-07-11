import { BadgeDollarSign, Plus, ArchiveX, Trash2 } from 'lucide-react';
import Section from './Section';

export default function PaymentConfig({ 
  mediosPago,
  newPaymentMethodDesc,
  setNewPaymentMethodDesc,
  newPaymentMethodRef,
  setNewPaymentMethodRef,
  expandedSections,
  toggleSection,
  handleAddMedioPago,
  handleInabilitarMedioPago,
  handleEliminarMedioPago
}) {
  return (
    <Section
      title="Configuración de pagos"
      icon={<BadgeDollarSign />}
      isExpanded={expandedSections.PagoSettings}
      toggleExpand={() => toggleSection('PagoSettings')}
    >
      <form className="space-y-4" onSubmit={handleAddMedioPago}>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-black">Medios de pago disponibles</h3>
          <div className="flex flex-col space-y-2">
            {!mediosPago || mediosPago?.length === 0 ? (
              <p className="text-gray-500 italic">No hay medios de pago configurados</p>
            ) : (
              <ul className="border rounded-xl divide-y">
                {mediosPago?.map((medio, index) => (
                  <li key={medio?.id} className="flex justify-between items-center p-3">
                    <div className='flex flex-col justify-between '>
                      <span className={medio?.activo ? 'text-black' : 'text-gray-400'}> {medio?.nombre} - {medio?.ref}</span>
                      <span className={` ${medio?.activo ? 'text-green-600' : 'text-red-600'}`}> {medio?.activo ? 'Activo' : 'No activo'} </span>
                    </div>
                    <div className='flex'>
                      <button
                        type="button"
                        onClick={() => handleInabilitarMedioPago(medio?.id)}
                        className="text-gray-500 bg-transparent hover:text-blue-700"
                      >
                        <ArchiveX size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarMedioPago(medio?.id)}
                        className="text-gray-500 bg-transparent hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-grow w-full">
            <label htmlFor="newPaymentMethod" className="block text-sm text-black font-medium text-gray-700 mb-1">
              Nuevo medio de pago
            </label>
            <div className='flex flex-row gap-2'>
              <input
                type="text"
                id="newPaymentMethodDesc"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                value={newPaymentMethodDesc}
                onChange={(e) => setNewPaymentMethodDesc(e.target.value)}
                placeholder="Tipo (Ej. Tarjeta, Transferencia, etc.)"
              />
              <input
                type="text"
                id="newPaymentMethodRef"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                value={newPaymentMethodRef}
                onChange={(e) => setNewPaymentMethodRef(e.target.value)}
                placeholder="Ref. Número de cuenta, etc."
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddMedioPago}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center h-10"
          >
            <Plus size={18} className="mr-1" /> Agregar
          </button>
        </div>
      </form>
    </Section>
  );
}
