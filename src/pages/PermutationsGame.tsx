import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PermutationsPortal3D } from '@/components/3d/PermutationsPortal3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PermutationsGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<'basic' | 'time' | 'chrono'>('basic');
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [requiredCount, setRequiredCount] = useState(3);

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
    
    setKeys(newKeys);
    setSelectedOrder([]);
  };

  useState(() => {
    initializeLevel('basic');
  });

  const handleKeyClick = (id: number) => {
    const key = keys.find((k) => k.id === id);
    if (!key) return;

    if (key.selected) {
      // Deselect
      setSelectedOrder(selectedOrder.filter((sid) => sid !== id));
      setKeys(
        keys.map((k) =>
          k.id === id ? { ...k, selected: false, order: undefined } : k
        )
      );
    } else {
      // Select
      if (selectedOrder.length < requiredCount) {
        const newOrder = [...selectedOrder, id];
        setSelectedOrder(newOrder);
        setKeys(
          keys.map((k) =>
            k.id === id
              ? { ...k, selected: true, order: newOrder.length }
              : k
          )
        );
      } else {
        toast.error('Maximum keys selected!');
      }
    }
  };

  const calculatePermutations = () => {
    let factorial = 1;
    for (let i = 1; i <= requiredCount; i++) {
      factorial *= i;
    }
    return factorial;
  };

  const checkAnswer = () => {
    if (selectedOrder.length === requiredCount) {
      toast.success(`Correct arrangement! Total permutations: ${calculatePermutations()}`);
      setScore(score + requiredCount * 200);
      
      // Level up
      if (level === 'basic') {
        setLevel('time');
        initializeLevel('time');
      } else if (level === 'time') {
        setLevel('chrono');
        initializeLevel('chrono');
      } else {
        initializeLevel('chrono');
      }
    } else {
      toast.error('Select all keys in order!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            🌀 Permutation Portal
          </h1>
          <p className="text-lg text-white/80 mb-2">
            Unlock time portals with key sequences
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Level</span>
              <p className="text-2xl font-bold text-purple-400">
                {level === 'basic' ? 'Basic Portal' : level === 'time' ? 'Time Gate' : 'Chrono Lock'}
              </p>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Score</span>
              <p className="text-2xl font-bold text-blue-400">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Mission:</h3>
          <p className="text-2xl font-bold text-purple-400">
            Select {requiredCount} keys in order
          </p>
          <p className="text-sm text-white/60 mt-2">
            Selected: {selectedOrder.length} / {requiredCount}
          </p>
          <p className="text-sm text-white/60">
            Total possible permutations: {calculatePermutations()}
          </p>
        </div>

        <PermutationsPortal3D
          keys={keys}
          onKeyClick={handleKeyClick}
          level={level}
        />

        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={checkAnswer} size="lg" disabled={selectedOrder.length !== requiredCount}>
            Unlock Portal
          </Button>
          <Button
            onClick={() => {
              setSelectedOrder([]);
              setKeys(keys.map((k) => ({ ...k, selected: false, order: undefined })));
            }}
            variant="outline"
            size="lg"
          >
            Reset Selection
          </Button>
        </div>

        <div className="mt-8 bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-3">Portal Levels:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
              <h4 className="font-bold text-green-400 mb-2">🔑 Basic Portal</h4>
              <p className="text-sm text-white/70">3 keys - 6 permutations</p>
            </div>
            <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
              <h4 className="font-bold text-orange-400 mb-2">⏰ Time Gate</h4>
              <p className="text-sm text-white/70">4 keys - 24 permutations</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30">
              <h4 className="font-bold text-purple-400 mb-2">🌀 Chrono Lock</h4>
              <p className="text-sm text-white/70">5 keys - 120 permutations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
