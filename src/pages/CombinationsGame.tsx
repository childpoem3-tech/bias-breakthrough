import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CombinationsHall3D } from '@/components/3d/CombinationsHall3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CombinationsGame() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<'team' | 'potion' | 'council'>('team');
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [maxSelections, setMaxSelections] = useState(3);

  const challenges = {
    team: {
      name: 'Team Selection',
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
    
    setItems(newItems);
  };

  useState(() => {
    initializeChallenge('team');
  });

  const handleItemClick = (id: number) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;

    if (item.selected) {
      setItems(items.map((it) => (it.id === id ? { ...it, selected: false } : it)));
    } else {
      const currentSelections = items.filter((it) => it.selected).length;
      if (currentSelections < maxSelections) {
        setItems(items.map((it) => (it.id === id ? { ...it, selected: true } : it)));
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
    const selected = items.filter((it) => it.selected);
    if (selected.length === maxSelections) {
      const totalCombinations = calculateCombinations(items.length, maxSelections);
      toast.success(`Perfect selection! Total combinations: ${totalCombinations}`);
      setScore(score + maxSelections * 150);
      
      // Next challenge
      if (challenge === 'team') {
        initializeChallenge('potion');
      } else if (challenge === 'potion') {
        initializeChallenge('council');
      } else {
        initializeChallenge('team');
      }
    } else {
      toast.error(`Select exactly ${maxSelections} items!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-gray-900 to-purple-900 p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <Button
          variant="outline"
          onClick={() => navigate('/home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
            🏰 Combination Quest
          </h1>
          <p className="text-lg text-white/80 mb-2">
            Select the perfect combination in the Guild Hall
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Challenge</span>
              <p className="text-2xl font-bold text-amber-400">
                {challenges[challenge].name}
              </p>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Score</span>
              <p className="text-2xl font-bold text-purple-400">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Quest:</h3>
          <p className="text-2xl font-bold text-amber-400">
            Select {maxSelections} out of {items.length} items
          </p>
          <p className="text-sm text-white/60 mt-2">
            Selected: {items.filter((it) => it.selected).length} / {maxSelections}
          </p>
          <p className="text-sm text-white/60">
            Total combinations: {calculateCombinations(items.length, maxSelections)}
          </p>
        </div>

        <CombinationsHall3D
          items={items}
          onItemClick={handleItemClick}
          maxSelections={maxSelections}
        />

        <div className="flex gap-4 mt-6 justify-center">
          <Button
            onClick={checkAnswer}
            size="lg"
            disabled={items.filter((it) => it.selected).length !== maxSelections}
          >
            Confirm Selection
          </Button>
          <Button
            onClick={() => setItems(items.map((it) => ({ ...it, selected: false })))}
            variant="outline"
            size="lg"
          >
            Clear All
          </Button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-red-400 mb-2">⚔️ Team Selection</h4>
            <p className="text-sm text-white/70">Choose 3 heroes from 5</p>
          </div>
          <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-purple-400 mb-2">🔮 Potion Mix</h4>
            <p className="text-sm text-white/70">Combine 3 ingredients from 6</p>
          </div>
          <div className="bg-amber-500/20 p-4 rounded-lg border border-amber-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-amber-400 mb-2">👑 Council Formation</h4>
            <p className="text-sm text-white/70">Form council of 4 from 7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
