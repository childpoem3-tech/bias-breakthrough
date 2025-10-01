import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';
import { ChevronLeft, Atom, Zap } from 'lucide-react';

interface QuantumDilemmaGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const QuantumDilemmaGame = ({ level, onComplete, onBack }: QuantumDilemmaGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'choosing' | 'resolving' | 'result'>('instructions');
  const [cooperateProb, setCooperateProb] = useState(50);
  const [round, setRound] = useState(1);
  const [outcomes, setOutcomes] = useState<{ user: string; ai: string; userPoints: number; aiPoints: number }[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const totalRounds = level === 'beginner' ? 3 : level === 'intermediate' ? 5 : 7;

  const payoffMatrix = {
    cooperate: { cooperate: 3, defect: 0 },
    defect: { cooperate: 5, defect: 1 }
  };

  const startGame = () => {
    setStartTime(Date.now());
    setPhase('choosing');
  };

  const resolveQuantumChoice = (probability: number): 'cooperate' | 'defect' => {
    return Math.random() * 100 < probability ? 'cooperate' : 'defect';
  };

  const handleSubmit = () => {
    setPhase('resolving');

    setTimeout(() => {
      // Resolve quantum probabilities
      const userChoice = resolveQuantumChoice(cooperateProb);
      
      // AI also uses quantum strategy (with some adaptation based on level)
      let aiProbability: number;
      if (level === 'beginner') {
        aiProbability = 60; // AI leans toward cooperation
      } else if (level === 'intermediate') {
        aiProbability = cooperateProb * 0.8; // AI mirrors user somewhat
      } else {
        // Advanced: AI uses game theory mixed strategy
        aiProbability = totalScore > 0 ? 70 : 40;
      }
      
      const aiChoice = resolveQuantumChoice(aiProbability);

      // Calculate payoffs
      const userPoints = payoffMatrix[userChoice][aiChoice];
      const aiPoints = payoffMatrix[aiChoice][userChoice];

      const newOutcomes = [...outcomes, { user: userChoice, ai: aiChoice, userPoints, aiPoints }];
      setOutcomes(newOutcomes);
      setTotalScore(prev => prev + userPoints);

      setPhase('result');

      setTimeout(() => {
        if (round < totalRounds) {
          setRound(round + 1);
          setCooperateProb(50);
          setPhase('choosing');
        } else {
          const timeTaken = (Date.now() - startTime) / 1000;
          
          onComplete({
            gameId: 'quantum_dilemma_v1',
            level,
            inputs: { rounds: newOutcomes },
            outcome: { totalScore: totalScore + userPoints, avgCooperateProb: cooperateProb },
            score: totalScore + userPoints,
            timeTakenSec: timeTaken
          });
        }
      }, 2500);
    }, 2000);
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
            <Atom className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quantum Prisoner's Dilemma</h2>
          <p className="text-muted-foreground">Probabilistic decisions in quantum uncertainty</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">The Quantum Twist:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Instead of choosing "Cooperate" or "Defect" definitively...</li>
                <li>• You set a <strong>probability</strong> for each choice</li>
                <li>• Example: 70% Cooperate / 30% Defect</li>
                <li>• Your actual choice is resolved probabilistically (like quantum mechanics)</li>
                <li>• The AI opponent also uses quantum strategy</li>
                <li>• Play {totalRounds} rounds and maximize your score</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">3-3</div>
                <div className="text-xs text-muted-foreground">Both Cooperate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive mb-1">0-5</div>
                <div className="text-xs text-muted-foreground">You Cooperate, They Defect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive mb-1">5-0</div>
                <div className="text-xs text-muted-foreground">You Defect, They Cooperate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">1-1</div>
                <div className="text-xs text-muted-foreground">Both Defect</div>
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="w-full">
              Enter Quantum Realm
            </Button>
          </div>
        )}

        {phase === 'choosing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Your Total Score</div>
              <div className="text-4xl font-bold text-primary">{totalScore}</div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium block text-center">
                Set your quantum strategy:
              </label>
              
              <div className="p-6 bg-gradient-primary rounded-lg">
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="text-sm text-primary-foreground/80">Cooperate</div>
                    <div className="text-3xl font-bold text-primary-foreground">{cooperateProb}%</div>
                  </div>
                  <Atom className="w-8 h-8 text-primary-foreground/60 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="text-center">
                    <div className="text-sm text-primary-foreground/80">Defect</div>
                    <div className="text-3xl font-bold text-primary-foreground">{100 - cooperateProb}%</div>
                  </div>
                </div>

                <Slider
                  value={[cooperateProb]}
                  onValueChange={([value]) => setCooperateProb(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-success/10 rounded-lg">
                  <Progress value={cooperateProb} className="h-2 mb-2" />
                  <div className="text-center text-sm font-medium text-success">
                    Probability: {cooperateProb}%
                  </div>
                  <div className="text-center text-xs text-muted-foreground mt-1">
                    More cooperative
                  </div>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <Progress value={100 - cooperateProb} className="h-2 mb-2 [&>div]:bg-destructive" />
                  <div className="text-center text-sm font-medium text-destructive">
                    Probability: {100 - cooperateProb}%
                  </div>
                  <div className="text-center text-xs text-muted-foreground mt-1">
                    More selfish
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} size="lg" className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Collapse Quantum State
            </Button>
          </div>
        )}

        {phase === 'resolving' && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex p-8 bg-accent/10 rounded-full mb-6">
              <Atom className="w-20 h-20 text-accent animate-spin" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              Resolving quantum probabilities...
            </h3>
            <p className="text-muted-foreground">
              Your choice is being determined by quantum mechanics
            </p>
          </div>
        )}

        {phase === 'result' && outcomes.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg text-center ${
                outcomes[outcomes.length - 1].user === 'cooperate' 
                  ? 'bg-success/10 border-2 border-success' 
                  : 'bg-destructive/10 border-2 border-destructive'
              }`}>
                <div className="text-sm text-muted-foreground mb-2">Your Choice</div>
                <div className="text-2xl font-bold capitalize mb-2">
                  {outcomes[outcomes.length - 1].user}
                </div>
                <div className="text-3xl font-bold">
                  +{outcomes[outcomes.length - 1].userPoints} pts
                </div>
              </div>
              <div className={`p-6 rounded-lg text-center ${
                outcomes[outcomes.length - 1].ai === 'cooperate' 
                  ? 'bg-success/10 border-2 border-success' 
                  : 'bg-destructive/10 border-2 border-destructive'
              }`}>
                <div className="text-sm text-muted-foreground mb-2">AI Choice</div>
                <div className="text-2xl font-bold capitalize mb-2">
                  {outcomes[outcomes.length - 1].ai}
                </div>
                <div className="text-3xl font-bold">
                  +{outcomes[outcomes.length - 1].aiPoints} pts
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Your Total Score</div>
              <div className="text-4xl font-bold text-primary">{totalScore}</div>
            </div>

            {round < totalRounds && (
              <div className="text-center text-sm text-muted-foreground">
                Proceeding to next round...
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};