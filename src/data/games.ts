import { Game, GameTier } from '@/types/game';

export const GAMES_DATA: Game[] = [
  // Beginner Tier
  {
    id: 'dictator_v1',
    slug: 'dictator',
    name: 'Dictator Game',
    description: 'How much would you give vs. keep for yourself?',
    realWorldScenario: 'Imagine donating money to charity—how much would you give vs. keep for yourself?',
    instructions: 'You have 100 points. Use a slider to decide how much to keep and how much to give away.',
    biasType: 'Altruism vs. Selfishness',
    tier: 'beginner',
    order: 1,
    status: 'available',
    levelProgress: {
      1: 'available',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['slider', 'drag-drop'],
    estimatedDuration: 5,
  },
  {
    id: 'ultimatum_v1',
    slug: 'ultimatum',
    name: 'Ultimatum Game',
    description: 'Negotiate a fair split—but the other party can reject!',
    realWorldScenario: 'Salary negotiation or splitting a bill—one person proposes, the other accepts/rejects.',
    instructions: 'Propose how to split 100 points. AI can accept or reject. If rejected → both get zero.',
    biasType: 'Fairness & Inequality Aversion',
    tier: 'beginner',
    order: 2,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['slider', 'buttons'],
    estimatedDuration: 6,
  },
  {
    id: 'delay_discounting_v1',
    slug: 'delay-discounting',
    name: 'Delay Discounting',
    description: 'Take smaller reward now or wait for bigger reward?',
    realWorldScenario: 'Saving money now vs. spending immediately.',
    instructions: 'Choose between smaller reward immediately (e.g., 50 now) or bigger reward after waiting (e.g., 100 in 1 min).',
    biasType: 'Impulsivity & Present Bias',
    tier: 'beginner',
    order: 3,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['buttons', 'timer'],
    estimatedDuration: 4,
  },

  // Intermediate Tier
  {
    id: 'prisoners_dilemma_v1',
    slug: 'prisoners-dilemma',
    name: "Prisoner's Dilemma",
    description: 'Cooperate or compete? Trust or self-interest?',
    realWorldScenario: 'Two companies deciding to collude or compete.',
    instructions: 'Choose "Cooperate" or "Defect." Payoffs depend on both choices.',
    biasType: 'Trust & Cooperation',
    tier: 'intermediate',
    order: 4,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['buttons', 'matrix'],
    estimatedDuration: 7,
  },
  {
    id: 'trust_game_v1',
    slug: 'trust-game',
    name: 'Trust & Investment',
    description: 'Invest with a partner—will they return the favor?',
    realWorldScenario: 'You invest money with a business partner—they may return a share or betray you.',
    instructions: 'Invest some points. Partner decides to return part or keep all.',
    biasType: 'Trust & Betrayal Aversion',
    tier: 'intermediate',
    order: 5,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['slider', 'investment'],
    estimatedDuration: 6,
  },
  {
    id: 'risk_lottery_v1',
    slug: 'risk-lottery', 
    name: 'Risk–Reward Lottery',
    description: 'Play it safe or take the risky gamble?',
    realWorldScenario: 'Investing in stocks vs. putting money in a safe deposit.',
    instructions: 'Choose between "Safe Option" (guaranteed smaller payoff) and "Risky Option" (spin wheel with higher/lower payoff).',
    biasType: 'Risk Preference',
    tier: 'intermediate',
    order: 6,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['buttons', 'wheel'],
    estimatedDuration: 5,
  },

  // Advanced Tier  
  {
    id: 'race_to_zero_v1',
    slug: 'race-to-zero',
    name: 'Race-to-Zero Energy',
    description: 'Extract resources—but overuse leads to collapse!',
    realWorldScenario: 'Overusing natural resources (climate change, energy use).',
    instructions: 'Multiple players extract from a shared resource bar. Over-extraction leads to collapse.',
    biasType: 'Tragedy of Commons',
    tier: 'advanced',
    order: 7,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['slider', 'resource-bar'],
    estimatedDuration: 8,
  },
  {
    id: 'framing_game_v1',
    slug: 'framing-game',
    name: 'Loss vs. Gain Framing',
    description: 'Same choice, different words—does framing matter?',
    realWorldScenario: 'Insurance ads (e.g., "90% survival" vs. "10% mortality").',
    instructions: 'Same choice presented with two different wordings. See if decision changes.',
    biasType: 'Framing Effect & Loss Aversion',
    tier: 'advanced',
    order: 8,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['buttons', 'framing'],
    estimatedDuration: 6,
  },
  {
    id: 'social_comparison_v1',
    slug: 'social-comparison',
    name: 'Social Comparison',
    description: 'Your payoff vs. others—does comparison matter?',
    realWorldScenario: 'Salary comparisons in workplace.',
    instructions: 'See your payoff and another person\'s payoff. Choose if you want to switch or stay.',
    biasType: 'Envy & Status Bias',
    tier: 'advanced',
    order: 9,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['buttons', 'comparison'],
    estimatedDuration: 5,
  },
  {
    id: 'quantum_dilemma_v1',
    slug: 'quantum-dilemma',
    name: 'Quantum Prisoner\'s Dilemma',
    description: 'Probabilistic decisions in quantum uncertainty',
    realWorldScenario: 'Decisions under fundamental uncertainty.',
    instructions: 'Choose probability slider (like 70% cooperate, 30% defect). Outcome resolved probabilistically.',
    biasType: 'Decision Under Uncertainty',
    tier: 'advanced',
    order: 10,
    status: 'locked',
    levelProgress: {
      1: 'locked',
      2: 'locked',
      3: 'locked',
    },
    inputTypes: ['probability-slider', 'quantum'],
    estimatedDuration: 9,
  },
];

export const getTierGames = (tier: GameTier): Game[] => {
  return GAMES_DATA.filter(game => game.tier === tier);
};

export const getGameById = (id: string): Game | undefined => {
  return GAMES_DATA.find(game => game.id === id);
};

export const getNextGame = (currentGameId: string): Game | undefined => {
  const currentIndex = GAMES_DATA.findIndex(game => game.id === currentGameId);
  return currentIndex >= 0 && currentIndex < GAMES_DATA.length - 1 
    ? GAMES_DATA[currentIndex + 1] 
    : undefined;
};