import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Eye, Database, UserCheck } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal = ({ isOpen, onAccept, onDecline }: ConsentModalProps) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreedToData, setAgreedToData] = useState(false);
  const [agreedToResearch, setAgreedToResearch] = useState(false);

  const canProceed = hasReadTerms && agreedToData && agreedToResearch;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gradient-card">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lab">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Research Participation Consent</DialogTitle>
              <DialogDescription>
                Welcome to the Decision Lab research platform
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-96 pr-4">
          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Study Purpose</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This research platform investigates cognitive biases in decision-making through 
                interactive games. Your participation helps advance understanding of human behavior 
                in economic and social contexts.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Data Collection & Privacy</h3>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>What we collect:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Game choices and response times</li>
                  <li>Anonymized usage patterns</li>
                  <li>Technical data (browser, device type)</li>
                  <li>Optional email (only if you request PDF report)</li>
                </ul>
                
                <p className="mt-3"><strong>What we DON'T collect:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Personal identifying information</li>
                  <li>Location data beyond country-level</li>
                  <li>Browsing history or other websites</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Your Rights</h3>
              </div>
              <div className="text-muted-foreground space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Withdraw from the study at any time</li>
                  <li>Request deletion of your data</li>
                  <li>Access your anonymized data</li>
                  <li>Opt-out of research use while keeping personal results</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3 bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-foreground">Data Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                All data is encrypted, stored securely, and accessible only to authorized researchers. 
                We follow GDPR guidelines and maintain strict anonymization protocols.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="read-terms" 
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
              />
              <label htmlFor="read-terms" className="text-sm text-foreground">
                I have read and understood the study information above
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agree-data" 
                checked={agreedToData}
                onCheckedChange={(checked) => setAgreedToData(checked as boolean)}
              />
              <label htmlFor="agree-data" className="text-sm text-foreground">
                I consent to anonymized data collection and analysis
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agree-research" 
                checked={agreedToResearch}
                onCheckedChange={(checked) => setAgreedToResearch(checked as boolean)}
              />
              <label htmlFor="agree-research" className="text-sm text-foreground">
                I agree to participate in this research study
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline & Exit
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!canProceed}
            className="bg-gradient-primary shadow-lab disabled:opacity-50"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};