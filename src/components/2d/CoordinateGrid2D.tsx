import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  color: string;
  label?: string;
}

interface Shape {
  type: 'triangle' | 'rectangle' | 'circle' | 'line';
  points: Point[];
  color: string;
  completed: boolean;
}

interface CoordinateGrid2DProps {
  points: Point[];
  onGridClick?: (x: number, y: number) => void;
  gridSize?: number;
  cellSize?: number;
  showCastle?: boolean;
  shapes?: Shape[];
  showConnectingLines?: boolean;
  animationProgress?: number;
}

export function CoordinateGrid2D({ 
  points, 
  onGridClick,
  gridSize = 10,
  cellSize = 40,
  showCastle = false,
  shapes = [],
  showConnectingLines = true,
  animationProgress = 1
}: CoordinateGrid2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [lineAnimProgress, setLineAnimProgress] = useState(0);

  const width = gridSize * cellSize;
  const height = gridSize * cellSize;
  const centerX = width / 2;
  const centerY = height / 2;

  const toCanvasX = (x: number) => centerX + x * cellSize;
  const toCanvasY = (y: number) => centerY - y * cellSize;
  const toGridX = (canvasX: number) => Math.round((canvasX - centerX) / cellSize);
  const toGridY = (canvasY: number) => Math.round((centerY - canvasY) / cellSize);

  // Animate lines drawing
  useEffect(() => {
    if (points.length >= 2 && showConnectingLines) {
      setLineAnimProgress(0);
      const interval = setInterval(() => {
        setLineAnimProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.05;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [points.length, showConnectingLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, 'hsl(222, 47%, 8%)');
    bgGradient.addColorStop(1, 'hsl(222, 47%, 14%)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // X-axis
    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Axis labels
    ctx.fillStyle = 'rgba(239, 68, 68, 1)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('X', width - 20, centerY - 10);
    ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    ctx.fillText('Y', centerX + 10, 20);

    // Coordinate numbers
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = -Math.floor(gridSize / 2); i <= Math.floor(gridSize / 2); i++) {
      if (i !== 0) {
        ctx.fillText(i.toString(), toCanvasX(i), centerY + 18);
        ctx.fillText(i.toString(), centerX - 18, toCanvasY(i));
      }
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('0', centerX - 15, centerY + 15);

    // Draw completed shapes with fill
    shapes.forEach(shape => {
      if (shape.completed && shape.points.length >= 3) {
        ctx.beginPath();
        const firstPoint = shape.points[0];
        ctx.moveTo(toCanvasX(firstPoint.x), toCanvasY(firstPoint.y));
        
        shape.points.forEach((point, idx) => {
          if (idx > 0) {
            ctx.lineTo(toCanvasX(point.x), toCanvasY(point.y));
          }
        });
        ctx.closePath();
        
        // Fill with gradient
        const gradient = ctx.createLinearGradient(
          toCanvasX(shape.points[0].x),
          toCanvasY(shape.points[0].y),
          toCanvasX(shape.points[shape.points.length - 1].x),
          toCanvasY(shape.points[shape.points.length - 1].y)
        );
        gradient.addColorStop(0, `${shape.color}40`);
        gradient.addColorStop(1, `${shape.color}20`);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Stroke
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Draw connecting lines between correct points with animation
    const correctPoints = points.filter(p => p.color === '#10b981');
    if (correctPoints.length >= 2 && showConnectingLines) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
      ctx.shadowBlur = 10;
      ctx.setLineDash([]);
      
      for (let i = 0; i < correctPoints.length - 1; i++) {
        const start = correctPoints[i];
        const end = correctPoints[i + 1];
        const startX = toCanvasX(start.x);
        const startY = toCanvasY(start.y);
        const endX = toCanvasX(end.x);
        const endY = toCanvasY(end.y);
        
        // Animated line drawing
        const progress = Math.min(lineAnimProgress * (correctPoints.length - 1) - i, 1);
        if (progress > 0) {
          const currentEndX = startX + (endX - startX) * Math.max(0, progress);
          const currentEndY = startY + (endY - startY) * Math.max(0, progress);
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(currentEndX, currentEndY);
          ctx.stroke();
          
          // Draw animated particle along the line
          if (progress < 1) {
            const particleGradient = ctx.createRadialGradient(currentEndX, currentEndY, 0, currentEndX, currentEndY, 8);
            particleGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            particleGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(currentEndX, currentEndY, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Close the shape if 3+ correct points and animation complete
      if (correctPoints.length >= 3 && lineAnimProgress >= 1) {
        const first = correctPoints[0];
        const last = correctPoints[correctPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(toCanvasX(last.x), toCanvasY(last.y));
        ctx.lineTo(toCanvasX(first.x), toCanvasY(first.y));
        ctx.stroke();
        
        // Fill the shape
        ctx.beginPath();
        ctx.moveTo(toCanvasX(correctPoints[0].x), toCanvasY(correctPoints[0].y));
        correctPoints.forEach((p, idx) => {
          if (idx > 0) ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
        });
        ctx.closePath();
        
        const shapeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
        shapeGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        shapeGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
        ctx.fillStyle = shapeGradient;
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
    }

    // Draw hovered cell
    if (hoveredCell) {
      const canvasX = toCanvasX(hoveredCell.x);
      const canvasY = toCanvasY(hoveredCell.y);
      
      const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, cellSize);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(canvasX - cellSize, canvasY - cellSize, cellSize * 2, cellSize * 2);
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.fillRect(canvasX - cellSize / 2, canvasY - cellSize / 2, cellSize, cellSize);
      ctx.strokeRect(canvasX - cellSize / 2, canvasY - cellSize / 2, cellSize, cellSize);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points with tower effect
    points.forEach((point) => {
      const canvasX = toCanvasX(point.x);
      const canvasY = toCanvasY(point.y);
      const isCorrect = point.color === '#10b981';

      if (isCorrect) {
        const towerGlow = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, 30);
        towerGlow.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        towerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = towerGlow;
        ctx.fillRect(canvasX - 30, canvasY - 30, 60, 60);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.fillRect(canvasX - 8, canvasY - 5, 16, 10);
        ctx.fillRect(canvasX - 5, canvasY - 20, 10, 15);
        ctx.beginPath();
        ctx.moveTo(canvasX - 8, canvasY - 20);
        ctx.lineTo(canvasX, canvasY - 30);
        ctx.lineTo(canvasX + 8, canvasY - 20);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        ctx.fillRect(canvasX - 2, canvasY - 16, 4, 4);
      } else {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvasX - 8, canvasY - 8);
        ctx.lineTo(canvasX + 8, canvasY + 8);
        ctx.moveTo(canvasX + 8, canvasY - 8);
        ctx.lineTo(canvasX - 8, canvasY + 8);
        ctx.stroke();
      }

      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (point.label) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(point.label, canvasX, canvasY - (isCorrect ? 35 : 15));
      }
    });

    // Draw shape info if 3+ correct points
    if (correctPoints.length >= 3 && lineAnimProgress >= 1) {
      const shapeName = correctPoints.length === 3 ? 'Triangle' : correctPoints.length === 4 ? 'Quadrilateral' : 'Polygon';
      ctx.fillStyle = 'rgba(16, 185, 129, 1)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${shapeName} Formed!`, centerX, 30);
    }
  }, [points, hoveredCell, gridSize, cellSize, width, height, centerX, centerY, shapes, showConnectingLines, lineAnimProgress]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    const gridX = toGridX(canvasX);
    const gridY = toGridY(canvasY);
    const maxCoord = Math.floor(gridSize / 2);
    if (gridX >= -maxCoord && gridX <= maxCoord && gridY >= -maxCoord && gridY <= maxCoord) {
      setHoveredCell({ x: gridX, y: gridY });
    } else {
      setHoveredCell(null);
    }
  };

  const handleClick = () => {
    if (!hoveredCell || !onGridClick) return;
    onGridClick(hoveredCell.x, hoveredCell.y);
  };

  // Get shape info for display
  const correctPoints = points.filter(p => p.color === '#10b981');
  const shapeInfo = correctPoints.length >= 3 
    ? correctPoints.length === 3 ? '△ Triangle' : correctPoints.length === 4 ? '◇ Quadrilateral' : `⬡ ${correctPoints.length}-gon`
    : null;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg border border-primary/50 backdrop-blur-sm"
          >
            <span className="font-mono font-bold text-lg">({hoveredCell.x}, {hoveredCell.y})</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shape indicator */}
      <AnimatePresence>
        {shapeInfo && lineAnimProgress >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full shadow-lg font-bold flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
              {shapeInfo}
              <motion.span
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-background-secondary rounded-xl border-2 border-border p-4 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={handleClick}
          className="cursor-crosshair rounded-lg"
          style={{ imageRendering: 'crisp-edges', maxWidth: '100%', height: 'auto' }}
        />
        
        <AnimatePresence>
          {showCastle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="text-center"
              >
                <motion.div 
                  className="text-6xl mb-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🏰
                </motion.div>
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-6 py-2 rounded-full shadow-lg">
                  Castle Built!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-muted-foreground">X-Axis</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-muted-foreground">Y-Axis</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-muted-foreground">Tower</span>
        </div>
        {correctPoints.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 px-3 py-2 rounded-lg"
          >
            <div className="w-8 h-0.5 bg-emerald-500" />
            <span className="text-emerald-400">Connected</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
