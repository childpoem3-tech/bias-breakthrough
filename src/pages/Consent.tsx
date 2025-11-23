import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Users } from 'lucide-react';

export default function Consent() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToData, setAgreedToData] = useState(false);
  const [agreedToResearch, setAgreedToResearch] = useState(false);
  const { updateConsent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const canProceed = agreedToTerms && agreedToData && agreedToResearch;

  const handleAccept = async () => {
    if (!canProceed) return;

    try {
      await updateConsent(true);
      toast({
        title: 'Consent Recorded',
        description: 'Welcome to DecisionLab!'
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record consent. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDecline = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-6">
            <DecisionLabLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
          <p className="text-muted-foreground">
            Please review and accept the following to continue
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lab animate-scale-in">
          {/* Platform Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              About DecisionLab
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>
                <strong className="text-foreground">Purpose:</strong> DecisionLab offers 7 world-class 3D interactive mathematical games for educational purposes.
              </p>
              <p>
                <strong className="text-foreground">Content:</strong> Explore immersive 3D worlds teaching coordinates, factors, sequences, permutations, combinations, probability, and racing mechanics.
              </p>
              <p>
                <strong className="text-foreground">Experience:</strong> Each game features stunning animations, interactive controls, and progressive learning challenges.
              </p>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Data
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>
                <strong className="text-foreground">What we collect:</strong> Optional account information and basic gameplay progress. No personally identifiable information is required to play.
              </p>
              <p>
                <strong className="text-foreground">How we use it:</strong> Data helps improve the educational experience and track your personal learning progress.
              </p>
              <p>
                <strong className="text-foreground">Security:</strong> All data is encrypted and stored securely. You maintain full control over your account.
              </p>
            </div>
          </div>

          {/* User Rights */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Rights
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>✓ Free access to all 7 3D math games</p>
              <p>✓ Full control over your account and data</p>
              <p>✓ Option to play anonymously as a guest</p>
              <p>✓ Ability to delete your account at any time</p>
              <p>✓ Educational content with no advertisements</p>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the Terms of Service and understand this is an educational platform.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="data"
                checked={agreedToData}
                onCheckedChange={(checked) => setAgreedToData(checked === true)}
                className="mt-1"
              />
              <label htmlFor="data" className="text-sm leading-relaxed cursor-pointer">
                I consent to the storage of my gameplay progress for educational tracking purposes.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="research"
                checked={agreedToResearch}
                onCheckedChange={(checked) => setAgreedToResearch(checked === true)}
                className="mt-1"
              />
              <label htmlFor="research" className="text-sm leading-relaxed cursor-pointer">
                I am 13 years of age or older and have permission to use this platform.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAccept}
              disabled={!canProceed}
            >
              Accept & Continue
            </Button>
          </div>

          {/* Contact */}
          <p className="mt-6 text-xs text-center text-muted-foreground">
            Questions? Contact us at{' '}
            <a href="mailto:support@decisionlab.com" className="text-primary hover:underline">
              support@decisionlab.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
