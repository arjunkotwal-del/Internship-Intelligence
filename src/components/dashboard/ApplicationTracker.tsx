import { useState } from 'react';
import { Application, ApplicationStatus } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Trash2,
  Loader2,
  FileText,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationTrackerProps {
  applications: Application[];
  onUpdate: () => void;
  isLoading: boolean;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-info/15 text-info border-info/30 hover:bg-info/20' },
  oa: { label: 'OA', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  interview: { label: 'Interview', className: 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/20' },
  offer: { label: 'Offer', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  ghosted: { label: 'Ghosted', className: 'bg-muted text-muted-foreground border-muted-foreground/20' },
};

export function ApplicationTracker({ applications, onUpdate, isLoading }: ApplicationTrackerProps) {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status updated',
        description: `Application status changed to ${statusConfig[newStatus].label}`,
      });
      onUpdate();
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting application',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Application deleted',
        description: 'The application has been removed.',
      });
      onUpdate();
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border-border/60">
        <CardContent className="py-16 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="shadow-card border-border/60 border-dashed">
        <CardContent className="py-20 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start tracking your internship applications by clicking "Add Application" above
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/60 overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 py-5">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <span>Your Applications</span>
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
              {applications.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">Location</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Applied</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{app.company}</span>
                      {app.job_url && (
                        <a 
                          href={app.job_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{app.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {app.location ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                        {app.location}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {app.applied_at ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                        {format(new Date(app.applied_at), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => handleStatusChange(app.id, value as ApplicationStatus)}
                      disabled={updatingId === app.id}
                    >
                      <SelectTrigger className="w-[130px] h-9 border-0 bg-transparent hover:bg-muted/50 focus:ring-1">
                        <SelectValue>
                          <Badge 
                            variant="outline" 
                            className={`${statusConfig[app.status].className} font-medium`}
                          >
                            {updatingId === app.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              statusConfig[app.status].label
                            )}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {Object.entries(statusConfig).map(([value, { label, className }]) => (
                          <SelectItem key={value} value={value}>
                            <Badge variant="outline" className={`${className} font-medium`}>
                              {label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                    >
                      {deletingId === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}