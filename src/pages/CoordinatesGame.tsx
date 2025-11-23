import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoordinateGrid3D } from '@/components/3d/CoordinateGrid3D';
import { CoordinateGrid2D } from '@/components/2d/CoordinateGrid2D';
import { toast } from 'sonner';
import { ArrowLeft, Box, Grid3x3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Target {
  x: number;
  y: number;
  z?: number;
}

export default function CoordinatesGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [points2D, setPoints2D] = useState<Array<{ x: number; y: number; color: string; label?: string }>>([]);
  const [points3D, setPoints3D] = useState<Array<{ x: number; y: number; z: number; color: string }>>([]);
  
  // 2D targets (only x, y)
  const [targets2D] = useState<Target[]>([
    { x: 3, y: 4 },
    { x: -2, y: 3 },
    { x: 5, y: -2 }
  ]);
  
  // 3D targets (x, y, z)
  const [targets3D] = useState<Target[]>([
    { x: 2, y: 3, z: 1 },
    { x: -3, y: 2, z: -1 },
    { x: 4, y: -1, z: 2 }
  ]);
  
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

  const currentTargets = mode === '2d' ? targets2D : targets3D;
  const currentTarget = currentTargets[currentTargetIndex];
  const placedCount = mode === '2d' ? points2D.length : points3D.length;

  const handleGrid2DClick = (x: number, y: number) => {
    if (currentTargetIndex >= targets2D.length) return;

    const target = targets2D[currentTargetIndex];
    
    if (x === target.x && y === target.y) {
      toast.success('Perfect placement! 🎯');
      setScore(score + 100);
      setPoints2D([...points2D, { x, y, color: '#10b981', label: `(${x}, ${y})` }]);
      
      if (currentTargetIndex < targets2D.length - 1) {
        setCurrentTargetIndex(currentTargetIndex + 1);
      } else {
        toast.success('Level Complete! 🎉');
        setTimeout(() => {
          setLevel(level + 1);
          setCurrentTargetIndex(0);
          setPoints2D([]);
        }, 2000);
      }
    } else {
      toast.error(`Wrong! Target is (${target.x}, ${target.y})`);
      setPoints2D([...points2D, { x, y, color: '#ef4444', label: `(${x}, ${y})` }]);
    }
  };

  const handleGrid3DClick = (point: any) => {
    if (currentTargetIndex >= targets3D.length) return;

    const target = targets3D[currentTargetIndex];
    
    if (point.x === target.x && point.y === target.y && point.z === target.z) {
      toast.success('Perfect placement! 🎯');
      setScore(score + 100);
      setPoints3D([...points3D, { ...point, color: '#10b981' }]);
      
      if (currentTargetIndex < targets3D.length - 1) {
        setCurrentTargetIndex(currentTargetIndex + 1);
      } else {
        toast.success('Level Complete! 🎉');
        setTimeout(() => {
          setLevel(level + 1);
          setCurrentTargetIndex(0);
          setPoints3D([]);
        }, 2000);
      }
    } else {
      toast.error(`Wrong! Target is (${target.x}, ${target.y}, ${target.z})`);
      setPoints3D([...points3D, { ...point, color: '#ef4444' }]);
    }
  };

  const handleClear = () => {
    if (mode === '2d') {
      setPoints2D([]);
    } else {
      setPoints3D([]);
    }
    setCurrentTargetIndex(0);
    toast.info('Grid cleared');
  };

  const handleModeSwitch = (newMode: '2d' | '3d') => {
    setMode(newMode);
    setCurrentTargetIndex(0);
    setPoints2D([]);
    setPoints3D([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4">
      <div className="container mx-auto py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Button>

          <div className="flex gap-2">
            <Button
              variant={mode === '2d' ? 'default' : 'outline'}
              onClick={() => handleModeSwitch('2d')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              2D Mode
            </Button>
            <Button
              variant={mode === '3d' ? 'default' : 'outline'}
              onClick={() => handleModeSwitch('3d')}
              className="gap-2"
            >
              <Box className="h-4 w-4" />
              3D Mode
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            City of Coordinates
          </h1>
          <p className="text-muted-foreground">
            {mode === '2d' ? '2D Coordinate Plane' : '3D Coordinate Space'} - Level {level}/3
          </p>
        </div>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-background-secondary to-background border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-cyan-400">
                Level {level}: Tower Placement
              </h2>
              <p className="text-muted-foreground">
                Place defense towers at specific coordinates to protect Zone Alpha
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold text-cyan-400">{score}</p>
            </div>
          </div>

          <div className="inline-block bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2 mb-4">
            <span className="text-sm text-purple-300">
              Concept: Plotting Points on {mode === '2d' ? '2D' : '3D'} Coordinate Plane
            </span>
          </div>

          {/* Mission Card */}
          <div className="bg-background/50 border border-border/50 rounded-lg p-4">
            <h3 className="font-bold mb-2">Mission:</h3>
            <p className="mb-2">
              Place towers at these coordinates:{' '}
              {currentTargets.map((target, idx) => (
                <span
                  key={idx}
                  className={`inline-block ${
                    idx < currentTargetIndex
                      ? 'text-green-400 line-through'
                      : idx === currentTargetIndex
                      ? 'text-cyan-400 font-bold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {mode === '2d'
                    ? `(${target.x}, ${target.y})`
                    : `(${target.x}, ${target.y}, ${target.z})`}
                  {idx < currentTargets.length - 1 && ', '}
                </span>
              ))}
            </p>
            <p className="text-sm text-muted-foreground">
              Progress: {placedCount}/{currentTargets.length} towers placed
            </p>
          </div>
        </div>

        {/* Grid */}
        {mode === '2d' ? (
          <CoordinateGrid2D
            points={points2D}
            onGridClick={handleGrid2DClick}
            gridSize={10}
            cellSize={40}
          />
        ) : (
          <CoordinateGrid3D points={points3D} onPointClick={handleGrid3DClick} />
        )}

        {/* Controls */}
        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={handleClear} variant="outline" size="lg">
            Clear Grid
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-background-secondary p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-3">How to Play:</h3>
          <ul className="space-y-2 text-muted-foreground">
            {mode === '2d' ? (
              <>
                <li>✅ Click on the grid to place towers at the target coordinates</li>
                <li>📍 Red axis = X, Green axis = Y</li>
                <li>🎯 Place all towers correctly to complete the level</li>
                <li>⭐ Each correct placement earns you 100 points</li>
              </>
            ) : (
              <>
                <li>✅ Click on points in 3D space to place towers</li>
                <li>🔄 Use your mouse to rotate, zoom, and pan the view</li>
                <li>📍 Red axis = X, Green axis = Y, Blue axis = Z</li>
                <li>⭐ Each correct placement earns you 100 points</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
