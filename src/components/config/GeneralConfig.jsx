import { Coffee } from 'lucide-react';
import Section from './Section';
import FormField from './FormField';

export default function GeneralConfig({ 
  cafeConfig, 
  expandedSections, 
  toggleSection, 
  handleCafeConfigChange 
}) {
  return (
    <Section
      title="Información del Café"
      icon={<Coffee />}
      isExpanded={expandedSections.cafeSettings}
      toggleExpand={() => toggleSection('cafeSettings')}
    >
      <form className="space-y-4">
        <FormField
          label="Nombre del café"
          type="text"
          name="cafeName"
          value={cafeConfig.nombreCafe || ''}
          onChange={handleCafeConfigChange}
        />
        <FormField
          label="Dirección"
          type="text"
          name="cafeDir"
          value={cafeConfig.direccion || ''}
          onChange={handleCafeConfigChange}
        />
        <FormField
          label="Telefono"
          type="text"
          name="cafeTelefono"
          value={cafeConfig.telefono || ''}
          onChange={handleCafeConfigChange}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Hora de apertura"
            type="time"
            name="openingTime"
            value={cafeConfig.horarioApertura || ''}
            onChange={handleCafeConfigChange}
          />
          <FormField
            label="Hora de cierre"
            type="time"
            name="closingTime"
            value={cafeConfig.horarioCierre || ''}
            onChange={handleCafeConfigChange}
          />
          <FormField
            label="Hora de cierre de cocina"
            type="time"
            name="cocinaClosingTime"
            value={cafeConfig.horarioCierreCocina || ''}
            onChange={handleCafeConfigChange}
          />
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="horarioCortado"
            name="horarioCortado"
            checked={cafeConfig.horarioCortado || false}
            onChange={handleCafeConfigChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="horarioCortado" className="ml-2 block text-sm text-gray-700">
            Horario cortado
          </label>
        </div>

        {cafeConfig.horarioCortado && (
          <div className="mt-4 border-t pt-4 border-gray-200">
            <h4 className="text-md font-medium mb-3 text-gray-700">Segundo horario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Hora de apertura (2)"
                type="time"
                name="openingTime2"
                value={cafeConfig.horarioApertura2 || ''}
                onChange={handleCafeConfigChange}
              />
              <FormField
                label="Hora de cierre (2)"
                type="time"
                name="closingTime2"
                value={cafeConfig.horarioCierre2 || ''}
                onChange={handleCafeConfigChange}
              />
              <FormField
                label="Hora de cierre de cocina (2)"
                type="time"
                name="cocinaClosingTime2"
                value={cafeConfig.horarioCierreCocina2 || ''}
                onChange={handleCafeConfigChange}
              />
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-4 border-gray-200">
          <h4 className="text-md font-medium mb-3 text-gray-700">Configuración de Aprobaciones</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="aprobacionAutomaticaPedidos"
                name="aprobacionAutomaticaPedidos"
                checked={cafeConfig.aprobacionAutomaticaPedidos || false}
                onChange={handleCafeConfigChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="aprobacionAutomaticaPedidos" className="ml-2 block text-sm text-gray-700">
                Aprobación automática de pedidos
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="aprobacionAutomaticaReservas"
                name="aprobacionAutomaticaReservas"
                checked={cafeConfig.aprobacionAutomaticaReservas || false}
                onChange={handleCafeConfigChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="aprobacionAutomaticaReservas" className="ml-2 block text-sm text-gray-700">
                Aprobación automática de reservas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificacionesEmail"
                name="notificacionesEmail"
                checked={cafeConfig.notificacionesEmail || false}
                onChange={handleCafeConfigChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notificacionesEmail" className="ml-2 block text-sm text-gray-700">
                Notificaciones por email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="permitirCancelaciones"
                name="permitirCancelaciones"
                checked={cafeConfig.permitirCancelaciones || false}
                onChange={handleCafeConfigChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="permitirCancelaciones" className="ml-2 block text-sm text-gray-700">
                Permitir cancelaciones de clientes
              </label>
            </div>
          </div>
        </div>
      </form>
    </Section>
  );
}
