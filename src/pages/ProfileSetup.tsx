import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, GraduationCap, Briefcase, Globe2, Mail } from 'lucide-react';

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  age_range: z.enum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say', 'other']).optional(),
  education_level: z.enum(['high-school', 'bachelors', 'masters', 'phd', 'other']).optional(),
  occupation: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  research_consent: z.boolean().default(false),
  newsletter_opt_in: z.boolean().default(false),
  interests: z.string().max(500).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      research_consent: false,
      newsletter_opt_in: false,
    }
  });

  const researchConsent = watch('research_consent');
  const newsletterOptIn = watch('newsletter_opt_in');

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User not found. Please sign in again.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Temporarily disabled until migration is approved
      toast({
        title: 'Profile Setup',
        description: 'Please approve the database migration first to enable profile creation.',
        variant: 'default'
      });
      
      // This will work after migration is approved:
      // const { error } = await supabase
      //   .from('profiles')
      //   .insert({
      //     user_id: userId,
      //     display_name: data.display_name || null,
      //     age_range: data.age_range || null,
      //     gender: data.gender || null,
      //     education_level: data.education_level || null,
      //     occupation: data.occupation || null,
      //     country: data.country || null,
      //     research_consent: data.research_consent,
      //     newsletter_opt_in: data.newsletter_opt_in,
      //     interests: data.interests || null,
      //   });

      // if (error) throw error;

      // For now, just navigate to lobby
      setTimeout(() => navigate('/lobby'), 1500);
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-6">
            <DecisionLabLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Help us personalize your experience (all fields are optional)
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8 shadow-lab animate-scale-in">
          {/* Basic Information */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold pb-2 border-b">
              <User className="w-5 h-5 text-primary" />
              <span>Basic Information</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="How should we call you?"
                {...register('display_name')}
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select onValueChange={(value) => setValue('age_range', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55-64">55-64</SelectItem>
                    <SelectItem value="65+">65+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={(value) => setValue('gender', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold pb-2 border-b">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Education & Career</span>
            </div>

            <div className="space-y-2">
              <Label>Education Level</Label>
              <Select onValueChange={(value) => setValue('education_level', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Occupation/Field of Study
              </Label>
              <Input
                id="occupation"
                placeholder="e.g., Software Engineer, Psychology Student"
                {...register('occupation')}
              />
            </div>
          </div>

          {/* Location & Interests */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold pb-2 border-b">
              <Globe2 className="w-5 h-5 text-primary" />
              <span>Location & Interests</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Where are you from?"
                {...register('country')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Research Interests (Optional)</Label>
              <Textarea
                id="interests"
                placeholder="Tell us about your interests in decision-making, psychology, economics, etc."
                rows={3}
                {...register('interests')}
              />
            </div>
          </div>

          {/* Consent & Preferences */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold pb-2 border-b">
              <Mail className="w-5 h-5 text-primary" />
              <span>Preferences</span>
            </div>

            <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="research_consent"
                  checked={researchConsent}
                  onCheckedChange={(checked) => setValue('research_consent', checked === true)}
                  className="mt-1"
                />
                <label htmlFor="research_consent" className="text-sm leading-relaxed cursor-pointer">
                  <strong>Research Participation:</strong> I agree to share my anonymized gameplay data for academic research and publications.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="newsletter_opt_in"
                  checked={newsletterOptIn}
                  onCheckedChange={(checked) => setValue('newsletter_opt_in', checked === true)}
                  className="mt-1"
                />
                <label htmlFor="newsletter_opt_in" className="text-sm leading-relaxed cursor-pointer">
                  <strong>Newsletter:</strong> Send me updates about new games, research findings, and platform improvements.
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/lobby')}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </div>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            You can update your profile anytime from your dashboard
          </p>
        </form>
      </div>
    </div>
  );
}
