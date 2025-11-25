import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProbabilityRealm3D } from '@/components/3d/ProbabilityRealm3D';
import { toast } from 'sonner';
import { ArrowLeft, Dices, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProbabilityGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'dice' | 'urn' | 'cards'>('dice');
  const [score, setScore] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [urnBalls] = useState([
    { color: '#ef4444', count: 3 },
    { color: '#3b82f6', count: 5 },
  ]);
  const [challenge, setChallenge] = useState({ text: 'Roll an even number', type: 'even' });
  const [history, setHistory] = useState<number[]>([]);

  const rollDice = () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);
      setHistory(prev => [...prev.slice(-4), value]);
      
      let won = false;
      if (challenge.type === 'even' && value % 2 === 0) {
        won = true;
        setChallenge({ text: 'Roll an odd number', type: 'odd' });
      } else if (challenge.type === 'odd' && value % 2 !== 0) {
        won = true;
        setChallenge({ text: 'Roll a number greater than 3', type: 'greater' });
      } else if (challenge.type === 'greater' && value > 3) {
        won = true;
        setChallenge({ text: 'Roll a number less than 4', type: 'less' });
      } else if (challenge.type === 'less' && value < 4) {
        won = true;
        setChallenge({ text: 'Roll an even number', type: 'even' });
      }

      if (won) {
        const bonus = streak >= 2 ? 50 : 0;
        setScore(score + 100 + bonus);
        setStreak(prev => prev + 1);
        setShowWin(true);
        toast.success(`Rolled ${value}! Challenge complete! ${bonus > 0 ? `+${bonus} streak bonus!` : ''}`);
        setTimeout(() => setShowWin(false), 2000);
      } else {
        toast.error(`Rolled ${value}. Try again!`);
        setStreak(0);
      }
    }, 1500);
  };

  const switchMode = (newMode: 'dice' | 'urn' | 'cards') => {
    setMode(newMode);
    if (newMode === 'dice') {
      setChallenge({ text: 'Roll an even number', type: 'even' });
    } else if (newMode === 'urn') {
      setChallenge({ text: 'Calculate probability of drawing red ball', type: 'urn' });
    } else {
      setChallenge({ text: 'Calculate probability of drawing an Ace', type: 'cards' });
    }
  };

  const probabilityHint = () => {
    if (challenge.type === 'even') return 'P(even) = 3/6 = 50%';
    if (challenge.type === 'odd') return 'P(odd) = 3/6 = 50%';
    if (challenge.type === 'greater') return 'P(>3) = 3/6 = 50%';
    if (challenge.type === 'less') return 'P(<4) = 3/6 = 50%';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 p-4 overflow-hidden relative">
      {/* Magical floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${['#a855f7', '#3b82f6', '#ec4899', '#fbbf24'][i % 4]}, transparent)`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [window.innerHeight + 20, -20],
              x: [0, Math.sin(i) * 50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            🔮 Probability Realm
          </h1>
          <p className="text-lg text-slate-300/80">
            Master the mystical laws of chance
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 rounded-xl border border-purple-500/30 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Dices className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-purple-300/70">Mode</span>
            </div>
            <p className="text-2xl font-bold text-purple-400 capitalize">{mode}</p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-4 rounded-xl border border-amber-500/30 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300/70">Score</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{score}</p>
          </motion.div>

          <motion.div 
            className={`bg-gradient-to-br from-pink-500/20 to-pink-600/10 p-4 rounded-xl border ${streak >= 2 ? 'border-pink-400 shadow-lg shadow-pink-500/30' : 'border-pink-500/30'} backdrop-blur-sm`}
            animate={streak >= 2 ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span className="text-xs text-pink-300/70">Streak</span>
            </div>
            <p className="text-2xl font-bold text-pink-400">{streak}🔥</p>
          </motion.div>
        </div>

        {/* Challenge Card */}
        <motion.div 
          className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-purple-300/70 mb-1">Current Challenge</h3>
              <motion.p 
                key={challenge.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white"
              >
                {challenge.text}
              </motion.p>
            </div>
            <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-300/70">Probability Hint</p>
              <p className="text-lg font-mono font-bold text-purple-400">{probabilityHint()}</p>
            </div>
          </div>
        </motion.div>

        {/* Roll History */}
        {history.length > 0 && (
          <div className="flex justify-center gap-2 mb-6">
            <span className="text-slate-500 text-sm self-center">History:</span>
            {history.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: i === history.length - 1 ? 1 : 0.5 }}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                  i === history.length - 1 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {val}
              </motion.div>
            ))}
          </div>
        )}

        {/* 3D View */}
        <div className="relative">
          <ProbabilityRealm3D
            mode={mode}
            diceValue={diceValue}
            isRolling={isRolling}
            onRoll={rollDice}
            urnBalls={urnBalls}
          />

          {/* Win Animation Overlay */}
          <AnimatePresence>
            {showWin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-center"
                >
                  <div className="text-8xl mb-2">✨</div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-full text-2xl shadow-2xl">
                    +100{streak >= 2 ? ' +50 STREAK!' : ''}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode Buttons */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { mode: 'dice' as const, icon: '🎲', label: 'Dice Events' },
            { mode: 'urn' as const, icon: '🏺', label: 'Urn Problems' },
            { mode: 'cards' as const, icon: '🃏', label: 'Card Draws' },
          ].map((item) => (
            <motion.div key={item.mode} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => switchMode(item.mode)}
                size="lg"
                variant={mode === item.mode ? 'default' : 'outline'}
                className={`w-full h-14 text-lg ${mode === item.mode ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : ''}`}
              >
                {item.icon} {item.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Roll Button for Dice Mode */}
        {mode === 'dice' && (
          <motion.div 
            className="flex justify-center mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={rollDice} 
              size="lg" 
              disabled={isRolling}
              className="h-16 px-12 text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 animate-gradient bg-[length:200%_100%]"
            >
              {isRolling ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  🎲
                </motion.span>
              ) : (
                '🎲 Roll Dice'
              )}
            </Button>
          </motion.div>
        )}

        {/* Concept Cards */}
        <motion.div 
          className="mt-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Probability Concepts
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🎲', title: 'Dice', color: 'blue', desc: '6 equally likely outcomes (1-6)', formula: 'P(even) = 3/6 = 1/2' },
              { icon: '🏺', title: 'Urns', color: 'purple', desc: 'Draw balls without replacement', formula: 'P(red) = red / total' },
              { icon: '🃏', title: 'Cards', color: 'pink', desc: '52 cards, 4 suits', formula: 'P(Ace) = 4/52 = 1/13' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-xl border border-slate-700/50"
              >
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span> {item.title}
                </h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
                <p className="text-xs text-purple-400 mt-2 font-mono">{item.formula}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
