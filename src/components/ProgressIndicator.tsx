import { Progress } from '@/components/ui/progress';
import { GameTier } from '@/types/game';
import { Check, Lock, Play } from 'lucide-react';

interface ProgressIndicatorProps {
  currentTier: GameTier;
  tierProgress: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  totalProgress: number;
}

export const ProgressIndicator = ({ currentTier, tierProgress, totalProgress }: ProgressIndicatorProps) => {
  const tiers = [
    { key: 'beginner', label: 'Beginner', color: 'success' },
    { key: 'intermediate', label: 'Intermediate', color: 'primary' },
    { key: 'advanced', label: 'Advanced', color: 'accent' }
  ] as const;

  const getTierStatus = (tierKey: string) => {
    const tierIndex = tiers.findIndex(t => t.key === tierKey);
    const currentIndex = tiers.findIndex(t => t.key === currentTier);
    
    if (tierIndex < currentIndex) return 'completed';
    if (tierIndex === currentIndex) return 'current';
    return 'locked';
  };

  const getIconComponent = (tierKey: string) => {
    const status = getTierStatus(tierKey);
    
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success-foreground" />;
      case 'current':
        return <Play className="w-4 h-4 text-primary-foreground" />;
      default:
        return <Lock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getBgColor = (tierKey: string) => {
    const status = getTierStatus(tierKey);
    
    switch (status) {
      case 'completed':
        return 'bg-gradient-success';
      case 'current':
        return 'bg-gradient-primary';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Research Progress</h3>
          <span className="text-sm text-muted-foreground">{Math.round(totalProgress)}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      {/* Tier Progress */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Experimental Phases</h4>
        
        <div className="space-y-3">
          {tiers.map((tier, index) => {
            const progress = tierProgress[tier.key];
            const status = getTierStatus(tier.key);
            
            return (
              <div key={tier.key} className="flex items-center gap-4">
                {/* Tier Icon */}
                <div className={`w-10 h-10 rounded-full ${getBgColor(tier.key)} flex items-center justify-center shadow-card transition-all duration-300`}>
                  {getIconComponent(tier.key)}
                </div>
                
                {/* Tier Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{tier.label}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  
                  <Progress 
                    value={progress} 
                    className="h-1.5" 
                  />
                </div>

                {/* Connection Line */}
                {index < tiers.length - 1 && (
                  <div className="absolute left-[1.25rem] mt-10 w-0.5 h-4 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};