import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';

const AddFloorModal = ({ visible, onClose, onSave, buttonRef }) => {
  const [description, setDescription] = useState('');
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const modalWidth = 280; // Match the actual modal width
      
      // Position directly below the button, centered
      let left = buttonRect.left + (buttonRect.width / 2) - (modalWidth / 2);
      let top = buttonRect.bottom + 8;
      
      // Keep within viewport
      const viewportWidth = window.innerWidth;
      if (left < 10) left = 10;
      if (left + modalWidth > viewportWidth - 10) left = viewportWidth - modalWidth - 10;
      
      setPosition({ top, left });
    }
  }, [visible, buttonRef]);

  useEffect(() => {
    if (visible) {
      setDescription('');
    }
  }, [visible]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDescription = description.trim() || `Sección ${Date.now()}`;
    onSave(finalDescription);
  };

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '280px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Arrow pointing up */}
        <div 
          className="absolute border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"
          style={{
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        
        <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 w-full">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nombre de la sección"
            autoFocus
            maxLength={30}
          />
          
          <div className="flex gap-1 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={14} />
            </button>
            <button 
              type="submit" 
              className={`p-1.5 rounded transition-colors ${
                !description.trim()
                  ? 'text-gray-500 bg-gray-700 cursor-not-allowed'
                  : 'text-green-400 hover:text-green-300 hover:bg-gray-700'
              }`}
              disabled={!description.trim()}
            >
              <Plus size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default AddFloorModal;
