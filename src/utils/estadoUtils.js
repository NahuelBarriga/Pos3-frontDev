/**
 * Obtains styling based on pedido state
 * @param {string} estado - The state of the pedido
 * @param {string} type - The type of styling (bg, text, border, summary, badge, card)
 * @returns {string} - The CSS classes for the specified state and type
 */
export const obtenerEstiloEstado = (estado, type = 'bg') => {
  // Default to fallback if estado is invalid
  const validEstados = ['pendiente', 'confirmado', 'rechazado', 'finalizado', 'en preparacion', 'listo', 'pago_pendiente'];
  if (!estado || !validEstados.includes(estado)) {
    estado = 'fallback';
  }
  
  const styles = {
    // Background styles
    bg: {
      pendiente: 'bg-yellow-600',
      confirmado: 'bg-green-600',
      rechazado: 'bg-red-600',
      finalizado: 'bg-blue-600',
      'en preparacion': 'bg-purple-700',
      listo: 'bg-transparent border-2 border-green-500',
      pago_pendiente: 'bg-green-600',
      fallback: 'bg-gray-600'
    },
    // Text styles
    text: {
      pendiente: 'text-yellow-800',
      confirmado: 'text-green-800',
      rechazado: 'text-red-800',
      finalizado: 'text-blue-800',
      'en preparacion': 'text-purple-800',
      listo: 'text-green-800',
      pago_pendiente: 'text-green-800',
      fallback: 'text-gray-800'
    },
    // Border styles
    border: {
      pendiente: 'border-yellow-300',
      confirmado: 'border-green-300',
      rechazado: 'border-red-300',
      finalizado: 'border-blue-300',
      'en preparacion': 'border-purple-300',
      listo: 'border-green-300',
      pago_pendiente: 'border-green-300',
      fallback: 'border-gray-300'
    },
    // Summary styles (detail rows in MesaDetailsPanel)
    summary: {
      pendiente: 'bg-yellow-600',
      confirmado: 'bg-green-600',
      rechazado: 'bg-red-600',
      finalizado: 'bg-transparent border-2 border-blue-500',
      'en preparacion': 'bg-purple-700',
      listo: 'bg-transparent border-2 border-green-500',
      pago_pendiente: 'bg-green-600',
      fallback: 'bg-gray-600'
    },
    // Badge styles (small indicators)
    badge: {
      pendiente: 'bg-yellow-300 text-yellow-800 border border-yellow-400',
      confirmado: 'bg-green-300 text-green-800 border border-green-400',
      rechazado: 'bg-red-300 text-red-800 border border-red-400',
      finalizado: 'bg-blue-300 text-blue-800 border border-blue-200',
      'en preparacion': 'bg-purple-300 text-purple-800 border border-purple-400',
      listo: 'bg-green-300 text-green-800 border border-green-400',
      pago_pendiente: 'bg-green-300 text-green-800 border border-green-400',
      fallback: 'bg-gray-300 text-gray-800 border border-gray-400'
    },
    // Card styles (pedido cards in Comanda)
    card: {
      pendiente: 'bg-yellow-100 border-yellow-400',
      confirmado: 'bg-green-100 border-green-300',
      rechazado: 'bg-red-100 border-red-300',
      finalizado: 'bg-blue-100 border-blue-300',
      'en preparacion': 'bg-purple-100 border-purple-300',
      listo: 'bg-green-100 border-green-300',
      pago_pendiente: 'bg-green-100 border-green-300',
      fallback: 'bg-gray-100 border-gray-300'
    }
  };
  
  return styles[type][estado] || styles[type].fallback;
};
