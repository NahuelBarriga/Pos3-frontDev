import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Pencil } from 'lucide-react';

const BackgroundEditor = ({ isActive, onSave, onCancel, onChange, initialLines = [], containerSize }) => {
  const [lines, setLines] = useState(initialLines);
  const [currentLine, setCurrentLine] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickTarget, setLastClickTarget] = useState(null);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(2);
  const svgRef = useRef(null);

  // Grid settings
  const gridSize = 20; // Size of grid cells in pixels

  // Stroke width options
  const strokeWidthOptions = [
    { value: 1, label: 'Fino (1px)' },
    { value: 2, label: 'Normal (2px)' },
    { value: 3, label: 'Medio (3px)' },
    { value: 4, label: 'Grueso (4px)' },
    { value: 6, label: 'Muy grueso (6px)' },
    { value: 8, label: 'Extra grueso (8px)' }
  ];

  useEffect(() => {
    setLines(initialLines);
    setHistory([initialLines]);
  }, [initialLines]);

  // Add event listener for keyboard events
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Delete selected line
      if (e.key === 'Delete' && selectedLine !== null) {
        const updatedLines = lines.filter((_, index) => index !== selectedLine);
        saveToHistory(updatedLines);
        setLines(updatedLines);
        setSelectedLine(null);
        // Notify parent component of real-time change
        if (onChange) {
          onChange(updatedLines);
        }
      }

      // Undo with Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && history.length > 1) {
        e.preventDefault();
        const previousState = history[history.length - 2];
        setLines(previousState);
        setHistory(history.slice(0, -1));
        setSelectedLine(null);
        // Notify parent component of real-time change
        if (onChange) {
          onChange(previousState);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, selectedLine, lines, history]);

  const saveToHistory = (newLines) => {
    setHistory([...history, newLines]);
  };

  const getRelativeCoordinates = (event) => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      return {
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const snapToGrid = (coordinate) => {
    return {
      x: Math.round(coordinate.x / gridSize) * gridSize,
      y: Math.round(coordinate.y / gridSize) * gridSize
    };
  };

  const handleMouseDown = (event) => {
    if (!isActive) return;

    event.preventDefault();

    const coords = getRelativeCoordinates(event);
    const lineIndex = findLineNearPoint(coords);
    const currentTime = Date.now();

    // Check for double-click on line
    if (lineIndex !== -1 &&
      lastClickTarget === lineIndex &&
      currentTime - lastClickTime < 300) {
      // Double-click detected - select the line
      setSelectedLine(lineIndex);
      setLastClickTime(0);
      setLastClickTarget(null);
      return;
    }

    // Update click tracking
    setLastClickTime(currentTime);
    setLastClickTarget(lineIndex);

    // Always allow drawing to start
    const snappedCoords = snapToGrid(coords);

    setCurrentLine({
      x1: snappedCoords.x,
      y1: snappedCoords.y,
      x2: snappedCoords.x,
      y2: snappedCoords.y,
      strokeWidth: selectedStrokeWidth
    });

    setIsDragging(true);
    setSelectedLine(null);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !currentLine) return;

    const coords = getRelativeCoordinates(event);
    const snappedCoords = snapToGrid(coords);

    setCurrentLine({
      ...currentLine,
      x2: snappedCoords.x,
      y2: snappedCoords.y
    });
  };

  const handleMouseUp = (event) => {
    if (!isDragging || !currentLine) return;

    // Only add the line if it has some length
    if (currentLine.x1 !== currentLine.x2 || currentLine.y1 !== currentLine.y2) {
      const newLines = [...lines, currentLine];
      setLines(newLines);
      saveToHistory(newLines);
      // Notify parent component of real-time change
      if (onChange) {
        onChange(newLines);
      }
    }

    setCurrentLine(null);
    setIsDragging(false);
  };

  // Find line that's close to a point
  const findLineNearPoint = (point) => {
    const threshold = 10; // Distance in pixels to consider "close" to a line

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const distance = distanceFromPointToLine(
        point,
        { x: line.x1, y: line.y1 },
        { x: line.x2, y: line.y2 }
      );

      if (distance < threshold) {
        return i;
      }
    }

    return -1;
  };

  // Calculate distance from point to line
  const distanceFromPointToLine = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleSave = () => {
    onSave(lines);
  };

  const renderGridLines = () => {
    if (!containerSize) return null;

    const horizontalLines = [];
    const verticalLines = [];

    for (let i = 0; i <= containerSize.width; i += gridSize) {
      verticalLines.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={containerSize.height}
          stroke="#444"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      );
    }

    for (let i = 0; i <= containerSize.height; i += gridSize) {
      horizontalLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i}
          x2={containerSize.width}
          y2={i}
          stroke="#444"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      );
    }

    return [...horizontalLines, ...verticalLines];
  };

  return (
    <div className={`absolute inset-0 z-40 ${isActive ? 'block' : 'hidden'}`}>
      {/* Action buttons and stroke width selector */}
      <div className="absolute top-4 right-4 z-50 flex flex-col space-y-3">
        

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Upload size={16} />
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
        {/* Stroke width selector */}
        <div>
          <select
            value={selectedStrokeWidth}
            onChange={(e) => setSelectedStrokeWidth(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {strokeWidthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} 
              </option>
            ))}
          </select>
          {/* Visual preview */}
          <div className="mt-3 flex justify-center">
          </div>
        </div>
      </div>
      

      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Enhanced grid with better visibility */}
        {isActive && renderGridLines()}

        {/* Existing lines with improved selection feedback */}
        {lines.map((line, index) => (
          <g key={`line-group-${index}`}>
            {/* Selection highlight */}
            {selectedLine === index && (
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#ffcc00"
                strokeWidth={line.strokeWidth + 4}
                opacity={0.3}
              />
            )}
            {/* Main line */}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={selectedLine === index ? "#ffcc00" : "#fff"}
              strokeWidth={line.strokeWidth}
              style={{ cursor: 'pointer' }}
              className="transition-all duration-150"
            />
          </g>
        ))}

        {/* Current line being drawn with enhanced styling */}
        {currentLine && (
          <g>
            <line
              x1={currentLine.x1}
              y1={currentLine.y1}
              x2={currentLine.x2}
              y2={currentLine.y2}
              stroke="#6ee7b7"
              strokeWidth={currentLine.strokeWidth + 2}
              opacity={0.3}
            />
            <line
              x1={currentLine.x1}
              y1={currentLine.y1}
              x2={currentLine.x2}
              y2={currentLine.y2}
              stroke="#6ee7b7"
              strokeWidth={currentLine.strokeWidth}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default BackgroundEditor;