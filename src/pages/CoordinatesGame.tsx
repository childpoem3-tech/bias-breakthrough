import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CoordinateGrid3D } from '@/components/3d/CoordinateGrid3D';
import { CoordinateGrid2D } from '@/components/2d/CoordinateGrid2D';
import { toast } from 'sonner';
import { ArrowLeft, Box, Grid3x3, Trophy, RotateCcw } from 'lucide-react';
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
  const [showCastle, setShowCastle] = useState(false);
  const [points2D, setPoints2D] = useState<Array<{ x: number; y: number; color: string; label?: string }>>([]);
  const [points3D, setPoints3D] = useState<Array<{ x: number; y: number; z: number; color: string }>>([]);
  
  const [targets2D] = useState<Target[]>([
    { x: 3, y: 4 },
    { x: -2, y: 3 },
    { x: 5, y: -2 }
  ]);
  
  const [targets3D] = useState<Target[]>([
    { x: 2, y: 3, z: 1 },
    { x: -3, y: 2, z: -1 },
    { x: 4, y: -1, z: 2 }
  ]);
  
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [correctPlacements, setCorrectPlacements] = useState(0);

  const currentTargets = mode === '2d' ? targets2D : targets3D;
  const currentTarget = currentTargets[currentTargetIndex];
  const placedCount = mode === '2d' ? points2D.length : points3D.length;

  useEffect(() => {
    if (correctPlacements === currentTargets.length && correctPlacements > 0) {
      setShowCastle(true);
      toast.success('All towers placed! Castle built! 🏰');
      setTimeout(() => {
        setShowCastle(false);
        setLevel(level + 1);
        setCurrentTargetIndex(0);
        setCorrectPlacements(0);
        if (mode === '2d') {
          setPoints2D([]);
        } else {
          setPoints3D([]);
        }
      }, 3000);
    }
  }, [correctPlacements, currentTargets.length, level, mode]);

  const handleGrid2DClick = (x: number, y: number) => {
    if (currentTargetIndex >= targets2D.length) return;

    const target = targets2D[currentTargetIndex];
    
    if (x === target.x && y === target.y) {
      toast.success('Perfect placement! 🎯 +100 points');
      setScore(score + 100);
      setPoints2D([...points2D, { x, y, color: '#10b981', label: `(${x}, ${y})` }]);
      setCorrectPlacements(prev => prev + 1);
      
      if (currentTargetIndex < targets2D.length - 1) {
        setCurrentTargetIndex(currentTargetIndex + 1);
      }
    } else {
      toast.error(`Wrong! Target is (${target.x}, ${target.y})`);
      setPoints2D([...points2D, { x, y, color: '#ef4444', label: `(${x}, ${y})` }]);
    }
  };

  const handleGrid3DClick = (point: { x: number; y: number; z: number; color: string }) => {
    if (currentTargetIndex >= targets3D.length) return;

    const target = targets3D[currentTargetIndex];
    
    if (point.x === target.x && point.y === target.y && point.z === target.z) {
      toast.success('Perfect placement! 🎯 +100 points');
      setScore(score + 100);
      setPoints3D([...points3D, { ...point, color: '#10b981' }]);
      setCorrectPlacements(prev => prev + 1);
      
      if (currentTargetIndex < targets3D.length - 1) {
        setCurrentTargetIndex(currentTargetIndex + 1);
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
    setCorrectPlacements(0);
    toast.info('Grid cleared');
  };

  const handleModeSwitch = (newMode: '2d' | '3d') => {
    setMode(newMode);
    setCurrentTargetIndex(0);
    setCorrectPlacements(0);
    setPoints2D([]);
    setPoints3D([]);
    setShowCastle(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
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
            {mode === '2d' ? '2D Coordinate Plane' : '3D Coordinate Space'} - Level {level}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl px-6 py-3 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-amber-300/70">Score</p>
              <p className="text-2xl font-bold text-amber-400">{score}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl px-6 py-3">
            <p className="text-xs text-cyan-300/70">Progress</p>
            <p className="text-lg font-bold text-cyan-400">{correctPlacements}/{currentTargets.length} Towers</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl px-6 py-3">
            <p className="text-xs text-purple-300/70">Concept</p>
            <p className="text-sm font-medium text-purple-400">{mode === '2d' ? '2D' : '3D'} Coordinate Plotting</p>
          </div>
        </div>

        {/* Mission Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span> Mission: Place Defense Towers
              </h2>
              <p className="text-slate-400">
                Click on the grid to place towers at the target coordinates
              </p>
            </div>
          </div>

          {/* Target Coordinates */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Target Coordinates:</h3>
            <div className="flex flex-wrap gap-3">
              {currentTargets.map((target, idx) => {
                const isCompleted = idx < correctPlacements || (idx < currentTargetIndex && points2D.some(p => p.x === target.x && p.y === target.y && p.color === '#10b981'));
                const isCurrent = idx === currentTargetIndex && correctPlacements < currentTargets.length;
                
                return (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 line-through'
                        : isCurrent
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 animate-pulse shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/50 border border-slate-600 text-slate-400'
                    }`}
                  >
                    {mode === '2d'
                      ? `(${target.x}, ${target.y})`
                      : `(${target.x}, ${target.y}, ${target.z})`}
                    {isCompleted && ' ✓'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        {mode === '2d' ? (
          <CoordinateGrid2D
            points={points2D}
            onGridClick={handleGrid2DClick}
            gridSize={10}
            cellSize={40}
            showCastle={showCastle}
          />
        ) : (
          <CoordinateGrid3D 
            points={points3D} 
            onPointClick={handleGrid3DClick}
            targetPoint={currentTargetIndex < targets3D.length ? targets3D[currentTargetIndex] as { x: number; y: number; z: number } : null}
          />
        )}

        {/* Controls */}
        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={handleClear} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Clear Grid
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-xl font-bold mb-3 text-white">How to Play:</h3>
          <ul className="space-y-2 text-slate-300">
            {mode === '2d' ? (
              <>
                <li className="flex items-center gap-2">✅ Hover over the grid to see coordinates</li>
                <li className="flex items-center gap-2">📍 Click to place towers at target coordinates</li>
                <li className="flex items-center gap-2">🏰 Place all 3 towers correctly to build a castle!</li>
                <li className="flex items-center gap-2">⭐ Each correct placement earns you 100 points</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">✅ Hover over 3D points to see their coordinates</li>
                <li className="flex items-center gap-2">🟡 Yellow pulsing point = current target</li>
                <li className="flex items-center gap-2">🔄 Drag to rotate, scroll to zoom the view</li>
                <li className="flex items-center gap-2">⭐ Each correct placement earns you 100 points</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
