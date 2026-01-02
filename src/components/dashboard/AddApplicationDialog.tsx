import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const applicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional(),
  job_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  salary_range: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export function AddApplicationDialog({ open, onOpenChange, onSuccess }: AddApplicationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    status: 'applied' as const,
    job_url: '',
    salary_range: '',
    notes: '',
    applied_at: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = applicationSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to add applications.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim() || null,
      status: formData.status,
      job_url: formData.job_url.trim() || null,
      salary_range: formData.salary_range.trim() || null,
      notes: formData.notes.trim() || null,
      applied_at: formData.applied_at || null,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error adding application',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Application added!',
        description: `${formData.company} - ${formData.role} has been added to your tracker.`,
      });
      
      // Reset form
      setFormData({
        company: '',
        role: '',
        location: '',
        status: 'applied',
        job_url: '',
        salary_range: '',
        notes: '',
        applied_at: new Date().toISOString().split('T')[0],
      });
      
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Track a new internship application. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="Google"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="Software Engineer Intern"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={errors.role ? 'border-destructive' : ''}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="oa">Online Assessment</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="ghosted">Ghosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applied_at">Applied Date</Label>
              <Input
                id="applied_at"
                type="date"
                value={formData.applied_at}
                onChange={(e) => handleChange('applied_at', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                placeholder="$50-60/hr"
                value={formData.salary_range}
                onChange={(e) => handleChange('salary_range', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_url">Job URL</Label>
            <Input
              id="job_url"
              type="url"
              placeholder="https://careers.google.com/..."
              value={formData.job_url}
              onChange={(e) => handleChange('job_url', e.target.value)}
              className={errors.job_url ? 'border-destructive' : ''}
            />
            {errors.job_url && (
              <p className="text-sm text-destructive">{errors.job_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this application..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
