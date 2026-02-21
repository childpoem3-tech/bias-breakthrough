import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FactorsWorld3D } from '@/components/3d/FactorsWorld3D';
import { toast } from 'sonner';
import { ArrowLeft, Crown, Sparkles, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreakMultiplier } from '@/hooks/useStreakMultiplier';

export default function FactorsGame() {
  const navigate = useNavigate();
  const { multiplier, applyMultiplier } = useStreakMultiplier();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetNumber, setTargetNumber] = useState(12);
  const [selectedFactors, setSelectedFactors] = useState<number[]>([]);
  const [factors, setFactors] = useState<any[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [streak, setStreak] = useState(0);

  const generateFactors = (num: number) => {
    const factorList = [];
    const zones = ['forest', 'valley', 'tower'];
    const colors = ['#22c55e', '#3b82f6', '#a855f7'];
    
    let idx = 0;
    for (let i = 1; i <= num; i++) {
      if (num % i === 0) {
        const zone = zones[idx % 3];
        const zoneOffset = idx % 3;
        factorList.push({
          value: i,
          position: [
            (Math.random() - 0.5) * 4 + zoneOffset * 4 - 4,
            0,
            (Math.random() - 0.5) * 4 + zoneOffset * 4 - 4,
          ],
          color: colors[idx % 3],
          zone,
        });
        idx++;
      }
    }
    return factorList;
  };

  useEffect(() => {
    setFactors(generateFactors(targetNumber));
  }, [targetNumber]);

  const handleFactorClick = (value: number) => {
    if (selectedFactors.includes(value)) {
      setSelectedFactors(selectedFactors.filter((f) => f !== value));
    } else {
      setSelectedFactors([...selectedFactors, value]);
    }
  };

  const checkAnswer = () => {
    const correctFactors = factors.map((f) => f.value);
    if (
      selectedFactors.length === correctFactors.length &&
      selectedFactors.every((f) => correctFactors.includes(f))
    ) {
      const newStreak = streak + 1;
      const bonusPoints = newStreak > 1 ? newStreak * 50 : 0;
      const basePoints = level * 100 + bonusPoints;
      const totalPoints = applyMultiplier(basePoints);
      
      setShowVictory(true);
      setStreak(newStreak);
      toast.success(`Perfect! +${totalPoints} pts${multiplier > 1 ? ` (${multiplier}x streak bonus!)` : ''} 🎉`);
      setScore(score + totalPoints);
      
      setTimeout(() => {
        setShowVictory(false);
        setLevel(level + 1);
        const newTarget = targetNumber + Math.floor(Math.random() * 10) + 5;
        setTargetNumber(newTarget);
        setSelectedFactors([]);
      }, 2000);
    } else {
      setStreak(0);
      toast.error('Not quite right. Try again! ❌');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto py-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="inline-block mr-2 mb-2" /> Kingdom of Factors
          </motion.h1>
          <p className="text-lg text-muted-foreground mb-4">
            Explore floating islands and discover the factors hidden within
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <motion.div
              className="bg-background-secondary px-6 py-3 rounded-lg border border-border"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm text-muted-foreground">Level</span>
              <p className="text-2xl font-bold text-primary">{level}</p>
            </motion.div>
            <motion.div
              className="bg-background-secondary px-6 py-3 rounded-lg border border-border"
              whileHover={{ scale: 1.05 }}
              animate={showVictory ? { scale: [1, 1.2, 1] } : {}}
            >
              <span className="text-sm text-muted-foreground">Score</span>
              <p className="text-2xl font-bold text-accent">{score}</p>
            </motion.div>
            {streak > 1 && (
              <motion.div
                className="bg-orange-500/20 px-6 py-3 rounded-lg border border-orange-500/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm text-orange-300">🔥 Streak</span>
                <p className="text-2xl font-bold text-orange-500">{streak}x</p>
              </motion.div>
            )}
            {multiplier > 1 && (
              <motion.div
                className="bg-primary/20 px-6 py-3 rounded-lg border border-primary/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm text-primary/80"><Zap className="inline w-3 h-3" /> Daily Bonus</span>
                <p className="text-2xl font-bold text-primary">{multiplier}x</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="bg-background-secondary p-6 rounded-lg border border-border mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="text-primary" />
            Find all factors of:
          </h3>
          <motion.p
            className="text-4xl md:text-5xl font-bold text-primary"
            key={targetNumber}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            {targetNumber}
          </motion.p>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-bold text-foreground">{selectedFactors.length}</span> / {factors.length}
            </p>
            <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(selectedFactors.length / factors.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        <FactorsWorld3D
          factors={factors}
          selectedFactors={selectedFactors}
          onFactorClick={handleFactorClick}
        />

        <motion.div
          className="flex gap-4 mt-6 justify-center flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={checkAnswer} size="lg" disabled={selectedFactors.length === 0}>
              <Trophy className="mr-2 h-4 w-4" />
              Check Answer
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setSelectedFactors([])}
              variant="outline"
              size="lg"
            >
              Clear Selection
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                setTargetNumber(targetNumber + 5);
                setSelectedFactors([]);
                setStreak(0);
              }}
              variant="secondary"
              size="lg"
            >
              Skip Challenge
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            { color: 'green', icon: '🌲', title: 'Common Factor Forest', desc: 'Small factors live here' },
            { color: 'blue', icon: '🏔️', title: 'Valley of Groups', desc: 'Middle factors gather here' },
            { color: 'purple', icon: '🗼', title: 'Trinomial Towers', desc: 'Large factors stand tall' }
          ].map((zone, i) => (
            <motion.div
              key={i}
              className={`bg-${zone.color}-500/10 p-4 rounded-lg border border-${zone.color}-500/20`}
              whileHover={{ scale: 1.05, borderColor: `hsl(var(--${zone.color}))` }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <h4 className={`font-bold text-${zone.color}-500 mb-2`}>
                {zone.icon} {zone.title}
              </h4>
              <p className="text-sm text-muted-foreground">{zone.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn About Factors Card */}
        <motion.div
          className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h4 className="font-bold text-lg mb-2">📚 What are Factors?</h4>
          <p className="text-sm text-muted-foreground">
            Factors are numbers that divide evenly into another number. For example, the factors of 12 are: 1, 2, 3, 4, 6, and 12.
            Every number has at least two factors: 1 and itself!
          </p>
        </motion.div>
      </div>

      {/* Victory Overlay */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 p-12 rounded-2xl border-4 border-primary text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="w-24 h-24 mx-auto mb-4 text-primary" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                All Factors Found!
              </h2>
              <p className="text-2xl font-bold text-foreground">
                Level {level} Complete! 🎉
              </p>
              {streak > 1 && (
                <motion.p
                  className="text-xl text-orange-500 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  🔥 {streak}x Streak Bonus! +{streak * 50} points
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
