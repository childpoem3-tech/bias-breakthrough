import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';
import { ChevronLeft, Users, Shield } from 'lucide-react';

interface PrisonersDilemmaGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const PrisonersDilemmaGame = ({ level, onComplete, onBack }: PrisonersDilemmaGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'result'>('instructions');
  const [userChoice, setUserChoice] = useState<'cooperate' | 'defect' | null>(null);
  const [aiChoice, setAiChoice] = useState<'cooperate' | 'defect' | null>(null);
  const [round, setRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const totalRounds = level === 'beginner' ? 3 : level === 'intermediate' ? 5 : 7;

  const payoffMatrix = {
    cooperate: { cooperate: 3, defect: 0 },
    defect: { cooperate: 5, defect: 1 }
  };

  const getDescription = () => {
    switch (level) {
      case 'beginner':
        return '3 rounds - Simple cooperation test';
      case 'intermediate':
        return '5 rounds - Strategic thinking required';
      case 'advanced':
        return '7 rounds - Complex game theory';
      default:
        return '';
    }
  };

  const handleChoice = (choice: 'cooperate' | 'defect') => {
    setUserChoice(choice);
    
    // AI strategy based on level
    let ai: 'cooperate' | 'defect';
    if (level === 'beginner') {
      ai = Math.random() > 0.5 ? 'cooperate' : 'defect';
    } else if (level === 'intermediate') {
      // Tit-for-tat with some cooperation
      ai = round === 1 ? 'cooperate' : (userChoice === 'cooperate' ? 'cooperate' : 'defect');
    } else {
      // More strategic AI
      ai = userScore > aiScore ? 'defect' : 'cooperate';
    }
    setAiChoice(ai);

    // Calculate scores
    const userPoints = payoffMatrix[choice][ai];
    const aiPoints = payoffMatrix[ai][choice];
    setUserScore(prev => prev + userPoints);
    setAiScore(prev => prev + aiPoints);

    setPhase('result');
  };

  const handleNextRound = () => {
    if (round < totalRounds) {
      setRound(round + 1);
      setUserChoice(null);
      setAiChoice(null);
      setPhase('playing');
    } else {
      onComplete({
        gameId: 'prisoners_dilemma_v1',
        level,
        inputs: { rounds: totalRounds },
        outcome: { userScore, aiScore },
        score: userScore,
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
            <Users className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Prisoner's Dilemma</h2>
          <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        {phase === 'instructions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm">
                <li>• You and another player each choose to Cooperate or Defect</li>
                <li>• If both cooperate: both get 3 points</li>
                <li>• If both defect: both get 1 point</li>
                <li>• If one defects while other cooperates: defector gets 5, cooperator gets 0</li>
                <li>• Play {totalRounds} rounds and maximize your score</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">3-3</div>
                <div className="text-xs text-muted-foreground">Both Cooperate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">0-5</div>
                <div className="text-xs text-muted-foreground">Cooperate vs Defect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">5-0</div>
                <div className="text-xs text-muted-foreground">Defect vs Cooperate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">1-1</div>
                <div className="text-xs text-muted-foreground">Both Defect</div>
              </div>
            </div>

            <Button onClick={() => setPhase('playing')} size="lg" className="w-full">
              Start Round 1
            </Button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Your Score</div>
                <div className="text-3xl font-bold text-primary">{userScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Opponent</div>
                <div className="text-3xl font-bold text-accent">{aiScore}</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-medium mb-4">Make your choice:</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleChoice('cooperate')}
                  className="h-24 text-lg font-semibold border-2 border-success hover:bg-success/10"
                >
                  <Shield className="mr-2 h-6 w-6" />
                  Cooperate
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleChoice('defect')}
                  className="h-24 text-lg font-semibold border-2 border-destructive hover:bg-destructive/10"
                >
                  Defect
                </Button>
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && userChoice && aiChoice && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg text-center ${userChoice === 'cooperate' ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10 border-2 border-destructive'}`}>
                <div className="text-sm text-muted-foreground mb-2">You chose</div>
                <div className="text-2xl font-bold capitalize">{userChoice}</div>
                <div className="text-3xl font-bold mt-2">+{payoffMatrix[userChoice][aiChoice]} pts</div>
              </div>
              <div className={`p-6 rounded-lg text-center ${aiChoice === 'cooperate' ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10 border-2 border-destructive'}`}>
                <div className="text-sm text-muted-foreground mb-2">Opponent chose</div>
                <div className="text-2xl font-bold capitalize">{aiChoice}</div>
                <div className="text-3xl font-bold mt-2">+{payoffMatrix[aiChoice][userChoice]} pts</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Total Score - You: {userScore}</span>
                <span>Opponent: {aiScore}</span>
              </div>
              <Progress value={(round / totalRounds) * 100} className="h-2" />
            </div>

            <Button onClick={handleNextRound} size="lg" className="w-full">
              {round < totalRounds ? `Continue to Round ${round + 1}` : 'View Final Results'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
