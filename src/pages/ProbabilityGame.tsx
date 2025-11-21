import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProbabilityRealm3D } from '@/components/3d/ProbabilityRealm3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProbabilityGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'dice' | 'urn' | 'cards'>('dice');
  const [score, setScore] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [urnBalls, setUrnBalls] = useState([
    { color: '#ef4444', count: 3 },
    { color: '#3b82f6', count: 5 },
  ]);
  const [challenge, setChallenge] = useState('Roll an even number');

  const rollDice = () => {
    setIsRolling(true);
    toast.info('Rolling dice... 🎲');
    
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);
      
      if (value % 2 === 0) {
        toast.success(`Rolled ${value}! Even number! ✅`);
        setScore(score + 100);
        setChallenge('Roll an odd number');
      } else if (challenge.includes('odd')) {
        toast.success(`Rolled ${value}! Odd number! ✅`);
        setScore(score + 100);
        setChallenge('Roll a number greater than 3');
      } else if (value > 3 && challenge.includes('greater')) {
        toast.success(`Rolled ${value}! Greater than 3! ✅`);
        setScore(score + 150);
        setChallenge('Roll an even number');
      } else {
        toast.error(`Rolled ${value}. Try again! ❌`);
      }
    }, 1500);
  };

  const switchMode = (newMode: 'dice' | 'urn' | 'cards') => {
    setMode(newMode);
    if (newMode === 'dice') {
      setChallenge('Roll an even number');
    } else if (newMode === 'urn') {
      setChallenge('Calculate probability of drawing red ball');
    } else {
      setChallenge('Calculate probability of drawing an Ace');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
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
            🔮 Probability Realm
          </h1>
          <p className="text-lg text-white/80 mb-2">
            Master the mystical laws of chance
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Mode</span>
              <p className="text-2xl font-bold text-purple-400 capitalize">{mode}</p>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-sm text-white/60">Score</span>
              <p className="text-2xl font-bold text-blue-400">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Challenge:</h3>
          <p className="text-2xl font-bold text-purple-400">{challenge}</p>
        </div>

        <ProbabilityRealm3D
          mode={mode}
          diceValue={diceValue}
          isRolling={isRolling}
          onRoll={rollDice}
          urnBalls={urnBalls}
        />

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Button
            onClick={() => switchMode('dice')}
            size="lg"
            variant={mode === 'dice' ? 'default' : 'outline'}
          >
            🎲 Dice Events
          </Button>
          <Button
            onClick={() => switchMode('urn')}
            size="lg"
            variant={mode === 'urn' ? 'default' : 'outline'}
          >
            🏺 Urn Problems
          </Button>
          <Button
            onClick={() => switchMode('cards')}
            size="lg"
            variant={mode === 'cards' ? 'default' : 'outline'}
          >
            🃏 Card Draws
          </Button>
        </div>

        {mode === 'dice' && (
          <div className="flex justify-center mt-6">
            <Button onClick={rollDice} size="lg" disabled={isRolling}>
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
          </div>
        )}

        <div className="mt-8 bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-3">Probability Concepts:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
              <h4 className="font-bold text-blue-400 mb-2">🎲 Dice</h4>
              <p className="text-sm text-white/70">6 equally likely outcomes (1-6)</p>
              <p className="text-xs text-white/50 mt-1">P(even) = 3/6 = 1/2</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30">
              <h4 className="font-bold text-purple-400 mb-2">🏺 Urns</h4>
              <p className="text-sm text-white/70">Draw balls without replacement</p>
              <p className="text-xs text-white/50 mt-1">P(red) = red balls / total balls</p>
            </div>
            <div className="bg-pink-500/20 p-4 rounded-lg border border-pink-500/30">
              <h4 className="font-bold text-pink-400 mb-2">🃏 Cards</h4>
              <p className="text-sm text-white/70">52 cards, 4 suits</p>
              <p className="text-xs text-white/50 mt-1">P(Ace) = 4/52 = 1/13</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
