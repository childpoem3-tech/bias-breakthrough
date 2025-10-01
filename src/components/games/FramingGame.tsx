import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameLevel } from '@/types/game';
import { ChevronLeft, AlertCircle } from 'lucide-react';

interface FramingGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const FramingGame = ({ level, onComplete, onBack }: FramingGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'choice1' | 'choice2' | 'result'>('instructions');
  const [choice1, setChoice1] = useState<'A' | 'B' | null>(null);
  const [choice2, setChoice2] = useState<'A' | 'B' | null>(null);
  const [startTime, setStartTime] = useState(0);

  const getScenario = () => {
    switch (level) {
      case 'beginner':
        return {
          title: 'Medical Treatment Decision',
          frame1: {
            positive: 'Option A: 90% survival rate',
            negative: 'Option B: 10% mortality rate',
          },
          frame2: {
            positive: 'Option A: Saves 600 out of 600 patients',
            negative: 'Option B: 0 patients die',
          }
        };
      case 'intermediate':
        return {
          title: 'Investment Decision',
          frame1: {
            positive: 'Option A: 80% chance to gain $500',
            negative: 'Option B: 20% chance to lose $500',
          },
          frame2: {
            positive: 'Option A: Keep $400 for sure',
            negative: 'Option B: Risk losing $100',
          }
        };
      case 'advanced':
        return {
          title: 'Business Decision',
          frame1: {
            positive: 'Option A: 70% chance company succeeds',
            negative: 'Option B: 30% chance company fails',
          },
          frame2: {
            positive: 'Option A: Profit margin of 70%',
            negative: 'Option B: Loss potential of 30%',
          }
        };
      default:
        return getScenario();
    }
  };

  const scenario = getScenario();

  const startGame = () => {
    setStartTime(Date.now());
    setPhase('choice1');
  };

  const handleChoice1 = (choice: 'A' | 'B') => {
    setChoice1(choice);
    setTimeout(() => setPhase('choice2'), 500);
  };

  const handleChoice2 = (choice: 'A' | 'B') => {
    setChoice2(choice);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    setTimeout(() => {
      setPhase('result');
      
      setTimeout(() => {
        const isConsistent = choice1 === choice;
        const framingEffect = !isConsistent;
        
        onComplete({
          gameId: 'framing_game_v1',
          level,
          inputs: { choice1, choice2 },
          outcome: { isConsistent, framingEffect },
          score: isConsistent ? 100 : 50,
          timeTakenSec: timeTaken
        });
      }, 2000);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-accent/10 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Loss vs. Gain Framing</h2>
          <p className="text-muted-foreground">{scenario.title}</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm">
                <li>• You'll see the same choice presented in two different ways</li>
                <li>• Each time, choose your preferred option (A or B)</li>
                <li>• Notice if your choice changes based on how it's worded</li>
                <li>• This measures the "framing effect" - how wording influences decisions</li>
              </ul>
            </div>

            <div className="p-4 bg-warning/10 border-2 border-warning rounded-lg">
              <p className="text-sm text-center">
                <strong>Important:</strong> Both options are logically identical, just worded differently.
              </p>
            </div>

            <Button onClick={startGame} size="lg" className="w-full">
              Begin Test
            </Button>
          </div>
        )}

        {phase === 'choice1' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Scenario 1</h3>
              <p className="text-muted-foreground">Choose your preferred option:</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice1('A')}
                className="h-24 text-lg font-semibold border-2 hover:bg-primary/10 hover:border-primary"
              >
                {scenario.frame1.positive}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice1('B')}
                className="h-24 text-lg font-semibold border-2 hover:bg-primary/10 hover:border-primary"
              >
                {scenario.frame1.negative}
              </Button>
            </div>
          </div>
        )}

        {phase === 'choice2' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Scenario 2</h3>
              <p className="text-muted-foreground">Choose your preferred option:</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice2('A')}
                className="h-24 text-lg font-semibold border-2 hover:bg-primary/10 hover:border-primary"
              >
                {scenario.frame2.positive}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice2('B')}
                className="h-24 text-lg font-semibold border-2 hover:bg-primary/10 hover:border-primary"
              >
                {scenario.frame2.negative}
              </Button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 animate-fade-in text-center py-12">
            <div className="text-6xl mb-4">
              {choice1 === choice2 ? '✓' : '⚠️'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {choice1 === choice2 ? 'Consistent Choice!' : 'Framing Effect Detected'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {choice1 === choice2 
                ? 'You made the same choice regardless of how it was framed.'
                : 'Your choice changed based on how the option was presented. This is the framing effect.'}
            </p>
            <div className="text-sm text-muted-foreground mt-4">
              Processing results...
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};