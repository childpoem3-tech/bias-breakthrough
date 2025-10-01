import { GameLevel } from '@/types/game';
import { DictatorGame } from './games/DictatorGame';
import { UltimatumGame } from './games/UltimatumGame';
import { DelayDiscountingGame } from './games/DelayDiscountingGame';
import { PrisonersDilemmaGame } from './games/PrisonersDilemmaGame';
import { TrustGame } from './games/TrustGame';
import { LotteryGame } from './games/LotteryGame';
import { RaceToZeroGame } from './games/RaceToZeroGame';
import { FramingGame } from './games/FramingGame';
import { SocialComparisonGame } from './games/SocialComparisonGame';
import { QuantumDilemmaGame } from './games/QuantumDilemmaGame';

interface GameSessionProps {
  gameId: string;
  level: GameLevel;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const GameSession = ({ gameId, level, onComplete, onBack }: GameSessionProps) => {
  const renderGame = () => {
    switch (gameId) {
      case 'dictator_v1':
        return <DictatorGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'ultimatum_v1':
        return <UltimatumGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'delay_discounting_v1':
        return <DelayDiscountingGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'prisoners_dilemma_v1':
        return <PrisonersDilemmaGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'trust_game_v1':
        return <TrustGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'lottery_v1':
        return <LotteryGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'race_to_zero_v1':
        return <RaceToZeroGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'lottery_v1':
        return <LotteryGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'framing_game_v1':
        return <FramingGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'social_comparison_v1':
        return <SocialComparisonGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'quantum_dilemma_v1':
        return <QuantumDilemmaGame level={level} onComplete={onComplete} onBack={onBack} />;
      case 'risk_lottery_v1':
        return <LotteryGame level={level} onComplete={onComplete} onBack={onBack} />;
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Game Coming Soon</h2>
            <p className="text-muted-foreground mb-6">This game is under development.</p>
            <button onClick={onBack} className="btn-primary">
              Back to Games
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-4">
      <div className="container mx-auto py-8">
        {renderGame()}
      </div>
    </div>
  );
};