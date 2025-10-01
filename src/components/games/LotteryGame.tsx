import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameLevel } from '@/types/game';
import { ChevronLeft, DollarSign, Dice5, Shield } from 'lucide-react';

interface LotteryGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const LotteryGame = ({ level, onComplete, onBack }: LotteryGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'choosing' | 'spinning' | 'result'>('instructions');
  const [choice, setChoice] = useState<'safe' | 'risky' | null>(null);
  const [outcome, setOutcome] = useState(0);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const totalRounds = 3;

  const getOptions = () => {
    switch (level) {
      case 1:
        return { safe: 50, risky: { win: 100, lose: 0, probability: 0.5 } };
      case 2:
        return { safe: 40, risky: { win: 120, lose: 0, probability: 0.4 } };
      case 3:
        return { safe: 30, risky: { win: 150, lose: -20, probability: 0.3 } };
      default:
        return { safe: 50, risky: { win: 100, lose: 0, probability: 0.5 } };
    }
  };

  const options = getOptions();

  const getDescription = () => {
    switch (level) {
      case 1:
        return '50/50 odds - Balanced risk';
      case 2:
        return '40% win chance - Higher reward';
      case 3:
        return '30% win chance - Can lose points!';
      default:
        return '';
    }
  };

  const handleChoice = (selected: 'safe' | 'risky') => {
    setChoice(selected);
    setPhase('spinning');

    setTimeout(() => {
      let result: number;
      if (selected === 'safe') {
        result = options.safe;
      } else {
        const wins = Math.random() < options.risky.probability;
        result = wins ? options.risky.win : options.risky.lose;
      }
      
      setOutcome(result);
      setTotalScore(prev => prev + result);
      setPhase('result');
    }, 2000);
  };

  const handleNext = () => {
    if (round < totalRounds) {
      setRound(round + 1);
      setChoice(null);
      setOutcome(0);
      setPhase('choosing');
    } else {
      onComplete({
        gameId: 'lottery_v1',
        level,
        inputs: { rounds: totalRounds },
        outcome: { totalScore },
        score: totalScore,
        timeTakenSec: 0
      });
    }
  };

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
            <Dice5 className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Risk-Reward Lottery</h2>
          <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Choose between a safe guaranteed reward or a risky lottery</li>
                <li>• Safe option: Always get {options.safe} points</li>
                <li>• Risky option: {Math.round(options.risky.probability * 100)}% chance to win {options.risky.win} points</li>
                {options.risky.lose < 0 && <li>• If you lose the risky option: {options.risky.lose} points</li>}
                <li>• Play {totalRounds} rounds and maximize your total score</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-success/10 rounded-lg text-center border-2 border-success">
                <Shield className="w-8 h-8 mx-auto mb-2 text-success" />
                <div className="text-lg font-semibold mb-1">Safe Option</div>
                <div className="text-3xl font-bold">{options.safe}</div>
                <div className="text-xs text-muted-foreground mt-1">Guaranteed</div>
              </div>
              <div className="p-6 bg-destructive/10 rounded-lg text-center border-2 border-destructive">
                <Dice5 className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <div className="text-lg font-semibold mb-1">Risky Option</div>
                <div className="text-3xl font-bold">{options.risky.win}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(options.risky.probability * 100)}% chance
                </div>
              </div>
            </div>

            <Button onClick={() => setPhase('choosing')} size="lg" className="w-full">
              Start Round 1
            </Button>
          </div>
        )}

        {phase === 'choosing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-4 bg-muted rounded-lg mb-6">
              <div className="text-sm text-muted-foreground">Current Score</div>
              <div className="text-4xl font-bold text-primary">{totalScore}</div>
            </div>

            <p className="text-center text-lg font-medium mb-4">Choose your option:</p>
            
            <div className="grid grid-cols-2 gap-6">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice('safe')}
                className="h-32 flex-col border-2 border-success hover:bg-success/10"
              >
                <Shield className="w-12 h-12 mb-2 text-success" />
                <div className="text-lg font-bold">Safe Option</div>
                <div className="text-2xl font-bold text-success">{options.safe}</div>
                <div className="text-xs text-muted-foreground">Guaranteed</div>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleChoice('risky')}
                className="h-32 flex-col border-2 border-destructive hover:bg-destructive/10"
              >
                <Dice5 className="w-12 h-12 mb-2 text-destructive" />
                <div className="text-lg font-bold">Risky Option</div>
                <div className="text-2xl font-bold text-destructive">{options.risky.win}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(options.risky.probability * 100)}% win
                </div>
              </Button>
            </div>
          </div>
        )}

        {phase === 'spinning' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-6 bg-accent/10 rounded-full mb-6 animate-spin">
              <Dice5 className="w-16 h-16 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              {choice === 'safe' ? 'Confirming...' : 'Spinning the wheel...'}
            </h3>
            <p className="text-muted-foreground">
              {choice === 'safe' ? 'Safe choice secured!' : 'Will you win?'}
            </p>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-8 bg-gradient-primary rounded-lg text-center">
              <div className="text-sm text-primary-foreground/80 mb-2">You chose:</div>
              <div className="text-2xl font-bold text-primary-foreground capitalize mb-4">
                {choice} Option
              </div>
              
              {choice === 'risky' && (
                <div className="text-4xl mb-4">
                  {outcome > 0 ? '🎉' : '😔'}
                </div>
              )}
              
              <div className="text-6xl font-bold text-primary-foreground mb-2">
                {outcome > 0 ? '+' : ''}{outcome}
              </div>
              <div className="text-sm text-primary-foreground/80">
                {choice === 'safe' 
                  ? 'Safe choice secured' 
                  : outcome > 0 
                    ? 'You won!' 
                    : 'Better luck next time'}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Score</div>
              <div className="text-4xl font-bold text-primary">{totalScore}</div>
            </div>

            <Button onClick={handleNext} size="lg" className="w-full">
              {round < totalRounds ? `Continue to Round ${round + 1}` : 'Complete Game'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
