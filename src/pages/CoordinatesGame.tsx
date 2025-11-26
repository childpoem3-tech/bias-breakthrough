import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CoordinateGrid3D } from '@/components/3d/CoordinateGrid3D';
import { CoordinateGrid2D } from '@/components/2d/CoordinateGrid2D';
import { toast } from 'sonner';
import { ArrowLeft, Box, Grid3x3, Trophy, RotateCcw, Triangle, Square, Circle, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Target {
  x: number;
  y: number;
  z?: number;
}

type GameMode = 'towers' | 'triangle' | 'rectangle' | 'freeform';

const SHAPE_CONFIGS: Record<string, { targets: Target[]; description: string; pointsNeeded: number }> = {
  triangle: {
    targets: [
      { x: 0, y: 3 },
      { x: -3, y: -2 },
      { x: 3, y: -2 }
    ],
    description: 'Plot 3 points to form a Triangle',
    pointsNeeded: 3
  },
  rectangle: {
    targets: [
      { x: -3, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: -2 },
      { x: -3, y: -2 }
    ],
    description: 'Plot 4 points to form a Rectangle',
    pointsNeeded: 4
  },
  towers: {
    targets: [
      { x: 3, y: 4 },
      { x: -2, y: 3 },
      { x: 5, y: -2 }
    ],
    description: 'Place defense towers at exact coordinates',
    pointsNeeded: 3
  },
  freeform: {
    targets: [],
    description: 'Click anywhere to create your own shape!',
    pointsNeeded: 0
  }
};

export default function CoordinatesGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [gameMode, setGameMode] = useState<GameMode>('towers');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [showCastle, setShowCastle] = useState(false);
  const [showShapeComplete, setShowShapeComplete] = useState(false);
  const [points2D, setPoints2D] = useState<Array<{ x: number; y: number; color: string; label?: string }>>([]);
  const [points3D, setPoints3D] = useState<Array<{ x: number; y: number; z: number; color: string }>>([]);
  
  const [targets3D] = useState<Target[]>([
    { x: 2, y: 3, z: 1 },
    { x: -3, y: 2, z: -1 },
    { x: 4, y: -1, z: 2 }
  ]);
  
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [correctPlacements, setCorrectPlacements] = useState(0);

  const currentConfig = SHAPE_CONFIGS[gameMode];
  const targets2D = currentConfig.targets;
  const currentTargets = mode === '2d' ? targets2D : targets3D;

  // Check for shape completion
  useEffect(() => {
    const correctPoints = points2D.filter(p => p.color === '#10b981');
    
    if (gameMode === 'freeform' && correctPoints.length >= 3) {
      // In freeform mode, any 3+ points create a shape
      setShowShapeComplete(true);
      setTimeout(() => setShowShapeComplete(false), 2000);
    } else if (correctPlacements === currentConfig.pointsNeeded && currentConfig.pointsNeeded > 0) {
      setShowCastle(true);
      setShowShapeComplete(true);
      const shapeBonus = gameMode === 'triangle' ? 200 : gameMode === 'rectangle' ? 300 : 150;
      setScore(prev => prev + shapeBonus);
      toast.success(`${gameMode === 'towers' ? 'Castle' : gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} completed! +${shapeBonus} bonus! 🎉`);
      
      setTimeout(() => {
        setShowCastle(false);
        setShowShapeComplete(false);
        setLevel(level + 1);
        setCurrentTargetIndex(0);
        setCorrectPlacements(0);
        setPoints2D([]);
      }, 3000);
    }
  }, [correctPlacements, currentConfig.pointsNeeded, level, gameMode, points2D]);

  const handleGrid2DClick = (x: number, y: number) => {
    if (gameMode === 'freeform') {
      // Freeform mode - any click adds a point
      setPoints2D([...points2D, { x, y, color: '#10b981', label: `(${x}, ${y})` }]);
      setScore(prev => prev + 25);
      toast.success('Point placed! +25 points');
      return;
    }

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
    setPoints2D([]);
    setPoints3D([]);
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

  const handleGameModeSwitch = (newGameMode: GameMode) => {
    setGameMode(newGameMode);
    setCurrentTargetIndex(0);
    setCorrectPlacements(0);
    setPoints2D([]);
    setShowCastle(false);
  };

  const correctPoints = points2D.filter(p => p.color === '#10b981');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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

        {/* Game Mode Selector (2D only) */}
        {mode === '2d' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-6"
          >
            <Button
              variant={gameMode === 'towers' ? 'default' : 'outline'}
              onClick={() => handleGameModeSwitch('towers')}
              className="gap-2"
              size="sm"
            >
              🏰 Towers
            </Button>
            <Button
              variant={gameMode === 'triangle' ? 'default' : 'outline'}
              onClick={() => handleGameModeSwitch('triangle')}
              className="gap-2"
              size="sm"
            >
              <Triangle className="h-4 w-4" />
              Triangle
            </Button>
            <Button
              variant={gameMode === 'rectangle' ? 'default' : 'outline'}
              onClick={() => handleGameModeSwitch('rectangle')}
              className="gap-2"
              size="sm"
            >
              <Square className="h-4 w-4" />
              Rectangle
            </Button>
            <Button
              variant={gameMode === 'freeform' ? 'default' : 'outline'}
              onClick={() => handleGameModeSwitch('freeform')}
              className="gap-2"
              size="sm"
            >
              <Hexagon className="h-4 w-4" />
              Freeform
            </Button>
          </motion.div>
        )}

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <motion.div 
            className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl px-6 py-3 flex items-center gap-3"
            animate={{ scale: score > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-amber-300/70">Score</p>
              <p className="text-2xl font-bold text-amber-400">{score}</p>
            </div>
          </motion.div>
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl px-6 py-3">
            <p className="text-xs text-cyan-300/70">Progress</p>
            <p className="text-lg font-bold text-cyan-400">
              {gameMode === 'freeform' 
                ? `${correctPoints.length} Points` 
                : `${correctPlacements}/${currentConfig.pointsNeeded}`}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl px-6 py-3">
            <p className="text-xs text-purple-300/70">Shape</p>
            <p className="text-sm font-medium text-purple-400 capitalize">{gameMode}</p>
          </div>
          {correctPoints.length >= 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-xl px-6 py-3"
            >
              <p className="text-xs text-emerald-300/70">Shape Formed</p>
              <p className="text-lg font-bold text-emerald-400">
                {correctPoints.length === 3 ? '△ Triangle' : correctPoints.length === 4 ? '◇ Quad' : `⬡ ${correctPoints.length}-gon`}
              </p>
            </motion.div>
          )}
        </div>

        {/* Mission Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <span className="text-2xl">
                  {gameMode === 'towers' ? '🎯' : gameMode === 'triangle' ? '📐' : gameMode === 'rectangle' ? '⬜' : '✨'}
                </span>
                Mission: {currentConfig.description}
              </h2>
              <p className="text-slate-400">
                {gameMode === 'freeform' 
                  ? 'Click points to create any shape - lines will connect automatically!'
                  : 'Click on the grid to place points at the target coordinates'}
              </p>
            </div>
          </div>

          {/* Target Coordinates */}
          {gameMode !== 'freeform' && targets2D.length > 0 && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Target Coordinates:</h3>
              <div className="flex flex-wrap gap-3">
                {targets2D.map((target, idx) => {
                  const isCompleted = idx < correctPlacements;
                  const isCurrent = idx === currentTargetIndex && correctPlacements < currentConfig.pointsNeeded;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 line-through'
                          : isCurrent
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 animate-pulse shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-800/50 border border-slate-600 text-slate-400'
                      }`}
                    >
                      ({target.x}, {target.y})
                      {isCompleted && ' ✓'}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Freeform hint */}
          {gameMode === 'freeform' && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
              <p className="text-purple-300 text-sm">
                💡 <strong>Tip:</strong> Place 3+ points to automatically create a polygon! 
                The shape will be filled and you'll see the geometry name.
              </p>
            </div>
          )}
        </div>

        {/* Shape Complete Celebration */}
        <AnimatePresence>
          {showShapeComplete && gameMode !== 'towers' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold"
              >
                🎉 {gameMode === 'freeform' ? 'Shape' : gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Complete! 🎉
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {mode === '2d' ? (
          <CoordinateGrid2D
            points={points2D}
            onGridClick={handleGrid2DClick}
            gridSize={10}
            cellSize={40}
            showCastle={showCastle && gameMode === 'towers'}
            showConnectingLines={true}
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
                <li className="flex items-center gap-2">📍 Click to place points at coordinates</li>
                <li className="flex items-center gap-2">📐 Lines automatically connect your points!</li>
                <li className="flex items-center gap-2">🔷 Complete shapes to earn bonus points</li>
                <li className="flex items-center gap-2">⭐ Try different modes: Towers, Triangle, Rectangle, or Freeform</li>
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
