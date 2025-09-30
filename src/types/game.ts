export type GameTier = 'beginner' | 'intermediate' | 'advanced';
export type GameLevel = 'beginner' | 'intermediate' | 'advanced';
export type GameStatus = 'locked' | 'available' | 'completed';

export interface GameResult {
  userId: string;
  sessionId: string;
  gameId: string;
  level: GameLevel;
  timestamp: string;
  inputs: Record<string, any>;
  outcome: Record<string, any>;
  score: number;
  timeTakenSec: number;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  realWorldScenario: string;
  instructions: string;
  biasType: string;
  tier: GameTier;
  order: number;
  status: GameStatus;
  levelProgress: {
    1: GameStatus;
    2: GameStatus;
    3: GameStatus;
  };
  inputTypes: string[];
  estimatedDuration: number; // in minutes
}

export interface UserProgress {
  currentTier: GameTier;
  completedGames: string[];
  currentGame?: string;
  currentLevel?: GameLevel;
  totalScore: number;
  biasProfile: BiasProfile;
}

export interface BiasProfile {
  altruism: number;
  fairness: number;
  impulsivity: number;
  riskTaking: number;
  trust: number;
  cooperation: number;
  lossAversion: number;
  statusBias: number;
  overOptimism: number;
  decisionUncertainty: number;
}

export interface GameSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  deviceInfo: Record<string, any>;
  progress: UserProgress;
}