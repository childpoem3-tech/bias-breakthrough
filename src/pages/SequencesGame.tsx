import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SequenceOcean3D } from '@/components/3d/SequenceOcean3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SequencesGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequenceType, setSequenceType] = useState<'ap' | 'gp' | 'series'>('ap');
  const [islands, setIslands] = useState<any[]>([]);

  const generateSequence = (type: 'ap' | 'gp' | 'series') => {
    const newIslands = [];
    const start = Math.floor(Math.random() * 10) + 1;
    
    if (type === 'ap') {
      const diff = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < 5; i++) {
        newIslands.push({
          term: i + 1,
          value: start + diff * i,
          position: [-8 + i * 4, 0, 0],
          type: 'ap',
        });
      }
    } else if (type === 'gp') {
      const ratio = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < 5; i++) {
        newIslands.push({
          term: i + 1,
          value: start * Math.pow(ratio, i),
          position: [-8 + i * 4, 0, 0],
          type: 'gp',
        });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        newIslands.push({
          term: i + 1,
          value: start + i * i,
          position: [-8 + i * 4, 0, 0],
          type: 'series',
        });
      }
    }
    
    setIslands(newIslands);
  };

  const handleIslandClick = (island: any) => {
    toast.success(`Term ${island.term}: ${island.value}`);
  };

  const nextChallenge = (type: 'ap' | 'gp' | 'series') => {
    setSequenceType(type);
    generateSequence(type);
    setScore(score + 100);
    setLevel(level + 1);
  };

  useState(() => {
    generateSequence('ap');
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-blue-600 p-4">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            🌊 Arithmetic Odyssey
          </h1>
          <p className="text-lg text-white/90 mb-2">
            Navigate floating sequence islands
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-white/90 px-6 py-3 rounded-lg border border-white backdrop-blur-sm">
              <span className="text-sm text-muted-foreground">Level</span>
              <p className="text-2xl font-bold text-blue-600">{level}</p>
            </div>
            <div className="bg-white/90 px-6 py-3 rounded-lg border border-white backdrop-blur-sm">
              <span className="text-sm text-muted-foreground">Score</span>
              <p className="text-2xl font-bold text-blue-600">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 p-6 rounded-lg border border-white backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold mb-2">Current Sequence:</h3>
          <p className="text-2xl font-bold text-blue-600">
            {sequenceType === 'ap' && '📐 Arithmetic Progression (AP)'}
            {sequenceType === 'gp' && '📊 Geometric Progression (GP)'}
            {sequenceType === 'series' && '🔢 Series Summation'}
          </p>
        </div>

        <SequenceOcean3D islands={islands} onIslandClick={handleIslandClick} />

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Button onClick={() => nextChallenge('ap')} size="lg" className="bg-green-500 hover:bg-green-600">
            AP Challenge
          </Button>
          <Button onClick={() => nextChallenge('gp')} size="lg" className="bg-orange-500 hover:bg-orange-600">
            GP Challenge
          </Button>
          <Button onClick={() => nextChallenge('series')} size="lg" className="bg-purple-500 hover:bg-purple-600">
            Series Challenge
          </Button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-2">📐 Arithmetic (AP)</h4>
            <p className="text-sm text-white/80">Add constant difference each term</p>
          </div>
          <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-2">📊 Geometric (GP)</h4>
            <p className="text-sm text-white/80">Multiply by constant ratio each term</p>
          </div>
          <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-2">🔢 Series</h4>
            <p className="text-sm text-white/80">Sum of sequence terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
