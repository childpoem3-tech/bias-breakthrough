import { Brain, Zap } from 'lucide-react';

interface DecisionLabLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const DecisionLabLogo = ({ size = 'md', showText = true }: DecisionLabLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative bg-gradient-primary rounded-xl shadow-lab flex items-center justify-center group transition-all duration-300 hover:scale-105`}>
        <Brain className="w-1/2 h-1/2 text-primary-foreground relative z-10" />
        <Zap className="w-1/3 h-1/3 text-accent-foreground absolute -top-1 -right-1 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-xl group-hover:animate-glow" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-foreground leading-none`}>
            Decision<span className="text-primary">Lab</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium tracking-wide">
            Research Platform
          </p>
        </div>
      )}
    </div>
  );
};