import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';
import { ChevronLeft, Zap, AlertTriangle } from 'lucide-react';

interface RaceToZeroGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const RaceToZeroGame = ({ level, onComplete, onBack }: RaceToZeroGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'result'>('instructions');
  const [extracted, setExtracted] = useState(10);
  const [resource, setResource] = useState(100);
  const [round, setRound] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  const totalRounds = level === 'beginner' ? 5 : level === 'intermediate' ? 7 : 10;
  const numPlayers = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 4;
  const regenerationRate = level === 'beginner' ? 0.2 : level === 'intermediate' ? 0.15 : 0.1;

  const getDescription = () => {
    switch (level) {
      case 'beginner':
        return `${totalRounds} rounds, ${numPlayers} players - 20% regeneration`;
      case 'intermediate':
        return `${totalRounds} rounds, ${numPlayers} players - 15% regeneration`;
      case 'advanced':
        return `${totalRounds} rounds, ${numPlayers} players - 10% regeneration`;
      default:
        return '';
    }
  };

  const handleExtract = () => {
    // Simulate other players
    const otherExtractions = Array.from({ length: numPlayers - 1 }, () => 
      Math.floor(Math.random() * Math.min(30, resource / numPlayers)) + 5
    );
    
    const totalExtracted = extracted + otherExtractions.reduce((a, b) => a + b, 0);
    let newResource = Math.max(0, resource - totalExtracted);
    
    // Add regeneration if resource not depleted
    if (newResource > 0) {
      newResource = Math.min(100, newResource + newResource * regenerationRate);
    }
    
    setResource(Math.round(newResource));
    setUserTotal(prev => prev + extracted);
    setHistory([...history, extracted]);
    
    if (round < totalRounds && newResource > 0) {
      setRound(round + 1);
      setExtracted(Math.min(10, Math.floor(newResource / numPlayers)));
    } else {
      setPhase('result');
    }
  };

  const getSafeAmount = () => Math.floor(resource / numPlayers / 2);
  const getWarningLevel = () => {
    if (extracted <= getSafeAmount()) return 'safe';
    if (extracted <= resource / numPlayers) return 'warning';
    return 'danger';
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
            <Zap className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Race-to-Zero: Energy Game</h2>
          <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">The Tragedy of the Commons:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Shared resource starts at 100 units</li>
                <li>• You and {numPlayers - 1} other players extract energy each round</li>
                <li>• Resource regenerates by {regenerationRate * 100}% each round</li>
                <li>• If everyone over-extracts, the resource depletes to zero</li>
                <li>• Once depleted, game ends and everyone gets nothing more</li>
                <li>• Balance personal gain with sustainability</li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { amount: 5, label: 'Conservative', icon: '🌱' },
                { amount: 15, label: 'Balanced', icon: '⚖️' },
                { amount: 30, label: 'Greedy', icon: '💰' }
              ].map((strategy, i) => (
                <div key={i} className="p-4 bg-accent/5 rounded-lg text-center">
                  <div className="text-3xl mb-2">{strategy.icon}</div>
                  <div className="text-lg font-bold">{strategy.amount} units</div>
                  <div className="text-xs text-muted-foreground">{strategy.label}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-warning/10 border-2 border-warning rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Warning:</strong> Over-extraction leads to collapse. Everyone loses if the resource hits zero.
              </div>
            </div>

            <Button onClick={() => setPhase('playing')} size="lg" className="w-full">
              Start Extraction
            </Button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-6 animate-fade-in">
            {/* Resource Pool */}
            <div className="p-6 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Shared Resource</span>
                <span className="text-sm font-medium">{Math.round(resource)} units</span>
              </div>
              <Progress 
                value={(resource / 100) * 100} 
                className={`h-4 ${resource < 30 ? '[&>div]:bg-destructive' : resource < 60 ? '[&>div]:bg-warning' : ''}`}
              />
              {resource < 30 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  Critical level! Resource almost depleted
                </div>
              )}
            </div>

            {/* Your Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Your Total</div>
                <div className="text-3xl font-bold text-primary">{userTotal}</div>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Safe Amount</div>
                <div className="text-3xl font-bold text-accent">{getSafeAmount()}</div>
              </div>
            </div>

            {/* Extraction Slider */}
            <div className="space-y-4">
              <label className="text-sm font-medium">How much energy do you extract?</label>
              <Slider
                value={[extracted]}
                onValueChange={([value]) => setExtracted(value)}
                min={0}
                max={Math.min(50, resource)}
                step={1}
                className="w-full"
              />
              <div className={`text-center p-4 rounded-lg ${
                getWarningLevel() === 'safe' ? 'bg-success/10 border-2 border-success' :
                getWarningLevel() === 'warning' ? 'bg-warning/10 border-2 border-warning' :
                'bg-destructive/10 border-2 border-destructive'
              }`}>
                <div className="text-4xl font-bold mb-1">{extracted}</div>
                <div className="text-xs text-muted-foreground">
                  {getWarningLevel() === 'safe' ? '✓ Sustainable extraction' :
                   getWarningLevel() === 'warning' ? '⚠️ Moderate risk' :
                   '❌ High risk - may deplete resource'}
                </div>
              </div>
            </div>

            <Button onClick={handleExtract} size="lg" className="w-full">
              Extract Energy
            </Button>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-8 rounded-lg text-center ${
              resource === 0 ? 'bg-destructive/10 border-2 border-destructive' : 'bg-success/10 border-2 border-success'
            }`}>
              <div className="text-6xl mb-4">{resource === 0 ? '💥' : '✓'}</div>
              <h3 className="text-2xl font-bold mb-2">
                {resource === 0 ? 'Resource Depleted!' : 'Game Complete!'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {resource === 0 
                  ? 'Over-extraction led to collapse. The tragedy of the commons.' 
                  : `Sustainable management! ${Math.round(resource)} units remain.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Your Total</div>
                <div className="text-4xl font-bold text-primary">{userTotal}</div>
              </div>
              <div className="p-6 bg-muted rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Avg Per Round</div>
                <div className="text-4xl font-bold">{Math.round(userTotal / round)}</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Your Extraction History:</h4>
              <div className="flex gap-2 flex-wrap">
                {history.map((amount, i) => (
                  <div key={i} className="px-3 py-1 bg-primary/20 rounded text-sm">
                    R{i + 1}: {amount}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => onComplete({
              gameId: 'race_to_zero_v1',
              level,
              inputs: { rounds: round, totalExtracted: userTotal },
              outcome: { finalResource: resource, collapsed: resource === 0 },
              score: userTotal,
              timeTakenSec: 0
            })} size="lg" className="w-full">
              Complete Game
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
