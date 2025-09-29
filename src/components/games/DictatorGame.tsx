import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';

interface DictatorGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const DictatorGame = ({ level, onComplete, onBack }: DictatorGameProps) => {
  const [allocation, setAllocation] = useState([50]);
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'results'>('instructions');
  const [startTime, setStartTime] = useState<number>(0);

  const totalPoints = 100;
  const userPoints = allocation[0];
  const otherPoints = totalPoints - userPoints;

  const getLevelDescription = () => {
    switch (level) {
      case 1:
        return "Simple allocation: Decide how to split 100 points between yourself and another person.";
      case 2:
        return "Timed decision: You have 30 seconds to decide the allocation.";
      case 3:
        return "Multiple rounds: Make 3 allocation decisions with different scenarios.";
      default:
        return "";
    }
  };

  const startGame = () => {
    setPhase('playing');
    setStartTime(Date.now());
  };

  const submitDecision = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const result = {
      gameId: 'dictator_v1',
      level,
      inputs: { kept: userPoints, given: otherPoints },
      outcome: { payoff_user: userPoints, payoff_other: otherPoints },
      score: userPoints,
      timeTakenSec: timeTaken
    };
    
    setPhase('results');
    setTimeout(() => onComplete(result), 2000);
  };

  if (phase === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Dictator Game - Level {level}</CardTitle>
          <CardDescription className="text-lg">{getLevelDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-card-accent p-6 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm">
              <li>• You have 100 points to allocate</li>
              <li>• Decide how many points to keep vs. give away</li>
              <li>• The other person cannot reject your decision</li>
              <li>• This measures altruism vs. self-interest</li>
            </ul>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Real-world scenario:</strong> Imagine deciding how much to donate to charity from a windfall payment.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={startGame} className="flex-1 bg-gradient-primary">
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'playing') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>Make Your Decision</CardTitle>
          <CardDescription>Use the slider to allocate 100 points</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">{userPoints}</div>
              <div className="text-sm text-muted-foreground">Points you keep</div>
            </div>

            <Slider
              value={allocation}
              onValueChange={setAllocation}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />

            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{otherPoints}</div>
              <div className="text-sm text-muted-foreground">Points you give</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{userPoints}%</div>
              <div className="text-xs text-muted-foreground">Your share</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{otherPoints}%</div>
              <div className="text-xs text-muted-foreground">Other's share</div>
            </div>
          </div>

          <Button onClick={submitDecision} className="w-full bg-gradient-primary" size="lg">
            Confirm Decision
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-success">Decision Recorded!</CardTitle>
        <CardDescription>Your allocation has been saved</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-6 bg-accent/10 rounded-lg">
            <div className="text-3xl font-bold">{userPoints}</div>
            <div className="text-sm text-muted-foreground">You kept</div>
          </div>
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <div className="text-3xl font-bold">{otherPoints}</div>
            <div className="text-sm text-muted-foreground">You gave</div>
          </div>
        </div>
        
        <div className="text-center">
          <Progress value={75} className="mb-2" />
          <p className="text-sm text-muted-foreground">Processing results...</p>
        </div>
      </CardContent>
    </Card>
  );
};