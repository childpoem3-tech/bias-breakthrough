import { Button } from '@/components/ui/button';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { ArrowRight, Brain, Users, TrendingUp, Award, Shield, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (orbRef.current) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * 20;
        orbRef.current.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const games = [
    { name: 'Dictator Game', icon: '💰', desc: 'Test your altruism', level: 'Beginner' },
    { name: 'Ultimatum Game', icon: '🤝', desc: 'Fairness in negotiations', level: 'Beginner' },
    { name: 'Delay Discounting', icon: '⏰', desc: 'Patience vs impulsivity', level: 'Beginner' },
    { name: "Prisoner's Dilemma", icon: '🔒', desc: 'Cooperation strategies', level: 'Intermediate' },
    { name: 'Trust & Betray', icon: '💎', desc: 'Investment decisions', level: 'Intermediate' },
    { name: 'Risk-Reward Lottery', icon: '🎰', desc: 'Risk preferences', level: 'Intermediate' },
    { name: 'Race-to-Zero', icon: '⚡', desc: 'Resource management', level: 'Advanced' },
    { name: 'Loss vs Gain Framing', icon: '📊', desc: 'Framing effects', level: 'Advanced' },
    { name: 'Social Comparison', icon: '👥', desc: 'Status and envy', level: 'Advanced' },
    { name: 'Quantum Dilemma', icon: '⚛️', desc: 'Probabilistic choices', level: 'Advanced' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <DecisionLabLogo size="sm" />
          <div className="flex items-center gap-6">
            <a href="#games" className="text-sm font-medium hover:text-primary transition-colors">Games</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
            <a href="#research" className="text-sm font-medium hover:text-primary transition-colors">Research</a>
            <Button onClick={() => navigate('/auth')} variant="default">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent/30">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Research-Backed Decision Science</span>
              </div>
              
              <h1 className="text-6xl font-bold leading-tight">
                Discover Your
                <span className="text-gradient bg-gradient-primary bg-clip-text text-transparent"> Decision </span>
                Patterns
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Play 10 interactive games based on behavioral economics. Get your personalized bias profile in minutes.
              </p>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 shadow-lab hover:shadow-glow transition-all duration-300"
                >
                  Play for Free <ArrowRight className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/admin')}>
                  <Eye className="w-4 h-4 mr-2" />
                  For Researchers
                </Button>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">10</div>
                  <div className="text-sm text-muted-foreground">Games</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">5 min</div>
                  <div className="text-sm text-muted-foreground">Complete Profile</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Orb */}
            <div className="relative h-[600px] flex items-center justify-center">
              <div 
                ref={orbRef}
                className="relative w-96 h-96 transition-transform duration-300 ease-out"
              >
                {/* Main Orb */}
                <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute inset-8 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full backdrop-blur-sm border border-primary/30 shadow-glow">
                  {/* Floating Icons */}
                  {['💰', '🤝', '⏰', '🔒', '💎', '🎰', '⚡', '📊'].map((icon, i) => (
                    <div
                      key={i}
                      className="absolute w-12 h-12 bg-background/90 rounded-full flex items-center justify-center text-2xl shadow-lg border border-border animate-float"
                      style={{
                        top: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                        left: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                        animationDelay: `${i * 0.2}s`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {icon}
                    </div>
                  ))}
                  
                  {/* Center Brain Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-24 h-24 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section id="games" className="py-20 px-6 bg-background-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">10 Research-Backed Games</h2>
            <p className="text-muted-foreground text-lg">Each game reveals different aspects of your decision-making</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, i) => (
              <div 
                key={i}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lab hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-4xl mb-4">{game.icon}</div>
                <div className="inline-block px-3 py-1 bg-accent/20 rounded-full text-xs font-medium text-accent mb-3">
                  {game.level}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {game.name}
                </h3>
                <p className="text-muted-foreground text-sm">{game.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'Play Games', desc: 'Complete 10 interactive decision-making scenarios' },
              { icon: TrendingUp, title: 'Get Insights', desc: 'Receive your personalized bias profile with detailed analytics' },
              { icon: Award, title: 'Download Report', desc: 'Export your results as PDF or JSON for future reference' }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lab">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section id="research" className="py-20 px-6 bg-background-secondary/50">
        <div className="container mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-muted-foreground">Active Researchers</div>
            </div>
            <div className="space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold">GDPR</div>
              <div className="text-muted-foreground">Compliant & Secure</div>
            </div>
            <div className="space-y-2">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold">WCAG</div>
              <div className="text-muted-foreground">Accessible Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Discover Your Biases?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of players exploring their decision patterns</p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-12 shadow-glow">
            Start Playing Now <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <DecisionLabLogo size="sm" />
            <p className="text-sm text-muted-foreground mt-4">
              Research-backed platform for understanding human decision-making
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#games" className="hover:text-primary">Games</a></li>
              <li><a href="#how-it-works" className="hover:text-primary">How it Works</a></li>
              <li><a href="#research" className="hover:text-primary">Research</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-primary">Privacy</a></li>
              <li><a href="/terms" className="hover:text-primary">Terms</a></li>
              <li><a href="/consent" className="hover:text-primary">Consent</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:research@decisionlab.com" className="hover:text-primary">research@decisionlab.com</a></li>
              <li><a href="/docs" className="hover:text-primary">Documentation</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2025 Decision Lab. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
