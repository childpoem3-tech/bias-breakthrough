import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameLevel } from '@/types/game';
import { ChevronLeft, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface SocialComparisonGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const SocialComparisonGame = ({ level, onComplete, onBack }: SocialComparisonGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'comparing' | 'result'>('instructions');
  const [round, setRound] = useState(1);
  const [choices, setChoices] = useState<('stay' | 'switch')[]>([]);
  const [startTime, setStartTime] = useState(0);

  const totalRounds = 3;

  const getPayoffs = () => {
    const scenarios = {
      beginner: [
        { you: 100, other: 80 },
        { you: 80, other: 100 },
        { you: 90, other: 90 },
      ],
      intermediate: [
        { you: 120, other: 100 },
        { you: 80, other: 120 },
        { you: 100, other: 100 },
      ],
      advanced: [
        { you: 150, other: 120 },
        { you: 80, other: 150 },
        { you: 100, other: 130 },
      ]
    };
    
    return scenarios[level][round - 1];
  };

  const startGame = () => {
    setStartTime(Date.now());
    setPhase('comparing');
  };

  const handleChoice = (choice: 'stay' | 'switch') => {
    const newChoices = [...choices, choice];
    setChoices(newChoices);

    if (round < totalRounds) {
      setRound(round + 1);
    } else {
      const timeTaken = (Date.now() - startTime) / 1000;
      
      setTimeout(() => {
        setPhase('result');
        
        setTimeout(() => {
          const envyScore = newChoices.filter(c => c === 'switch').length / totalRounds;
          
          onComplete({
            gameId: 'social_comparison_v1',
            level,
            inputs: { choices: newChoices },
            outcome: { envyScore, statusSeeking: envyScore > 0.5 },
            score: Math.round((1 - envyScore) * 100),
            timeTakenSec: timeTaken
          });
        }, 2000);
      }, 500);
    }
  };

  const currentPayoff = phase === 'comparing' ? getPayoffs() : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">
          Round {round} of {totalRounds}
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-accent/10 rounded-full mb-4">
            <Users className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Social Comparison</h2>
          <p className="text-muted-foreground">Your payoff vs. others—does comparison matter?</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm">
                <li>• You'll see your payoff and another person's payoff</li>
                <li>• You can choose to "Stay" with your current payoff or "Switch" to match theirs</li>
                <li>• Sometimes you'll earn more, sometimes less than the other person</li>
                <li>• This measures envy, status seeking, and social comparison bias</li>
                <li>• Complete {totalRounds} rounds</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                <div className="text-sm font-medium">Higher Payoff</div>
                <div className="text-xs text-muted-foreground">You earn more</div>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <div className="text-sm font-medium">Lower Payoff</div>
                <div className="text-xs text-muted-foreground">They earn more</div>
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="w-full">
              Start Comparisons
            </Button>
          </div>
        )}

        {phase === 'comparing' && currentPayoff && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className={`p-8 rounded-lg text-center ${
                currentPayoff.you >= currentPayoff.other 
                  ? 'bg-success/10 border-2 border-success' 
                  : 'bg-muted border-2 border-border'
              }`}>
                <div className="text-sm text-muted-foreground mb-2">Your Payoff</div>
                <div className="text-5xl font-bold text-primary mb-2">
                  {currentPayoff.you}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>

              <div className={`p-8 rounded-lg text-center ${
                currentPayoff.other > currentPayoff.you 
                  ? 'bg-warning/10 border-2 border-warning' 
                  : 'bg-muted border-2 border-border'
              }`}>
                <div className="text-sm text-muted-foreground mb-2">Other Person's Payoff</div>
                <div className="text-5xl font-bold text-accent mb-2">
                  {currentPayoff.other}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg text-center">
              {currentPayoff.you > currentPayoff.other && (
                <p className="text-sm text-success font-medium">
                  You're earning {currentPayoff.you - currentPayoff.other} points more than them
                </p>
              )}
              {currentPayoff.you < currentPayoff.other && (
                <p className="text-sm text-warning font-medium">
                  They're earning {currentPayoff.other - currentPayoff.you} points more than you
                </p>
              )}
              {currentPayoff.you === currentPayoff.other && (
                <p className="text-sm text-muted-foreground font-medium">
                  You're both earning the same amount
                </p>
              )}
            </div>

            <div className="text-center mb-4">
              <p className="text-lg font-medium mb-6">What would you like to do?</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleChoice('stay')}
                  className="h-24 text-lg font-semibold border-2 border-primary hover:bg-primary/10"
                >
                  Stay with My Payoff
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Keep {currentPayoff.you} points
                  </div>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleChoice('switch')}
                  className="h-24 text-lg font-semibold border-2 border-accent hover:bg-accent/10"
                >
                  Switch to Their Payoff
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Get {currentPayoff.other} points instead
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 animate-fade-in text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">Comparison Analysis Complete</h3>
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Times You Switched</div>
                <div className="text-3xl font-bold text-primary">
                  {choices.filter(c => c === 'switch').length} / {totalRounds}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {choices.filter(c => c === 'switch').length === 0 
                  ? 'You showed low social comparison bias - satisfied with your outcomes.'
                  : choices.filter(c => c === 'switch').length >= 2
                    ? 'You showed high social comparison bias - influenced by others\' outcomes.'
                    : 'You showed moderate social comparison bias.'}
              </p>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Processing results...
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};