import { useEffect, useRef, useState } from 'react';

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
}

export function CoordinateGrid2D({ 
  points, 
  onGridClick,
  gridSize = 10,
  cellSize = 40
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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'hsl(222, 47%, 11%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw axes (thicker and colored)
    // X-axis (red)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis (green)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // X-axis label
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.fillText('X', width - 15, centerY - 15);

    // Y-axis label
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.fillText('Y', centerX + 15, 15);

    // Draw coordinate numbers
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.font = '10px sans-serif';
    for (let i = -Math.floor(gridSize / 2); i <= Math.floor(gridSize / 2); i++) {
      if (i !== 0) {
        // X-axis numbers
        ctx.fillText(i.toString(), toCanvasX(i), centerY + 15);
        // Y-axis numbers
        ctx.fillText(i.toString(), centerX - 15, toCanvasY(i));
      }
    }

    // Draw origin
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('0', centerX - 15, centerY + 15);

    // Draw hovered cell
    if (hoveredCell) {
      const canvasX = toCanvasX(hoveredCell.x);
      const canvasY = toCanvasY(hoveredCell.y);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(
        canvasX - cellSize / 2,
        canvasY - cellSize / 2,
        cellSize,
        cellSize
      );
    }

    // Draw points
    points.forEach((point) => {
      const canvasX = toCanvasX(point.x);
      const canvasY = toCanvasY(point.y);

      // Draw glow effect
      const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, 15);
      gradient.addColorStop(0, point.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(canvasX - 15, canvasY - 15, 30, 30);

      // Draw point
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw point border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      if (point.label) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(point.label, canvasX, canvasY - 12);
      }
    });
  }, [points, hoveredCell, gridSize, cellSize, width, height, centerX, centerY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const gridX = toGridX(canvasX);
    const gridY = toGridY(canvasY);

    const maxCoord = Math.floor(gridSize / 2);
    if (gridX >= -maxCoord && gridX <= maxCoord && gridY >= -maxCoord && gridY <= maxCoord) {
      setHoveredCell({ x: gridX, y: gridY });
    } else {
      setHoveredCell(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoveredCell || !onGridClick) return;
    onGridClick(hoveredCell.x, hoveredCell.y);
  };

  return (
    <div className="flex items-center justify-center bg-background-secondary rounded-lg border border-border p-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={handleClick}
        className="cursor-crosshair rounded"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
