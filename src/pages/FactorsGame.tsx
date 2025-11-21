import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FactorsWorld3D } from '@/components/3d/FactorsWorld3D';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FactorsGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetNumber, setTargetNumber] = useState(12);
  const [selectedFactors, setSelectedFactors] = useState<number[]>([]);
  const [factors, setFactors] = useState<any[]>([]);

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
      toast.success('Perfect! All factors found! 🎉');
      setScore(score + level * 100);
      setLevel(level + 1);
      const newTarget = targetNumber + Math.floor(Math.random() * 10) + 5;
      setTargetNumber(newTarget);
      setSelectedFactors([]);
    } else {
      toast.error('Not quite right. Try again! ❌');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            👑 Kingdom of Factors
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Explore floating islands in Algebraia
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="bg-background-secondary px-6 py-3 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Level</span>
              <p className="text-2xl font-bold text-primary">{level}</p>
            </div>
            <div className="bg-background-secondary px-6 py-3 rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">Score</span>
              <p className="text-2xl font-bold text-accent">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary p-6 rounded-lg border border-border mb-6">
          <h3 className="text-xl font-bold mb-2">Find all factors of:</h3>
          <p className="text-4xl font-bold text-primary">{targetNumber}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Selected: {selectedFactors.length} / {factors.length}
          </p>
        </div>

        <FactorsWorld3D
          factors={factors}
          selectedFactors={selectedFactors}
          onFactorClick={handleFactorClick}
        />

        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={checkAnswer} size="lg" disabled={selectedFactors.length === 0}>
            Check Answer
          </Button>
          <Button
            onClick={() => setSelectedFactors([])}
            variant="outline"
            size="lg"
          >
            Clear Selection
          </Button>
          <Button
            onClick={() => {
              setTargetNumber(targetNumber + 5);
              setSelectedFactors([]);
            }}
            variant="secondary"
            size="lg"
          >
            Skip Challenge
          </Button>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <h4 className="font-bold text-green-500 mb-2">🌲 Common Factor Forest</h4>
            <p className="text-sm text-muted-foreground">Small factors live here</p>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h4 className="font-bold text-blue-500 mb-2">🏔️ Valley of Groups</h4>
            <p className="text-sm text-muted-foreground">Middle factors gather here</p>
          </div>
          <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
            <h4 className="font-bold text-purple-500 mb-2">🗼 Trinomial Towers</h4>
            <p className="text-sm text-muted-foreground">Large factors stand tall</p>
          </div>
        </div>
      </div>
    </div>
  );
}
