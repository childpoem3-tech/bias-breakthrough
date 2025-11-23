export interface MathGame {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  path: string;
  theme: string;
  objective: string;
  features: string[];
}

export const MATH_GAMES: MathGame[] = [
  {
    id: 'coordinates-3d',
    slug: 'coordinates',
    name: '🏙️ City of Coordinates',
    description: 'Master 2D and 3D coordinate plotting with interactive animations',
    icon: '🏙️',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    path: '/coordinates',
    theme: 'Urban exploration with mathematical precision',
    objective: 'Navigate the cyber-city grid in 3D space',
    features: [
      'Rotating 3D coordinate system',
      'Interactive point plotting',
      'Glowing grid lines with animations',
      'Camera orbit controls'
    ]
  },
  {
    id: 'factors-kingdom',
    slug: 'factors',
    name: '👑 Kingdom of Factors',
    description: 'Explore floating islands in Algebraia and discover factor relationships',
    icon: '👑',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    path: '/factors',
    theme: 'Medieval algebra kingdom restoration',
    objective: 'Find all factors of numbers in magical zones',
    features: [
      'Floating factor blocks with hover motion',
      'Magical glow effects',
      'Zone-specific particle effects',
      'Success confetti animations'
    ]
  },
  {
    id: 'sequences-odyssey',
    slug: 'sequences',
    name: '🌊 Sequences & Series Odyssey',
    description: 'Sail through ocean archipelago solving sequence patterns',
    icon: '🌊',
    gradient: 'from-blue-600 via-indigo-500 to-purple-500',
    path: '/sequences',
    theme: 'Ocean voyage through mathematical patterns',
    objective: 'Complete arithmetic and geometric sequences',
    features: [
      'Floating islands with wave motion',
      'Ocean surface with reflections',
      'Treasure chest animations',
      'Orbital sequence paths'
    ]
  },
  {
    id: 'permutations-portal',
    slug: 'permutations',
    name: '🔑 Permutation Portal',
    description: 'Unlock time portals by arranging elements in correct order',
    icon: '🔑',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
    path: '/permutations',
    theme: 'Interdimensional time portal mechanics',
    objective: 'Arrange keys to unlock dimensional portals',
    features: [
      'Floating keys in orbital rotation',
      'Portal rings with energy effects',
      'Time distortion visuals',
      'Particle ribbon trails'
    ]
  },
  {
    id: 'combinations-quest',
    slug: 'combinations',
    name: '🏰 Combination Quest',
    description: 'Select perfect combinations in the mystical guild hall',
    icon: '🏰',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    path: '/combinations',
    theme: 'Mystical council chamber selection',
    objective: 'Choose correct combinations without order',
    features: [
      'Pedestals with light beams',
      'Floating item displays',
      'Selection aura effects',
      'Chamber illumination changes'
    ]
  },
  {
    id: 'probability-realm',
    slug: 'probability',
    name: '🎲 Probability Realm',
    description: 'Master probability and chance in mystical dimension',
    icon: '🎲',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    path: '/probability',
    theme: 'Mystical probability manipulation',
    objective: 'Calculate probabilities and odds',
    features: [
      'Animated dice with tumble rotation',
      '3D urns with ball removal',
      'Probability wave effects',
      'Oracle eye animations'
    ]
  },
  {
    id: 'chrono-racers',
    slug: 'racing',
    name: '🏎️ Chrono Racers',
    description: 'Race through time solving speed and distance problems',
    icon: '🏎️',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    path: '/racing',
    theme: 'High-speed mathematical racing',
    objective: 'Solve speed, distance, and time challenges',
    features: [
      'Infinite scrolling neon track',
      'Hover vehicle animations',
      'Speed boost particle streams',
      'Checkpoint celebration effects'
    ]
  }
];

export const getGameBySlug = (slug: string): MathGame | undefined => {
  return MATH_GAMES.find(game => game.slug === slug);
};
