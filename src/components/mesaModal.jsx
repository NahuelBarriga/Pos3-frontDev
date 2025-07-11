import Modal from './modal'
import { useState } from 'react';
import { verificarMesaDisponible } from '../services/carritoHelper';
import { toast } from "react-toastify";


function MesaModal({ visible, infoMesa, onSetMesaInfo, onClose }) {
  const [mesaError, setMesaError] = useState("");
  const [verificandoMesa, setVerificandoMesa] = useState(false);
  const [mesaInfo, setMesaInfo] = useState(infoMesa);


  const handleConfirmMesa = async () => {
    // Validar entrada
    if (mesaInfo.tipo === "mesa" && (!mesaInfo.numero || isNaN(parseInt(mesaInfo.numero)))) {
      setMesaError("Por favor, ingrese un número de mesa válido");
      toast.error("Por favor, ingrese un número de mesa válido");
      return;
    }

    setVerificandoMesa(true);
    setMesaError("");
    try {
      let response;
      if (mesaInfo.tipo === "mesa") {
        response = await verificarMesaDisponible(mesaInfo.numero);
        console.log(response)
      } else {
        response = true;
      }

      if (response.status === 200) {
        // Guardar la info de mesa en localStorage para que persista
        sessionStorage.setItem('mesaInfo', JSON.stringify(response.data));
        // Continuar con el modal de cantidad
        handleClose();
      } else {
        setMesaError("La mesa no está disponible o no existe");
        toast.error("La mesa no está disponible o no existe");
      }
    } catch (error) {
      console.error("Error al verificar mesa:", error);
      setMesaError("Error al verificar disponibilidad");
      toast.error("Error al verificar disponibilidad");
    } finally {
      setVerificandoMesa(false);
    }
  };


  const handleClose = () => {
    onSetMesaInfo(mesaInfo);
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${visible ? 'block' : 'hidden'}`}>
      <Modal
        titulo={mesaInfo.tipo ? "Cambiar ubicación" : "¿Dónde estás disfrutando Pixel Café?"}
        
      >
        <div onClick={e => e.stopPropagation()} className="p-4">
          <div className="mb-4">
            <div className="flex gap-3 mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg ${mesaInfo.tipo === 'mesa' ? 'bg-naranja text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setMesaInfo({ ...mesaInfo, tipo: 'mesa' })}
              >
                En mesa
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg ${mesaInfo.tipo === 'delivery' ? 'bg-naranja text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setMesaInfo({ ...mesaInfo, tipo: 'delivery' })}
              >
                Delivery
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg ${mesaInfo.tipo === 'takeaway' ? 'bg-naranja text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setMesaInfo({ ...mesaInfo, tipo: 'takeway' })}
              >
                Para llevar
              </button>
            </div>

            {mesaInfo.tipo === 'mesa' && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Número de mesa:</label>
                <input
                  type="number"
                  placeholder="Ej: 5"
                  value={mesaInfo.numero}
                  onChange={(e) => setMesaInfo({ ...mesaInfo, numero: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-naranja bg-transparent"
                />
              </div>
            )}

            {mesaInfo.tipo === 'delivery' && (
              <div className="p-4 border rounded bg-gray-50">
                <p className="text-sm text-gray-600">
                  Para delivery, completa los datos de envío al finalizar tu pedido en el carrito.
                </p>
              </div>
            )}

            {mesaError && (
              <p className="text-red-500 text-sm mt-2">{mesaError}</p>
            )}
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <button
              className="w-1/2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              onClick={() => {
                onClose();
                //setCantidadModalItem(null);
              }}
            >
              Cancelar
            </button>

            <button
              className="w-1/2 bg-naranja text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              onClick={handleConfirmMesa}
              disabled={verificandoMesa}
            >
              {verificandoMesa ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                  Verificando...
                </span>
              ) : (
                "Continuar"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


export default MesaModal;