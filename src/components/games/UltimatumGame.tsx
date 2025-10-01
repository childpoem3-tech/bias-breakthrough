import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { GameLevel } from '@/types/game';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface UltimatumGameProps {
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const UltimatumGame = ({ level, onComplete, onBack }: UltimatumGameProps) => {
  const [proposal, setProposal] = useState([50]);
  const [phase, setPhase] = useState<'instructions' | 'proposing' | 'waiting' | 'results'>('instructions');
  const [aiDecision, setAiDecision] = useState<'accept' | 'reject' | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const totalPoints = 100;
  const userProposal = proposal[0];
  const otherShare = totalPoints - userProposal;

  const getLevelDescription = () => {
    switch (level) {
      case 'beginner':
        return "Basic negotiation: Propose a split, the AI can accept or reject.";
      case 'intermediate':
        return "Fairness matters: The AI is more sensitive to unfair offers.";
      case 'advanced':
        return "Strategic AI: The AI considers your previous offers and reputation.";
      default:
        return "";
    }
  };

  const getAiAcceptanceThreshold = () => {
    switch (level) {
      case 'beginner': return 20; // AI accepts if they get 20+ points
      case 'intermediate': return 30; // AI is more demanding
      case 'advanced': return 25; // AI considers strategy
      default: return 20;
    }
  };

  const startGame = () => {
    setPhase('proposing');
    setStartTime(Date.now());
  };

  const submitProposal = () => {
    setPhase('waiting');
    
    // Simulate AI thinking time
    setTimeout(() => {
      const threshold = getAiAcceptanceThreshold();
      const willAccept = otherShare >= threshold;
      
      // Add some randomness for advanced
      const decision = level === 'advanced' && Math.random() < 0.2 
        ? (willAccept ? 'reject' : 'accept') // 20% chance of surprise decision
        : (willAccept ? 'accept' : 'reject');
      
      setAiDecision(decision);
      setPhase('results');
    }, 2000);
  };

  const completeGame = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const finalUserPoints = aiDecision === 'accept' ? userProposal : 0;
    const finalOtherPoints = aiDecision === 'accept' ? otherShare : 0;
    
    const result = {
      gameId: 'ultimatum_v1',
      level,
      inputs: { 
        proposed_user: userProposal, 
        proposed_other: otherShare, 
        ai_decision: aiDecision 
      },
      outcome: { 
        payoff_user: finalUserPoints, 
        payoff_other: finalOtherPoints 
      },
      score: finalUserPoints,
      timeTakenSec: timeTaken
    };
    
    onComplete(result);
  };

  if (phase === 'instructions') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Ultimatum Game - Level {level}</CardTitle>
          <CardDescription className="text-lg">{getLevelDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-card-accent p-6 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm">
              <li>• You propose how to split 100 points</li>
              <li>• The AI can accept or reject your proposal</li>
              <li>• If accepted: both get the proposed amounts</li>
              <li>• If rejected: both get zero points</li>
            </ul>
          </div>
          
          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Risk Warning</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Be fair! Too greedy and the AI might reject everything.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Real-world scenario:</strong> Salary negotiation where either party can walk away.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={startGame} className="flex-1 bg-gradient-primary">
              Start Negotiation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'proposing') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>Make Your Proposal</CardTitle>
          <CardDescription>Propose how to split 100 points with the AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">{userProposal}</div>
              <div className="text-sm text-muted-foreground">Points for you</div>
            </div>

            <Slider
              value={proposal}
              onValueChange={setProposal}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />

            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{otherShare}</div>
              <div className="text-sm text-muted-foreground">Points for AI</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{userProposal}%</div>
              <div className="text-xs text-muted-foreground">Your share</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{otherShare}%</div>
              <div className="text-xs text-muted-foreground">AI's share</div>
            </div>
          </div>

          <Button onClick={submitProposal} className="w-full bg-gradient-primary" size="lg">
            Submit Proposal
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'waiting') {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>AI Considering...</CardTitle>
          <CardDescription>The AI is evaluating your proposal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-8">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Analyzing fairness...</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center opacity-50">
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{userProposal}</div>
              <div className="text-xs text-muted-foreground">Your proposed share</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-2xl font-bold">{otherShare}</div>
              <div className="text-xs text-muted-foreground">AI's proposed share</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAccepted = aiDecision === 'accept';
  const finalUserPoints = isAccepted ? userProposal : 0;
  const finalAiPoints = isAccepted ? otherShare : 0;

  return (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isAccepted ? (
            <CheckCircle className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive" />
          )}
        </div>
        <CardTitle className={isAccepted ? "text-success" : "text-destructive"}>
          Proposal {isAccepted ? 'Accepted!' : 'Rejected!'}
        </CardTitle>
        <CardDescription>
          {isAccepted 
            ? "The AI found your proposal fair" 
            : "The AI rejected your proposal as unfair"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-6 bg-accent/10 rounded-lg">
            <div className="text-3xl font-bold">{finalUserPoints}</div>
            <div className="text-sm text-muted-foreground">You earned</div>
          </div>
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <div className="text-3xl font-bold">{finalAiPoints}</div>
            <div className="text-sm text-muted-foreground">AI earned</div>
          </div>
        </div>
        
        {!isAccepted && (
          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
            <p className="text-sm text-center text-muted-foreground">
              The AI felt the split was too unfair and chose to reject the deal.
            </p>
          </div>
        )}

        <Button onClick={completeGame} className="w-full bg-gradient-primary" size="lg">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};