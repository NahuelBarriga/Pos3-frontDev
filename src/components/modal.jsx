function Modal({ titulo, children, onClose, visible = true }) {
  if (!visible) return null;

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-background") {
      onClose && onClose();
    }
  };

  return (
    <div
      id="modal-background"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg w-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
