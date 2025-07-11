import Mesa from './mesa.jsx'
import BackgroundEditor from './BackgroundEditor.jsx';
import { useEffect, useState, useRef } from 'react';

function LayoutCanvas({ 
  floorPlan, 
  mesas, 
  onMoveMesa, 
  onSelectMesa, 
  onOpenEditModal, 
  interactivo, 
  selectedMesaId, 
  user,
  isEditingBackground,
  onSaveBackground,
  onCancelBackgroundEdit
}) {
    const [svgLines, setSvgLines] = useState([]);
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 1000, height: 500 });
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        // Actualizar tamaño inicial
        updateSize();

        // Actualizar tamaño en redimensión
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    // Parse SVG lines from floorPlan if it's SVG data
    useEffect(() => {
        if (floorPlan && typeof floorPlan === 'object' && Array.isArray(floorPlan.lines)) {
            setSvgLines(floorPlan.lines);
        } else {
            setSvgLines([]);
        }
    }, [floorPlan]);

    const handleSaveBackground = (lines) => {
        setSvgLines(lines);
        onSaveBackground(lines, floorPlan.descripcion || '');
    };

    const handleRealTimeChange = (lines) => {
        setSvgLines(lines);
    };

    return (
        <div
            ref={containerRef}
            className="relative bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden w-full"
            style={{
                height: '100%',
                minHeight: '250px'
            }}
        >
            {/* Section Title */}
            {floorPlan.descripcion && (
                <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 px-2 py-1 rounded text-xs text-white z-10">
                    {floorPlan.descripcion}
                </div>
            )}
            
            {/* SVG Background */}
            <svg className="absolute inset-0 w-full h-full">
                {svgLines.map((line, index) => (
                    <line
                        key={`bg-line-${index}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="#fff"
                        strokeWidth={line.strokeWidth || 2}
                    />
                ))}
            </svg>

            {/* Background Editor */}
            <BackgroundEditor
                isActive={isEditingBackground}
                onSave={handleSaveBackground}
                onCancel={onCancelBackgroundEdit}
                onChange={handleRealTimeChange}
                initialLines={svgLines}
                containerSize={containerSize}
            />

            {/* Mesas */}
            {mesas.map((mesa) => (
                <Mesa
                    key={mesa.id}
                    mesa={mesa}
                    onMove={onMoveMesa}
                    selected={mesa.id === selectedMesaId}
                    onSelect={onSelectMesa}
                    onOpenEditModal={onOpenEditModal}
                    interactivo={interactivo && !isEditingBackground}
                    containerSize={containerSize}
                    user={user}
                />
            ))}
        </div>
    );
}

export default LayoutCanvas;