import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  color: string;
  label?: string;
}

interface CoordinateGrid2DProps {
  points: Point[];
  onGridClick?: (x: number, y: number) => void;
  gridSize?: number;
  cellSize?: number;
  showCastle?: boolean;
}

export function CoordinateGrid2D({ 
  points, 
  onGridClick,
  gridSize = 10,
  cellSize = 40,
  showCastle = false
}: CoordinateGrid2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const width = gridSize * cellSize;
  const height = gridSize * cellSize;
  const centerX = width / 2;
  const centerY = height / 2;

  const toCanvasX = (x: number) => centerX + x * cellSize;
  const toCanvasY = (y: number) => centerY - y * cellSize;
  const toGridX = (canvasX: number) => Math.round((canvasX - centerX) / cellSize);
  const toGridY = (canvasY: number) => Math.round((centerY - canvasY) / cellSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, 'hsl(222, 47%, 8%)');
    bgGradient.addColorStop(1, 'hsl(222, 47%, 14%)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

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

    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(239, 68, 68, 1)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('X', width - 20, centerY - 10);
    ctx.fillStyle = 'rgba(34, 197, 94, 1)';
    ctx.fillText('Y', centerX + 10, 20);

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
  }, [points, hoveredCell, gridSize, cellSize, width, height, centerX, centerY]);

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
                <div className="text-6xl mb-2">🏰</div>
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-6 py-2 rounded-full shadow-lg">
                  Castle Built!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-muted-foreground">X-Axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-muted-foreground">Y-Axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-muted-foreground">Tower Placed</span>
        </div>
      </div>
    </div>
  );
}
