import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CombinationsHall3D } from '@/components/3d/CombinationsHall3D';
import { toast } from 'sonner';
import { ArrowLeft, Lightbulb, Trophy, Sparkles, RotateCcw, Users, Beaker, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CombinationsGame() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<'team' | 'potion' | 'council'>('team');
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [maxSelections, setMaxSelections] = useState(3);
  const [showFormula, setShowFormula] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(0);
  const [targetItems, setTargetItems] = useState<number[]>([]);

  const challenges = {
    team: {
      name: 'Team Selection',
      icon: <Users className="h-5 w-5" />,
      description: 'Select heroes for your adventure team',
      items: [
        { emoji: '⚔️', name: 'Warrior', color: '#ef4444' },
        { emoji: '🏹', name: 'Archer', color: '#f59e0b' },
        { emoji: '🔮', name: 'Mage', color: '#8b5cf6' },
        { emoji: '🛡️', name: 'Tank', color: '#3b82f6' },
        { emoji: '💚', name: 'Healer', color: '#10b981' },
      ],
      max: 3,
    },
    potion: {
      name: 'Potion Mix',
      icon: <Beaker className="h-5 w-5" />,
      description: 'Combine magical ingredients',
      items: [
        { emoji: '🌿', name: 'Herb', color: '#10b981' },
        { emoji: '🔥', name: 'Fire', color: '#ef4444' },
        { emoji: '💧', name: 'Water', color: '#3b82f6' },
        { emoji: '⭐', name: 'Star', color: '#fbbf24' },
        { emoji: '💎', name: 'Crystal', color: '#8b5cf6' },
        { emoji: '🌙', name: 'Moon', color: '#6366f1' },
      ],
      max: 3,
    },
    council: {
      name: 'Council Formation',
      icon: <Crown className="h-5 w-5" />,
      description: 'Form a ruling council',
      items: [
        { emoji: '👑', name: 'King', color: '#fbbf24' },
        { emoji: '🧙', name: 'Wizard', color: '#8b5cf6' },
        { emoji: '🎭', name: 'Bard', color: '#ec4899' },
        { emoji: '⚖️', name: 'Judge', color: '#3b82f6' },
        { emoji: '🗡️', name: 'Knight', color: '#ef4444' },
        { emoji: '📜', name: 'Scribe', color: '#f59e0b' },
        { emoji: '🏰', name: 'Lord', color: '#10b981' },
      ],
      max: 4,
    },
  };

  const initializeChallenge = (type: 'team' | 'potion' | 'council') => {
    const challengeData = challenges[type];
    setChallenge(type);
    setMaxSelections(challengeData.max);
    
    const newItems = challengeData.items.map((item, i) => ({
      id: i,
      ...item,
      selected: false,
    }));
    
    // Generate random target combination
    const indices = [...Array(challengeData.items.length).keys()];
    const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, challengeData.max);
    setTargetItems(shuffled.sort((a, b) => a - b));
    
    setItems(newItems);
  };

  useEffect(() => {
    initializeChallenge('team');
  }, []);

  const handleItemClick = (id: number) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;

    if (item.selected) {
      setItems(items.map((it) => (it.id === id ? { ...it, selected: false } : it)));
    } else {
      const currentSelections = items.filter((it) => it.selected).length;
      if (currentSelections < maxSelections) {
        setItems(items.map((it) => (it.id === id ? { ...it, selected: true } : it)));
      } else {
        toast.error(`You can only select ${maxSelections} items!`);
      }
    }
  };

  const calculateCombinations = (n: number, r: number): number => {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= (n - i);
      result /= (i + 1);
    }
    return Math.round(result);
  };

  const checkAnswer = () => {
    const selected = items.filter((it) => it.selected).map(it => it.id).sort((a, b) => a - b);
    
    if (selected.length === maxSelections) {
      const isCorrect = selected.every((id, idx) => id === targetItems[idx]);
      
      if (isCorrect) {
        setShowSuccess(true);
        const points = maxSelections * 150 * (streak + 1);
        setScore(score + points);
        setStreak(streak + 1);
        toast.success(`Perfect combination! ✨ +${points} points`);
        
        setTimeout(() => {
          setShowSuccess(false);
          if (challenge === 'team') {
            initializeChallenge('potion');
          } else if (challenge === 'potion') {
            initializeChallenge('council');
          } else {
            initializeChallenge('team');
          }
        }, 2000);
      } else {
        setStreak(0);
        toast.error('Not the right combination! Try again.');
        setItems(items.map((it) => ({ ...it, selected: false })));
      }
    } else {
      toast.error(`Select exactly ${maxSelections} items!`);
    }
  };

  const selectedCount = items.filter((it) => it.selected).length;
  const totalCombinations = calculateCombinations(items.length, maxSelections);
  const currentChallenge = challenges[challenge];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-gray-900 to-purple-900 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Magic Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-amber-500/10 rounded-full"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-400 to-purple-400 bg-clip-text text-transparent">
            🏰 Combination Quest
          </h1>
          <p className="text-slate-300">Find the secret combination in the Guild Hall!</p>
        </motion.div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl px-6 py-3 flex items-center gap-3"
          >
            {currentChallenge.icon}
            <div>
              <p className="text-xs text-amber-300/70">Quest</p>
              <p className="text-lg font-bold text-amber-400">{currentChallenge.name}</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl px-6 py-3 flex items-center gap-3"
          >
            <Trophy className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-xs text-purple-300/70">Score</p>
              <p className="text-2xl font-bold text-purple-400">{score}</p>
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
              <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Combination Formula
                </h3>
                <div className="text-3xl font-mono font-bold text-white mb-2">C(n,r) = n! / (r! × (n-r)!)</div>
                <p className="text-amber-200 mb-2">The number of ways to choose r items from n items (order doesn't matter)</p>
                <p className="text-slate-300">
                  For {items.length} items, choosing {maxSelections}: <span className="font-mono font-bold text-cyan-400">C({items.length},{maxSelections}) = {totalCombinations}</span> combinations
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
              <Sparkles className="h-5 w-5 text-amber-400" />
              {currentChallenge.description}
            </h2>
            <div className="text-slate-400">
              {selectedCount} / {maxSelections} selected
            </div>
          </div>

          {/* Target Combination Display */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-400 mb-3">Find this secret combination:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {targetItems.map((itemId, idx) => {
                const item = items[itemId];
                if (!item) return null;
                const isSelected = items[itemId]?.selected;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring' }}
                    className={`px-4 py-3 rounded-xl text-2xl transition-all ${
                      isSelected
                        ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
                        : 'bg-slate-700/50 border-2 border-slate-600'
                    }`}
                  >
                    {item.emoji}
                    <span className="ml-2 text-sm text-slate-300">{item.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Your Selection */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Your Selection:</p>
            <div className="flex flex-wrap justify-center gap-2 min-h-[50px]">
              {items.filter(it => it.selected).length === 0 ? (
                <span className="text-slate-500 italic">Click items to select them...</span>
              ) : (
                items.filter(it => it.selected).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-2 rounded-lg text-xl"
                    style={{ backgroundColor: `${item.color}30`, border: `2px solid ${item.color}` }}
                  >
                    {item.emoji} {item.name}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D Guild Hall */}
        <CombinationsHall3D items={items} onItemClick={handleItemClick} maxSelections={maxSelections} />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={checkAnswer}
              size="lg"
              disabled={selectedCount !== maxSelections}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4" />
              Confirm Selection
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setItems(items.map((it) => ({ ...it, selected: false })))}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </motion.div>
        </div>

        {/* Learning Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { type: 'team' as const, title: '⚔️ Team Selection', desc: 'Choose 3 from 5', formula: 'C(5,3) = 10', color: 'red' },
            { type: 'potion' as const, title: '🔮 Potion Mix', desc: 'Choose 3 from 6', formula: 'C(6,3) = 20', color: 'purple' },
            { type: 'council' as const, title: '👑 Council Formation', desc: 'Choose 4 from 7', formula: 'C(7,4) = 35', color: 'amber' },
          ].map((card, idx) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-${card.color}-500/20 p-5 rounded-xl border border-${card.color}-500/30 backdrop-blur-sm cursor-pointer`}
              onClick={() => initializeChallenge(card.type)}
            >
              <h4 className="font-bold text-white mb-2">{card.title}</h4>
              <p className="text-sm text-slate-300 mb-2">{card.desc}</p>
              <p className="text-xs font-mono text-slate-400">{card.formula}</p>
            </motion.div>
          ))}
        </div>

        {/* Key Difference Explanation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Combinations vs Permutations
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
              <p className="font-bold text-amber-400 mb-1">🏰 Combinations</p>
              <p className="text-slate-300">Order doesn't matter! ABC = BCA = CAB</p>
              <p className="text-slate-400 mt-1">Choosing a team, picking ingredients</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <p className="font-bold text-purple-400 mb-1">🌀 Permutations</p>
              <p className="text-slate-300">Order matters! ABC ≠ BCA ≠ CAB</p>
              <p className="text-slate-400 mt-1">Password, ranking, sequence</p>
            </div>
          </div>
        </motion.div>
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
                animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                ✨
              </motion.div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-2xl shadow-2xl">
                Combination Found!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
