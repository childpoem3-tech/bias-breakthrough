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
        description: 'Thank you for participating in our research!'
      });
      navigate('/lobby');
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
          <h1 className="text-3xl font-bold mb-2">Research Consent</h1>
          <p className="text-muted-foreground">
            Please review and accept the following to continue
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lab animate-scale-in">
          {/* Study Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Study Information
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>
                <strong className="text-foreground">Purpose:</strong> This research platform studies human decision-making patterns and cognitive biases through interactive games.
              </p>
              <p>
                <strong className="text-foreground">Duration:</strong> Approximately 15-20 minutes to complete all games.
              </p>
              <p>
                <strong className="text-foreground">Procedure:</strong> You will play 10 interactive decision-making games across three difficulty levels.
              </p>
            </div>
          </div>

          {/* Data Collection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Data Collection & Privacy
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>
                <strong className="text-foreground">What we collect:</strong> Your game choices, response times, and gameplay patterns. No personally identifiable information is required.
              </p>
              <p>
                <strong className="text-foreground">How we use it:</strong> Data is analyzed to understand decision-making patterns and cognitive biases. Results are anonymized and aggregated.
              </p>
              <p>
                <strong className="text-foreground">Security:</strong> All data is encrypted and stored securely. You can request data deletion at any time.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Rights
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>✓ Participation is completely voluntary</p>
              <p>✓ You may withdraw at any time without penalty</p>
              <p>✓ You can request your data to be deleted</p>
              <p>✓ You will receive a copy of your results</p>
              <p>✓ Your identity remains anonymous unless you choose to share it</p>
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
                I have read and understood the study information and voluntarily agree to participate in this research.
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
                I consent to the collection and analysis of my gameplay data for research purposes as described above.
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
                I understand that my data may be used in anonymized form for scientific publications and presentations.
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
            <a href="mailto:research@decisionlab.com" className="text-primary hover:underline">
              research@decisionlab.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
