import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingBag, Coins, Crown, Palette, Star,
  Shield, Sparkles, Gem, Flame, Zap, Frame, Type, Lock, Check
} from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'avatar_frame' | 'theme' | 'title' | 'effect';
  icon: React.ReactNode;
  preview: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const SHOP_ITEMS: ShopItem[] = [
  // Avatar Frames
  { id: 'frame_bronze', name: 'Bronze Frame', description: 'A simple bronze frame for your avatar', price: 100, category: 'avatar_frame', icon: <Frame className="w-6 h-6" />, preview: '🥉', rarity: 'common' },
  { id: 'frame_silver', name: 'Silver Frame', description: 'A sleek silver frame', price: 300, category: 'avatar_frame', icon: <Frame className="w-6 h-6" />, preview: '🥈', rarity: 'rare' },
  { id: 'frame_gold', name: 'Golden Frame', description: 'A prestigious golden frame', price: 750, category: 'avatar_frame', icon: <Frame className="w-6 h-6" />, preview: '🥇', rarity: 'epic' },
  { id: 'frame_diamond', name: 'Diamond Frame', description: 'The ultimate diamond frame with sparkle effects', price: 2000, category: 'avatar_frame', icon: <Gem className="w-6 h-6" />, preview: '💎', rarity: 'legendary' },

  // Themes
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Cool blue ocean-inspired color scheme', price: 200, category: 'theme', icon: <Palette className="w-6 h-6" />, preview: '🌊', rarity: 'common' },
  { id: 'theme_forest', name: 'Forest Theme', description: 'Lush green nature theme', price: 200, category: 'theme', icon: <Palette className="w-6 h-6" />, preview: '🌲', rarity: 'common' },
  { id: 'theme_sunset', name: 'Sunset Theme', description: 'Warm sunset gradient', price: 500, category: 'theme', icon: <Palette className="w-6 h-6" />, preview: '🌅', rarity: 'rare' },
  { id: 'theme_galaxy', name: 'Galaxy Theme', description: 'Deep space cosmic theme', price: 1200, category: 'theme', icon: <Sparkles className="w-6 h-6" />, preview: '🌌', rarity: 'epic' },
  { id: 'theme_aurora', name: 'Aurora Theme', description: 'Northern lights aurora borealis', price: 2500, category: 'theme', icon: <Sparkles className="w-6 h-6" />, preview: '✨', rarity: 'legendary' },

  // Titles
  { id: 'title_explorer', name: 'Explorer', description: 'Show your adventurous spirit', price: 150, category: 'title', icon: <Type className="w-6 h-6" />, preview: '🧭', rarity: 'common' },
  { id: 'title_scholar', name: 'Scholar', description: 'A title for the studious', price: 400, category: 'title', icon: <Type className="w-6 h-6" />, preview: '📚', rarity: 'rare' },
  { id: 'title_champion', name: 'Champion', description: 'You are a true champion', price: 800, category: 'title', icon: <Crown className="w-6 h-6" />, preview: '🏆', rarity: 'epic' },
  { id: 'title_legend', name: 'Legend', description: 'A legendary title for the best', price: 3000, category: 'title', icon: <Crown className="w-6 h-6" />, preview: '⭐', rarity: 'legendary' },

  // Effects
  { id: 'effect_sparkle', name: 'Sparkle Trail', description: 'Leave sparkles wherever you go', price: 350, category: 'effect', icon: <Sparkles className="w-6 h-6" />, preview: '✨', rarity: 'rare' },
  { id: 'effect_fire', name: 'Fire Aura', description: 'Engulf your profile in flames', price: 1000, category: 'effect', icon: <Flame className="w-6 h-6" />, preview: '🔥', rarity: 'epic' },
  { id: 'effect_lightning', name: 'Lightning Storm', description: 'Electrify your presence', price: 1500, category: 'effect', icon: <Zap className="w-6 h-6" />, preview: '⚡', rarity: 'epic' },
  { id: 'effect_cosmic', name: 'Cosmic Halo', description: 'A swirling cosmic halo effect', price: 5000, category: 'effect', icon: <Star className="w-6 h-6" />, preview: '🌟', rarity: 'legendary' },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'from-zinc-400 to-zinc-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-zinc-400/30',
  rare: 'border-blue-400/30',
  epic: 'border-purple-400/30',
  legendary: 'border-amber-400/30',
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-zinc-500/5',
  rare: 'bg-blue-500/5',
  epic: 'bg-purple-500/5',
  legendary: 'bg-amber-500/5',
};

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All Items', icon: <ShoppingBag className="w-4 h-4" /> },
  avatar_frame: { label: 'Frames', icon: <Frame className="w-4 h-4" /> },
  theme: { label: 'Themes', icon: <Palette className="w-4 h-4" /> },
  title: { label: 'Titles', icon: <Type className="w-4 h-4" /> },
  effect: { label: 'Effects', icon: <Sparkles className="w-4 h-4" /> },
};

export default function RewardsShop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (user) loadUserData();
    else setLoading(false);
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();

      if (!userData) { setLoading(false); return; }

      // Calculate total points from results
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userData.id);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { data: results } = await supabase
          .from('results')
          .select('score')
          .in('session_id', sessionIds);

        const earned = results?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;

        // Load purchase events to calculate spent points
        const { data: purchaseEvents } = await supabase
          .from('events')
          .select('payload')
          .eq('event_type', 'shop_purchase');

        const userPurchases = purchaseEvents?.filter(e => {
          const p = e.payload as any;
          return p?.user_id === userData.id;
        }) || [];

        const spent = userPurchases.reduce((sum, e) => {
          const p = e.payload as any;
          return sum + (p?.price || 0);
        }, 0);

        const owned = userPurchases.map(e => (e.payload as any)?.item_id).filter(Boolean);

        setTotalPoints(earned - spent);
        setOwnedItems(owned);
      }
    } catch (e) {
      console.error('Error loading shop data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!user) {
      toast.error('Please sign in to purchase items');
      return;
    }

    if (ownedItems.includes(item.id)) {
      toast.info('You already own this item!');
      return;
    }

    if (totalPoints < item.price) {
      toast.error(`Not enough points! You need ${item.price - totalPoints} more.`);
      return;
    }

    setPurchasing(item.id);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();

      if (!userData) throw new Error('User not found');

      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userData.id)
        .limit(1);

      if (!sessions?.length) throw new Error('No session');

      await supabase.from('events').insert({
        event_type: 'shop_purchase',
        session_id: sessions[0].id,
        payload: {
          user_id: userData.id,
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          category: item.category,
          purchased_at: new Date().toISOString(),
        }
      });

      setTotalPoints(prev => prev - item.price);
      setOwnedItems(prev => [...prev, item.id]);
      setShowPurchaseSuccess(item);
      setTimeout(() => setShowPurchaseSuccess(null), 3000);
      toast.success(`${item.name} purchased! 🎉`);
    } catch (e) {
      console.error('Purchase error:', e);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(i => i.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background">
        <DecisionLabLogo size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Purchase Success Overlay */}
      <AnimatePresence>
        {showPurchaseSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-center"
            >
              <Card className={`border-2 ${RARITY_BORDER[showPurchaseSuccess.rarity]} ${RARITY_BG[showPurchaseSuccess.rarity]} backdrop-blur-lg p-8`}>
                <CardContent className="p-0 space-y-4">
                  <motion.div
                    className="text-8xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8, repeat: 2 }}
                  >
                    {showPurchaseSuccess.preview}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground">Item Unlocked!</h2>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${RARITY_COLORS[showPurchaseSuccess.rarity]} bg-clip-text text-transparent`}>
                    {showPurchaseSuccess.name}
                  </p>
                  <Badge className={`bg-gradient-to-r ${RARITY_COLORS[showPurchaseSuccess.rarity]} text-white`}>
                    {showPurchaseSuccess.rarity.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-amber-500" />
                Rewards Shop
              </h1>
              <p className="text-muted-foreground text-sm">Spend your earned points on customizations</p>
            </div>
          </div>

          {/* Points Balance */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30"
          >
            <Coins className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-amber-500">{totalPoints.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="gap-2"
            >
              {icon} {label}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => {
            const owned = ownedItems.includes(item.id);
            const canAfford = totalPoints >= item.price;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                  owned
                    ? 'border-success/40 bg-success/5'
                    : RARITY_BORDER[item.rarity] + ' ' + RARITY_BG[item.rarity]
                } hover:shadow-lg`}>
                  {/* Rarity indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${RARITY_COLORS[item.rarity]}`} />

                  <CardContent className="p-5 space-y-3">
                    {/* Preview & Badge */}
                    <div className="flex items-start justify-between">
                      <motion.div
                        className="text-5xl"
                        whileHover={{ scale: 1.15, rotate: [0, 5, -5, 0] }}
                      >
                        {item.preview}
                      </motion.div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`text-xs bg-gradient-to-r ${RARITY_COLORS[item.rarity]} bg-clip-text text-transparent border-current`}>
                          {item.rarity}
                        </Badge>
                        {owned && (
                          <Badge className="bg-success text-success-foreground text-xs gap-1">
                            <Check className="w-3 h-3" /> Owned
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-foreground">{item.price.toLocaleString()}</span>
                      </div>

                      {owned ? (
                        <Button size="sm" variant="outline" disabled className="gap-1">
                          <Shield className="w-3 h-3" /> Equipped
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!canAfford || purchasing === item.id}
                          onClick={() => handlePurchase(item)}
                          className={`gap-1 ${canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' : ''}`}
                        >
                          {purchasing === item.id ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                              <Sparkles className="w-3 h-3" />
                            </motion.div>
                          ) : !canAfford ? (
                            <><Lock className="w-3 h-3" /> Locked</>
                          ) : (
                            <><ShoppingBag className="w-3 h-3" /> Buy</>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" /> How to Earn Points
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p>Play games and earn points based on your scores. Higher difficulty = more points!</p>
                </div>
                <div className="flex items-start gap-2">
                  <Flame className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <p>Maintain daily login streaks for score multipliers up to 3x bonus points!</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p>In-game win streaks give extra bonus points. Keep your winning streak alive!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
