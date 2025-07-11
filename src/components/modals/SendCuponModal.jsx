import { useEffect, useState } from "react";
import { getCupones, sendCuponEmail } from "../../services/cuponHelper.js";
import toast from "react-hot-toast";

const SendCuponModal = ({ isOpen, onClose, cupon, email }) => {
  if (!isOpen) return null;
  const [cuponData, setCuponData] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(email || "");
  const [selectedCupon, setSelectedCupon] = useState(cupon || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCupones() {
      const cupones = await getCupones();
      const cuponesActivos = cupones.filter((c) => c.estado !== "inactivo");
      if (cupones && cupones.length > 0) {
        setCuponData(cuponesActivos);
      } else {
        toast.error("No se encontraron cupones disponibles.");
      }
    }
    fetchCupones();

    // Set initial values when modal opens
    setSelectedEmail(email || "");
    setSelectedCupon(cupon || null);
  }, [email, cupon]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!selectedEmail || !selectedEmail.trim()) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    if (!selectedCupon) {
      toast.error("Por favor selecciona un cupón");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedEmail)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await sendCuponEmail(
        selectedEmail,
        selectedCupon.codigo
      );
      if (response.status === 200) {
        toast.success(`Cupón enviado exitosamente a ${selectedEmail}`);
        onClose();
      } else {
        toast.error("Error al enviar el cupón. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error sending coupon:", error);
      toast.error("Error al enviar el cupón. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCuponChange = (cuponId) => {
    const selected = cuponData.find((c) => c.id === parseInt(cuponId));
    setSelectedCupon(selected || null);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Enviar Cupón</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-transparent hover:bg-gray-100 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {cuponData.length > 0 ? (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="email"
                >
                  Email destinatario
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  placeholder="ejemplo@email.com"
                  disabled={email ? true : false}
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="cupon-select"
                >
                  Selecciona un cupón
                </label>
                <select
                  id="cupon-select"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
                  value={selectedCupon?.id || ""}
                  onChange={(e) => handleCuponChange(e.target.value)}
                >
                  <option value="">Selecciona un cupón</option>
                  {cuponData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre || c.codigo || `Cupón #${c.id}`} -{" "}
                      {c.tipo === "porcentaje"
                        ? `${c.descuento}% OFF`
                        : `$${c.descuento}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCupon && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h4 className="font-medium text-blue-800">
                    Cupón seleccionado:
                  </h4>
                  <p className="text-sm text-blue-600">
                    Código: {selectedCupon.codigo}
                  </p>
                  <p className="text-sm text-blue-600">
                    Descuento:{" "}
                    {selectedCupon.tipo === "porcentaje"
                      ? `${selectedCupon.descuento}%`
                      : `$${selectedCupon.descuento}`}
                  </p>
                  {selectedCupon.descripcion && (
                    <p className="text-sm text-blue-600">
                      Descripción: {selectedCupon.descripcion}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              No hay información del cupón disponible.
            </p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedEmail || !selectedCupon}
              className={`px-4 py-2 rounded-md transition-colors ${
                isSubmitting || !selectedEmail || !selectedCupon
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Enviando..." : "Enviar Cupón"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendCuponModal;
