import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ApplicationTracker } from '@/components/dashboard/ApplicationTracker';
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { AddApplicationDialog } from '@/components/dashboard/AddApplicationDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type ApplicationStatus = 'applied' | 'oa' | 'interview' | 'offer' | 'rejected' | 'ghosted';

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string | null;
  deadline: string | null;
  status: ApplicationStatus;
  notes: string | null;
  job_url: string | null;
  salary_range: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'tracker' | 'analytics' | 'insights'>('tracker');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching applications',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setApplications(data as Application[] || []);
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeView) {
      case 'tracker':
        return (
          <ApplicationTracker 
            applications={applications} 
            onUpdate={fetchApplications}
            isLoading={isLoading}
          />
        );
      case 'analytics':
        return <AnalyticsOverview applications={applications} />;
      case 'insights':
        return <AIInsights applications={applications} />;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'tracker':
        return { title: 'Application Tracker', description: 'Track and manage your internship applications' };
      case 'analytics':
        return { title: 'Analytics', description: 'Visualize your application progress and trends' };
      case 'insights':
        return { title: 'AI Insights', description: 'Get AI-powered recommendations and analysis' };
    }
  };

  const viewInfo = getViewTitle();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50 h-16">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1 h-9 w-9" />
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-lg">{viewInfo.title}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:block truncate max-w-[200px]">
                  {user.email}
                </span>
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9 gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold sm:hidden">{viewInfo.title}</h2>
                  <p className="text-muted-foreground mt-1">
                    {viewInfo.description}
                  </p>
                </div>
                {activeView === 'tracker' && (
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-gradient-primary hover:opacity-90 shadow-md shadow-primary/20 h-11 px-6">
                    <Plus className="h-4 w-4" />
                    Add Application
                  </Button>
                )}
              </div>

              <div className="animate-fade-in">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>

      <AddApplicationDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchApplications}
      />
    </SidebarProvider>
  );
}