import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RacingTrack3D } from '@/components/3d/RacingTrack3D';
import { toast } from 'sonner';
import { ArrowLeft, Zap, Gauge, Timer, Trophy, RotateCcw, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function RacingGame() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [targetDistance, setTargetDistance] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [boostActive, setBoostActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRacing && distance < targetDistance) {
      interval = setInterval(() => {
        setDistance((prev) => Math.min(prev + speed * 0.1, targetDistance));
        setTimeElapsed((prev) => prev + 0.1);
      }, 100);
    } else if (distance >= targetDistance && isRacing) {
      setIsRacing(false);
      setShowVictory(true);
      toast.success(`Race complete! Time: ${timeElapsed.toFixed(1)}s`);
      setScore(score + Math.floor((targetDistance / timeElapsed) * 10));
      setTimeout(() => setShowVictory(false), 4000);
    }
    return () => clearInterval(interval);
  }, [isRacing, speed, distance, targetDistance, timeElapsed, score]);

  const startRace = () => {
    setIsRacing(true);
    setSpeed(20);
    setDistance(0);
    setTimeElapsed(0);
    setShowVictory(false);
    toast.info('Race started! 🏁');
  };

  const boostSpeed = () => {
    if (isRacing && speed < 50) {
      setSpeed(speed + 10);
      setBoostActive(true);
      toast.success('Speed boost! 🚀');
      setTimeout(() => setBoostActive(false), 500);
    }
  };

  const brakeSpeed = () => {
    if (isRacing && speed > 10) {
      setSpeed(speed - 10);
      toast.info('Braking! 🛑');
    }
  };

  const resetRace = () => {
    setIsRacing(false);
    setSpeed(0);
    setDistance(0);
    setTimeElapsed(0);
    setShowVictory(false);
  };

  const progress = (distance / targetDistance) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-purple-950 p-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isRacing && Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-cyan-400/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              height: Math.random() * 50 + 20
            }}
            animate={{ 
              y: window.innerHeight + 100,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto py-6 max-w-6xl relative z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400">
            🏎️ Chrono Racers
          </h1>
          <p className="text-lg text-slate-300/80">
            Master speed, distance, and time calculations
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className={`bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-4 rounded-xl border ${boostActive ? 'border-cyan-400 shadow-lg shadow-cyan-500/50' : 'border-cyan-500/30'} backdrop-blur-sm transition-all`}
            animate={boostActive ? { scale: [1, 1.05, 1] } : {}}
          >
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-300/70">Speed</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{speed}</p>
            <p className="text-xs text-cyan-300/50">m/s</p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 p-4 rounded-xl border border-pink-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-pink-400" />
              <span className="text-xs text-pink-300/70">Time</span>
            </div>
            <p className="text-3xl font-bold text-pink-400">{timeElapsed.toFixed(1)}</p>
            <p className="text-xs text-pink-300/50">seconds</p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-purple-300/70">Distance</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{distance.toFixed(0)}</p>
            <p className="text-xs text-purple-300/50">/ {targetDistance}m</p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-4 rounded-xl border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300/70">Score</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{score}</p>
            <p className="text-xs text-amber-300/50">points</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Start</span>
            <span className="text-cyan-400 font-bold">{progress.toFixed(0)}%</span>
            <span>Finish</span>
          </div>
          <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {isRacing && (
                <motion.div 
                  className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Formula Display */}
        <motion.div 
          className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
            <span className="text-slate-400">Distance</span>
            <span className="text-white">=</span>
            <span className="text-cyan-400 font-bold">{speed} m/s</span>
            <span className="text-white">×</span>
            <span className="text-pink-400 font-bold">{timeElapsed.toFixed(1)} s</span>
            <span className="text-white">=</span>
            <span className="text-purple-400 font-bold text-2xl">{distance.toFixed(1)} m</span>
          </div>
        </motion.div>

        {/* 3D Track */}
        <div className="relative">
          <RacingTrack3D
            speed={speed}
            distance={distance}
            isRacing={isRacing}
            targetDistance={targetDistance}
          />
          
          {/* Victory Overlay */}
          <AnimatePresence>
            {showVictory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
              >
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="text-center"
                >
                  <motion.div 
                    className="text-8xl mb-4"
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    🏆
                  </motion.div>
                  <h2 className="text-4xl font-bold text-white mb-2">Race Complete!</h2>
                  <p className="text-xl text-cyan-400">Time: {timeElapsed.toFixed(1)}s</p>
                  <p className="text-lg text-amber-400">+{Math.floor((targetDistance / timeElapsed) * 10)} points</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={startRace}
              size="lg"
              disabled={isRacing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-14"
            >
              <Flag className="mr-2 h-5 w-5" />
              Start Race
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={boostSpeed}
              size="lg"
              disabled={!isRacing || speed >= 50}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 h-14"
            >
              <Zap className="mr-2 h-5 w-5" />
              Boost +10
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={brakeSpeed}
              size="lg"
              disabled={!isRacing || speed <= 10}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 h-14"
            >
              🛑 Brake -10
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={resetRace}
              size="lg"
              variant="outline"
              className="w-full h-14"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          </motion.div>
        </div>

        {/* Concept Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Speed', color: 'cyan', desc: 'Meters per second (m/s)', tip: 'Higher speed = faster travel' },
            { icon: '⏱️', title: 'Time', color: 'pink', desc: 'Duration in seconds (s)', tip: 'Less time = better score' },
            { icon: '📏', title: 'Distance', color: 'purple', desc: 'Total meters traveled (m)', tip: 'Distance = Speed × Time' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`bg-${item.color}-500/10 p-5 rounded-xl border border-${item.color}-500/30 backdrop-blur-sm`}
              style={{
                background: `linear-gradient(135deg, ${item.color === 'cyan' ? 'rgba(6,182,212,0.1)' : item.color === 'pink' ? 'rgba(236,72,153,0.1)' : 'rgba(168,85,247,0.1)'}, transparent)`
              }}
            >
              <h4 className={`font-bold text-${item.color}-400 mb-2 flex items-center gap-2`}>
                <span className="text-2xl">{item.icon}</span> {item.title}
              </h4>
              <p className="text-sm text-slate-300">{item.desc}</p>
              <p className="text-xs text-slate-500 mt-2">{item.tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
