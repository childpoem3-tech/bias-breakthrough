import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { GameLevel } from '@/types/game';
import { ChevronLeft, DollarSign, TrendingUp } from 'lucide-react';

interface TrustGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const TrustGame = ({ level, onComplete, onBack }: TrustGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'investing' | 'waiting' | 'result'>('instructions');
  const [invested, setInvested] = useState(50);
  const [multiplier, setMultiplier] = useState(3);
  const [returnRate, setReturnRate] = useState(0.5);
  const [returned, setReturned] = useState(0);

  const getDescription = () => {
    switch (level) {
      case 'beginner':
        return '50% return rate - Low risk';
      case 'intermediate':
        return 'Variable return - Medium risk';
      case 'advanced':
        return 'Unpredictable partner - High risk';
      default:
        return '';
    }
  };

  const handleInvest = () => {
    setPhase('waiting');
    
    setTimeout(() => {
      // Calculate return based on level
      let actualReturn: number;
      if (level === 'beginner') {
        actualReturn = invested * multiplier * 0.5;
      } else if (level === 'intermediate') {
        actualReturn = invested * multiplier * (Math.random() * 0.6 + 0.2); // 20-80%
      } else {
        // Advanced: partner may betray
        const willReturn = Math.random() > 0.3;
        actualReturn = willReturn ? invested * multiplier * (Math.random() * 0.8 + 0.2) : 0;
      }
      
      setReturned(Math.round(actualReturn));
      setPhase('result');
    }, 2000);
  };

  const handleComplete = () => {
    const finalAmount = (100 - invested) + returned;
    onComplete({
      gameId: 'trust_game_v1',
      level,
      inputs: { invested, multiplier },
      outcome: { returned, finalAmount, betrayed: returned === 0 },
      score: finalAmount,
      timeTakenSec: 0
    });
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
            <DollarSign className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Trust & Investment Game</h2>
          <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm">
                <li>• You start with 100 points</li>
                <li>• Choose how much to invest with a partner</li>
                <li>• Your investment is multiplied by {multiplier}x</li>
                <li>• Your partner decides how much to return to you</li>
                <li>• Keep what you didn't invest plus what they return</li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { invest: 0, outcome: 100, label: 'No Trust' },
                { invest: 50, outcome: 125, label: 'Moderate' },
                { invest: 100, outcome: 150, label: 'Full Trust' }
              ].map((example, i) => (
                <div key={i} className="p-4 bg-accent/5 rounded-lg text-center">
                  <div className="text-lg font-bold">{example.invest} invested</div>
                  <TrendingUp className="w-6 h-6 mx-auto my-2 text-success" />
                  <div className="text-2xl font-bold text-primary">{example.outcome}</div>
                  <div className="text-xs text-muted-foreground mt-1">{example.label}</div>
                </div>
              ))}
            </div>

            <Button onClick={() => setPhase('investing')} size="lg" className="w-full">
              Start Investment
            </Button>
          </div>
        )}

        {phase === 'investing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-muted-foreground">You keep:</span>
                <span className="text-2xl font-bold">{100 - invested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">You invest:</span>
                <span className="text-2xl font-bold text-primary">{invested}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">How much do you want to invest?</label>
              <Slider
                value={[invested]}
                onValueChange={([value]) => setInvested(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Potential return</div>
                <div className="text-3xl font-bold text-success">
                  {invested * multiplier} points
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (if partner returns 50%)
                </div>
              </div>
            </div>

            <Button onClick={handleInvest} size="lg" className="w-full">
              Confirm Investment
            </Button>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-6 bg-accent/10 rounded-full mb-6 animate-pulse">
              <TrendingUp className="w-16 h-16 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Waiting for partner...</h3>
            <p className="text-muted-foreground">They're deciding how much to return</p>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-muted rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">You kept</div>
                <div className="text-3xl font-bold">{100 - invested}</div>
              </div>
              <div className="p-6 bg-primary/10 rounded-lg text-center border-2 border-primary">
                <div className="text-sm text-muted-foreground mb-2">Partner returned</div>
                <div className="text-3xl font-bold text-primary">+{returned}</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-primary rounded-lg text-center">
              <div className="text-sm text-primary-foreground/80 mb-2">Final Amount</div>
              <div className="text-5xl font-bold text-primary-foreground">
                {(100 - invested) + returned}
              </div>
              <div className="text-sm text-primary-foreground/80 mt-2">
                {returned === 0 ? '❌ Betrayed!' : returned > invested ? '✓ Profit!' : '± Break Even'}
              </div>
            </div>

            <Button onClick={handleComplete} size="lg" className="w-full">
              Complete Game
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
