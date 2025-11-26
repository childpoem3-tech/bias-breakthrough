import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PermutationsPortal3D } from '@/components/3d/PermutationsPortal3D';
import { toast } from 'sonner';
import { ArrowLeft, Lightbulb, Trophy, Sparkles, RotateCcw, Unlock, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PermutationsGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<'basic' | 'time' | 'chrono'>('basic');
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [requiredCount, setRequiredCount] = useState(3);
  const [showFormula, setShowFormula] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(0);
  const [targetOrder, setTargetOrder] = useState<number[]>([]);

  const symbols = ['🔑', '⚡', '🌟', '🔥', '💎', '🎯', '🌙', '⚔️'];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const initializeLevel = (levelType: 'basic' | 'time' | 'chrono') => {
    const count = levelType === 'basic' ? 3 : levelType === 'time' ? 4 : 5;
    setRequiredCount(count);
    
    const newKeys = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbols[i],
      color: colors[i],
      selected: false,
    }));
    
    // Generate a random target order
    const shuffled = [...Array(count).keys()].sort(() => Math.random() - 0.5);
    setTargetOrder(shuffled);
    
    setKeys(newKeys);
    setSelectedOrder([]);
  };

  useEffect(() => {
    initializeLevel('basic');
  }, []);

  const handleKeyClick = (id: number) => {
    const key = keys.find((k) => k.id === id);
    if (!key) return;

    if (key.selected) {
      setSelectedOrder(selectedOrder.filter((sid) => sid !== id));
      setKeys(keys.map((k) => k.id === id ? { ...k, selected: false, order: undefined } : k));
    } else {
      if (selectedOrder.length < requiredCount) {
        const newOrder = [...selectedOrder, id];
        setSelectedOrder(newOrder);
        setKeys(keys.map((k) => k.id === id ? { ...k, selected: true, order: newOrder.length } : k));
      } else {
        toast.error('Maximum keys selected!');
      }
    }
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const checkAnswer = () => {
    if (selectedOrder.length === requiredCount) {
      const isCorrect = selectedOrder.every((id, idx) => id === targetOrder[idx]);
      
      if (isCorrect) {
        setShowSuccess(true);
        const points = requiredCount * 200 * (streak + 1);
        setScore(score + points);
        setStreak(streak + 1);
        toast.success(`Portal Unlocked! 🌀 +${points} points`);
        
        setTimeout(() => {
          setShowSuccess(false);
          if (level === 'basic') {
            setLevel('time');
            initializeLevel('time');
          } else if (level === 'time') {
            setLevel('chrono');
            initializeLevel('chrono');
          } else {
            initializeLevel('chrono');
          }
        }, 2000);
      } else {
        setStreak(0);
        toast.error('Wrong order! Try again.');
        // Show which were correct
        setKeys(keys.map((k) => ({ ...k, selected: false, order: undefined })));
        setSelectedOrder([]);
      }
    } else {
      toast.error('Select all keys in order!');
    }
  };

  const totalPermutations = factorial(requiredCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4 relative overflow-hidden">
      {/* Animated Portal Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-purple-500/20"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Energy Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <div className="container mx-auto py-6 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <Button variant="outline" onClick={() => navigate('/home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Button>
          <Button 
            variant={showFormula ? 'default' : 'outline'} 
            onClick={() => setShowFormula(!showFormula)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {showFormula ? 'Hide' : 'Show'} Formula
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🌀 Permutation Portal
          </h1>
          <p className="text-slate-300">Arrange the keys in the correct order to unlock the portal!</p>
        </motion.div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl px-6 py-3"
          >
            <p className="text-xs text-purple-300/70">Portal Level</p>
            <p className="text-xl font-bold text-purple-400">
              {level === 'basic' ? '🔑 Basic' : level === 'time' ? '⏰ Time Gate' : '🌀 Chrono Lock'}
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl px-6 py-3 flex items-center gap-3"
          >
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-amber-300/70">Score</p>
              <p className="text-2xl font-bold text-amber-400">{score}</p>
            </div>
          </motion.div>
          <AnimatePresence>
            {streak > 0 && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <Zap className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-xs text-orange-300/70">Streak</p>
                  <p className="text-2xl font-bold text-orange-400">{streak}x</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Formula Display */}
        <AnimatePresence>
          {showFormula && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Permutation Formula
                </h3>
                <div className="text-3xl font-mono font-bold text-white mb-2">P(n) = n!</div>
                <p className="text-purple-200 mb-2">The number of ways to arrange n distinct objects in order</p>
                <p className="text-slate-300">
                  For {requiredCount} keys: <span className="font-mono font-bold text-cyan-400">{requiredCount}! = {totalPermutations}</span> possible arrangements
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Card */}
        <motion.div 
          layout
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Target Sequence:
            </h2>
            <div className="text-slate-400">
              {selectedOrder.length} / {requiredCount} selected
            </div>
          </div>

          {/* Target Order Display */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {targetOrder.map((keyId, idx) => {
              const key = keys[keyId];
              if (!key) return null;
              const isSelected = selectedOrder[idx] === keyId;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: 'spring' }}
                  className={`relative px-5 py-4 rounded-xl text-3xl font-bold transition-all ${
                    isSelected
                      ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
                      : 'bg-slate-700/50 border-2 border-dashed border-slate-600'
                  }`}
                >
                  <span className="text-xs text-slate-400 absolute top-1 left-2">#{idx + 1}</span>
                  {key.symbol}
                </motion.div>
              );
            })}
          </div>

          {/* Your Selection */}
          <div className="text-center mb-4">
            <p className="text-sm text-slate-400 mb-2">Your Selection:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedOrder.length === 0 ? (
                <span className="text-slate-500 italic">Click keys to select them in order...</span>
              ) : (
                selectedOrder.map((keyId, idx) => {
                  const key = keys[keyId];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-4 py-2 rounded-lg text-2xl"
                      style={{ backgroundColor: `${key.color}30`, border: `2px solid ${key.color}` }}
                    >
                      {key.symbol}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D Portal */}
        <PermutationsPortal3D keys={keys} onKeyClick={handleKeyClick} level={level} />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={checkAnswer} 
              size="lg" 
              disabled={selectedOrder.length !== requiredCount}
              className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Unlock className="h-4 w-4" />
              Unlock Portal
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                setSelectedOrder([]);
                setKeys(keys.map((k) => ({ ...k, selected: false, order: undefined })));
              }}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </motion.div>
        </div>

        {/* Learning Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { level: 'basic', title: '🔑 Basic Portal', desc: '3 keys = 3! = 6 arrangements', formula: '3×2×1 = 6', color: 'green' },
            { level: 'time', title: '⏰ Time Gate', desc: '4 keys = 4! = 24 arrangements', formula: '4×3×2×1 = 24', color: 'orange' },
            { level: 'chrono', title: '🌀 Chrono Lock', desc: '5 keys = 5! = 120 arrangements', formula: '5×4×3×2×1 = 120', color: 'purple' },
          ].map((card, idx) => (
            <motion.div
              key={card.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-${card.color}-500/20 p-5 rounded-xl border border-${card.color}-500/30 backdrop-blur-sm cursor-pointer`}
              onClick={() => { setLevel(card.level as any); initializeLevel(card.level as any); }}
            >
              <h4 className="font-bold text-white mb-2">{card.title}</h4>
              <p className="text-sm text-slate-300 mb-2">{card.desc}</p>
              <p className="text-xs font-mono text-slate-400">{card.formula}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🌀
              </motion.div>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-2xl shadow-2xl">
                Portal Unlocked!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
