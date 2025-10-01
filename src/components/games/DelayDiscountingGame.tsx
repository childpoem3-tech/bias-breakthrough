import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';
import { Clock, Zap, Timer } from 'lucide-react';

interface DelayDiscountingGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const DelayDiscountingGame = ({ level, onComplete, onBack }: DelayDiscountingGameProps) => {
  const [phase, setPhase] = useState<'instructions' | 'choosing' | 'waiting' | 'results'>('instructions');
  const [choice, setChoice] = useState<'immediate' | 'delayed' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const getScenario = () => {
    switch (level) {
      case 'beginner':
        return { immediate: 50, delayed: 100, waitTime: 10 };
      case 'intermediate':
        return { immediate: 30, delayed: 80, waitTime: 15 };
      case 'advanced':
        return { immediate: 40, delayed: 120, waitTime: 20 };
      default:
        return { immediate: 50, delayed: 100, waitTime: 10 };
    }
  };

  const scenario = getScenario();

  const getLevelDescription = () => {
    switch (level) {
      case 'beginner':
        return "Simple choice: immediate small reward vs. delayed larger reward";
      case 'intermediate':
        return "Harder choice: smaller immediate vs. much longer wait";
      case 'advanced':
        return "Complex choice: multiple factors to consider";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (phase === 'waiting' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'waiting' && timeLeft === 0) {
      setPhase('results');
    }
  }, [phase, timeLeft]);

  const startGame = () => {
    setPhase('choosing');
    setStartTime(Date.now());
  };

  const makeChoice = (selectedChoice: 'immediate' | 'delayed') => {
    setChoice(selectedChoice);
    
    if (selectedChoice === 'immediate') {
      setPhase('results');
    } else {
      setTimeLeft(scenario.waitTime);
      setPhase('waiting');
    }
  };

  const completeGame = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const finalPoints = choice === 'immediate' ? scenario.immediate : scenario.delayed;
    
    const result = {
      gameId: 'delay_discounting_v1',
      level,
      inputs: { 
        choice, 
        now: scenario.immediate, 
        later: scenario.delayed,
        waitTime: scenario.waitTime
      },
      outcome: { 
        payoff_user: finalPoints,
        waited: choice === 'delayed'
      },
      score: finalPoints,
      timeTakenSec: timeTaken
    };
    
    onComplete(result);
  };

  if (phase === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Delay Discounting - Level {level}</CardTitle>
          <CardDescription className="text-lg">{getLevelDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-card-accent p-6 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm">
              <li>• Choose between immediate smaller reward or delayed larger reward</li>
              <li>• If you choose to wait, you must actually wait the full time</li>
              <li>• This measures impulsivity and patience</li>
              <li>• No changing your mind once you decide!</li>
            </ul>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Real-world scenario:</strong> Saving money for a big purchase vs. spending it now on smaller items.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-destructive/10 p-4 rounded-lg text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <div className="font-bold">{scenario.immediate} points</div>
              <div className="text-xs text-muted-foreground">Right now</div>
            </div>
            <div className="bg-success/10 p-4 rounded-lg text-center">
              <Timer className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="font-bold">{scenario.delayed} points</div>
              <div className="text-xs text-muted-foreground">After {scenario.waitTime}s</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={startGame} className="flex-1 bg-gradient-primary">
              Start Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'choosing') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>Make Your Choice</CardTitle>
          <CardDescription>Take the immediate reward or wait for more?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Button
              onClick={() => makeChoice('immediate')}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 border-destructive/30 hover:bg-destructive/5 hover:border-destructive transition-all"
            >
              <Zap className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{scenario.immediate}</div>
                <div className="text-xs text-muted-foreground">Points Now</div>
              </div>
            </Button>

            <Button
              onClick={() => makeChoice('delayed')}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-3 border-success/30 hover:bg-success/5 hover:border-success transition-all"
            >
              <Timer className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{scenario.delayed}</div>
                <div className="text-xs text-muted-foreground">Points in {scenario.waitTime}s</div>
              </div>
            </Button>
          </div>

          <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
            <p className="text-sm text-muted-foreground">
              Choose carefully! If you pick "wait," you'll have to actually wait the full time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'waiting') {
    const progress = ((scenario.waitTime - timeLeft) / scenario.waitTime) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>Waiting for Reward...</CardTitle>
          <CardDescription>Please wait for your delayed reward</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <div className="text-6xl font-bold gradient-text mb-4">{timeLeft}</div>
            <div className="text-lg text-muted-foreground">seconds remaining</div>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="text-center p-6 bg-success/10 rounded-lg">
            <Clock className="w-12 h-12 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold text-success mb-2">{scenario.delayed} points</div>
            <div className="text-sm text-muted-foreground">Coming your way...</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              This simulates real-world waiting time. Stay patient!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const finalPoints = choice === 'immediate' ? scenario.immediate : scenario.delayed;

  return (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-success">Reward Earned!</CardTitle>
        <CardDescription>
          You chose the {choice === 'immediate' ? 'immediate' : 'delayed'} reward
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-8 bg-success/10 rounded-lg">
          <div className="text-5xl font-bold text-success mb-2">{finalPoints}</div>
          <div className="text-lg text-muted-foreground">Points earned</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/30 rounded">
            <div className="font-medium">Choice Made</div>
            <div className="text-muted-foreground capitalize">{choice}</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded">
            <div className="font-medium">Strategy</div>
            <div className="text-muted-foreground">
              {choice === 'immediate' ? 'Instant gratification' : 'Patience pays off'}
            </div>
          </div>
        </div>

        <Button onClick={completeGame} className="w-full bg-gradient-primary" size="lg">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};