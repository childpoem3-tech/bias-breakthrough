import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SequenceOcean3D } from '@/components/3d/SequenceOcean3D';
import { toast } from 'sonner';
import { ArrowLeft, Lightbulb, Trophy, Target, Sparkles, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SequenceIsland {
  term: number;
  value: number;
  position: [number, number, number];
  type: 'ap' | 'gp' | 'series';
}

export default function SequencesGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequenceType, setSequenceType] = useState<'ap' | 'gp' | 'series'>('ap');
  const [islands, setIslands] = useState<SequenceIsland[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFormula, setShowFormula] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<{ start: number; diff: number; ratio: number }>({ start: 2, diff: 3, ratio: 2 });
  const [missingTerm, setMissingTerm] = useState(3);
  const [streak, setStreak] = useState(0);

  const generateSequence = (type: 'ap' | 'gp' | 'series') => {
    const newIslands: SequenceIsland[] = [];
    const start = Math.floor(Math.random() * 5) + 1;
    const diff = Math.floor(Math.random() * 4) + 2;
    const ratio = Math.floor(Math.random() * 2) + 2;
    const missing = Math.floor(Math.random() * 3) + 2; // Terms 2, 3, or 4

    setMissingTerm(missing);
    setCurrentSequence({ start, diff, ratio });

    for (let i = 0; i < 5; i++) {
      let value = 0;
      if (type === 'ap') {
        value = start + diff * i;
      } else if (type === 'gp') {
        value = start * Math.pow(ratio, i);
      } else {
        value = (start * (i + 1) * (i + 2)) / 2;
      }

      newIslands.push({
        term: i + 1,
        value: i + 1 === missing ? -1 : value,
        position: [-8 + i * 4, 0, 0] as [number, number, number],
        type,
      });
    }

    setIslands(newIslands);
    setUserAnswer('');
  };

  useEffect(() => {
    generateSequence('ap');
  }, []);

  const handleIslandClick = (island: SequenceIsland) => {
    if (island.value === -1) {
      toast.info(`Find the ${island.term}${island.term === 1 ? 'st' : island.term === 2 ? 'nd' : island.term === 3 ? 'rd' : 'th'} term!`);
    } else {
      toast.success(`Term ${island.term}: ${island.value}`);
    }
  };

  const checkAnswer = () => {
    let correctValue = 0;
    if (sequenceType === 'ap') {
      correctValue = currentSequence.start + currentSequence.diff * (missingTerm - 1);
    } else if (sequenceType === 'gp') {
      correctValue = currentSequence.start * Math.pow(currentSequence.ratio, missingTerm - 1);
    } else {
      correctValue = (currentSequence.start * missingTerm * (missingTerm + 1)) / 2;
    }

    if (parseInt(userAnswer) === correctValue) {
      setShowSuccess(true);
      setScore(score + 100 * (streak + 1));
      setStreak(streak + 1);
      setLevel(level + 1);
      toast.success(`Correct! The answer is ${correctValue} 🎉`);
      
      setTimeout(() => {
        setShowSuccess(false);
        generateSequence(sequenceType);
      }, 2000);
    } else {
      setStreak(0);
      toast.error(`Wrong! The correct answer was ${correctValue}`);
    }
  };

  const nextChallenge = (type: 'ap' | 'gp' | 'series') => {
    setSequenceType(type);
    generateSequence(type);
  };

  const getFormula = () => {
    switch (sequenceType) {
      case 'ap':
        return { name: 'Arithmetic Progression', formula: 'aₙ = a₁ + (n-1)d', desc: `a₁ = ${currentSequence.start}, d = ${currentSequence.diff}` };
      case 'gp':
        return { name: 'Geometric Progression', formula: 'aₙ = a₁ × r^(n-1)', desc: `a₁ = ${currentSequence.start}, r = ${currentSequence.ratio}` };
      case 'series':
        return { name: 'Triangular Series', formula: 'Sₙ = n(n+1)/2 × a', desc: `a = ${currentSequence.start}` };
    }
  };

  const formulaInfo = getFormula();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Animated Background Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
            style={{ top: `${20 + i * 15}%`, left: '-100%', width: '200%' }}
            animate={{ x: ['0%', '50%'] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-white/10"
            style={{ left: `${Math.random() * 100}%`, bottom: '-20px' }}
            animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 1, 0] }}
            transition={{ duration: 8 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5 }}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🌊 Arithmetic Odyssey
          </h1>
          <p className="text-slate-300">Navigate the sequence islands and find the missing terms!</p>
        </motion.div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl px-6 py-3"
          >
            <p className="text-xs text-cyan-300/70">Level</p>
            <p className="text-2xl font-bold text-cyan-400">{level}</p>
          </motion.div>
          <AnimatePresence>
            {streak > 0 && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5 text-orange-400" />
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
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-indigo-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  {formulaInfo.name}
                </h3>
                <div className="text-3xl font-mono font-bold text-white mb-2">{formulaInfo.formula}</div>
                <p className="text-indigo-200">{formulaInfo.desc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Challenge */}
        <motion.div 
          layout
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">
                {sequenceType === 'ap' && '📐 Arithmetic Progression'}
                {sequenceType === 'gp' && '📊 Geometric Progression'}
                {sequenceType === 'series' && '🔢 Series Pattern'}
              </h2>
            </div>
            <div className="text-slate-400">
              Find the <span className="text-cyan-400 font-bold">{missingTerm}{missingTerm === 2 ? 'nd' : missingTerm === 3 ? 'rd' : 'th'}</span> term
            </div>
          </div>

          {/* Sequence Display */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {islands.map((island, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                className={`relative px-6 py-4 rounded-xl font-mono text-xl font-bold transition-all ${
                  island.value === -1
                    ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 animate-pulse'
                    : 'bg-slate-700/50 border border-slate-600 text-white'
                }`}
              >
                <span className="text-xs text-slate-400 absolute top-1 left-2">a{island.term}</span>
                {island.value === -1 ? '?' : island.value}
              </motion.div>
            ))}
          </div>

          {/* Answer Input */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-40 px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white text-center text-xl font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <Button onClick={checkAnswer} size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <Sparkles className="h-4 w-4" />
              Submit Answer
            </Button>
          </div>
        </motion.div>

        {/* 3D Visualization */}
        <SequenceOcean3D islands={islands} onIslandClick={handleIslandClick} />

        {/* Sequence Type Buttons */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { type: 'ap' as const, label: 'AP Challenge', color: 'from-green-500 to-emerald-600', icon: '📐' },
            { type: 'gp' as const, label: 'GP Challenge', color: 'from-orange-500 to-amber-600', icon: '📊' },
            { type: 'series' as const, label: 'Series Challenge', color: 'from-purple-500 to-violet-600', icon: '🔢' },
          ].map((item) => (
            <motion.div key={item.type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => nextChallenge(item.type)} 
                size="lg" 
                className={`w-full bg-gradient-to-r ${item.color} hover:opacity-90 gap-2`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Learning Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { type: 'ap', title: '📐 Arithmetic (AP)', desc: 'Each term = previous + constant difference (d)', example: '2, 5, 8, 11... (d=3)', color: 'green' },
            { type: 'gp', title: '📊 Geometric (GP)', desc: 'Each term = previous × constant ratio (r)', example: '2, 6, 18, 54... (r=3)', color: 'orange' },
            { type: 'series', title: '🔢 Series', desc: 'Sum of sequence terms following a pattern', example: '1, 3, 6, 10... (triangular)', color: 'purple' },
          ].map((card, idx) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-${card.color}-500/20 p-5 rounded-xl border border-${card.color}-500/30 backdrop-blur-sm cursor-pointer transition-colors hover:bg-${card.color}-500/30`}
              onClick={() => nextChallenge(card.type as 'ap' | 'gp' | 'series')}
            >
              <h4 className="font-bold text-white mb-2">{card.title}</h4>
              <p className="text-sm text-slate-300 mb-2">{card.desc}</p>
              <p className="text-xs font-mono text-slate-400">Example: {card.example}</p>
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
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-2xl shadow-2xl">
                Correct! +{100 * (streak + 1)} points
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
