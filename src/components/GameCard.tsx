import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Game, GameLevel } from '@/types/game';
import { Clock, Lock, Play, CheckCircle, Brain, Target, Zap } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onStartGame: (gameId: string, level: GameLevel) => void;
  onContinueGame?: (gameId: string, level: GameLevel) => void;
}

export const GameCard = ({ game, onStartGame, onContinueGame }: GameCardProps) => {
  const isLocked = game.status === 'locked';
  const isCompleted = game.status === 'completed';
  
  const getCurrentLevel = (): GameLevel => {
    if (game.levelProgress[3] === 'completed') return 3;
    if (game.levelProgress[2] === 'completed') return 3;
    if (game.levelProgress[1] === 'completed') return 2;
    return 1;
  };

  const getNextAvailableLevel = (): GameLevel | null => {
    if (game.levelProgress[1] === 'available') return 1;
    if (game.levelProgress[2] === 'available') return 2;
    if (game.levelProgress[3] === 'available') return 3;
    return null;
  };

  const getTierIcon = () => {
    switch (game.tier) {
      case 'beginner':
        return <Target className="w-4 h-4 text-success" />;
      case 'intermediate':
        return <Brain className="w-4 h-4 text-primary" />;
      case 'advanced':
        return <Zap className="w-4 h-4 text-accent" />;
    }
  };

  const getTierColor = () => {
    switch (game.tier) {
      case 'beginner':
        return 'bg-success-muted text-success border-success';
      case 'intermediate':
        return 'bg-primary-muted text-primary border-primary';
      case 'advanced':
        return 'bg-accent-muted text-accent border-accent';
    }
  };

  const renderLevelProgress = () => {
    return (
      <div className="flex items-center gap-1 mt-2">
        {[1, 2, 3].map((level) => {
          const levelStatus = game.levelProgress[level as GameLevel];
          return (
            <div
              key={level}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                levelStatus === 'completed'
                  ? 'bg-success'
                  : levelStatus === 'available'
                  ? 'bg-primary'
                  : 'bg-muted border border-border'
              }`}
              title={`Level ${level}: ${levelStatus}`}
            />
          );
        })}
      </div>
    );
  };

  const getActionButton = () => {
    if (isLocked) {
      return (
        <Button disabled variant="outline" className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Locked
        </Button>
      );
    }

    const nextLevel = getNextAvailableLevel();
    
    if (isCompleted) {
      return (
        <Button 
          variant="outline" 
          className="w-full border-success text-success hover:bg-success-muted"
          onClick={() => nextLevel && onStartGame(game.id, nextLevel)}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Replay
        </Button>
      );
    }

    if (nextLevel) {
      const isFirstLevel = nextLevel === 1;
      return (
        <Button 
          className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-lab"
          onClick={() => onStartGame(game.id, nextLevel)}
        >
          <Play className="w-4 h-4 mr-2" />
          {isFirstLevel ? 'Start Game' : `Continue Level ${nextLevel}`}
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in ${
      isLocked ? 'opacity-60' : 'hover:bg-card-highlight'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getTierIcon()}
              <Badge variant="outline" className={getTierColor()}>
                {game.tier}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{game.name}</CardTitle>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{game.estimatedDuration}m</span>
          </div>
        </div>
        
        <CardDescription className="text-sm leading-relaxed">
          {game.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">MEASURES:</span>
            <Badge variant="secondary" className="text-xs">
              {game.biasType}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Level Progress:</span>
            {renderLevelProgress()}
          </div>
        </div>

        {getActionButton()}
      </CardContent>
    </Card>
  );
};