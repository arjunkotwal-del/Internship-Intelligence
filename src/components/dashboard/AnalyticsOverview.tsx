import { Application, ApplicationStatus } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Send, 
  MessageSquare, 
  Trophy, 
  Ghost,
  Target,
  Clock,
  Building2,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsOverviewProps {
  applications: Application[];
}

const statusColors: Record<ApplicationStatus, string> = {
  applied: '#3b82f6',
  oa: '#f59e0b',
  interview: '#8b5cf6',
  offer: '#22c55e',
  rejected: '#ef4444',
  ghosted: '#94a3b8',
};

const statusBadgeColors: Record<ApplicationStatus, string> = {
  applied: 'bg-info/15 text-info border-info/30',
  oa: 'bg-warning/15 text-warning border-warning/30',
  interview: 'bg-primary/15 text-primary border-primary/30',
  offer: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  ghosted: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export function AnalyticsOverview({ applications }: AnalyticsOverviewProps) {
  const totalApplications = applications.length;
  
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const responseRate = totalApplications > 0
    ? Math.round(((statusCounts.oa || 0) + (statusCounts.interview || 0) + (statusCounts.offer || 0)) / totalApplications * 100)
    : 0;

  const interviewRate = totalApplications > 0
    ? Math.round(((statusCounts.interview || 0) + (statusCounts.offer || 0)) / totalApplications * 100)
    : 0;

  const offerRate = totalApplications > 0
    ? Math.round((statusCounts.offer || 0) / totalApplications * 100)
    : 0;

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: statusColors[status as ApplicationStatus],
  }));

  const monthlyData = applications.reduce((acc, app) => {
    const date = new Date(app.applied_at || app.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    
    if (!acc[month]) {
      acc[month] = { month, applied: 0, responses: 0 };
    }
    acc[month].applied++;
    if (['oa', 'interview', 'offer'].includes(app.status)) {
      acc[month].responses++;
    }
    return acc;
  }, {} as Record<string, { month: string; applied: number; responses: number }>);

  const barData = Object.values(monthlyData).slice(-6);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const thisWeekApps = applications.filter(app => {
    const appDate = new Date(app.applied_at || app.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return appDate >= weekAgo;
  }).length;

  const pendingResponses = (statusCounts.applied || 0) + (statusCounts.oa || 0);
  const activeInterviews = statusCounts.interview || 0;

  const stats = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: Send,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Response Rate',
      value: `${responseRate}%`,
      icon: MessageSquare,
      gradient: 'from-primary to-violet-500',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Interview Rate',
      value: `${interviewRate}%`,
      icon: Target,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Offer Rate',
      value: `${offerRate}%`,
      icon: Trophy,
      gradient: 'from-emerald-500 to-green-500',
      bgColor: 'bg-success/10',
    },
  ];

  const quickStats = [
    { label: 'This Week', value: thisWeekApps, icon: Calendar },
    { label: 'Pending', value: pendingResponses, icon: Clock },
    { label: 'Interviews', value: activeInterviews, icon: Target },
    { label: 'Offers', value: statusCounts.offer || 0, icon: Trophy },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card border-border/60 card-hover overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center">
                <BarChart className="h-4 w-4 text-white" />
              </div>
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="applied" fill="hsl(var(--primary))" name="Applied" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="responses" fill="hsl(var(--accent))" name="Responses" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Recent Applications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="font-bold text-xl">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="lg:col-span-2 shadow-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-1">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{app.company}</p>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={`${statusBadgeColors[app.status]} font-medium text-xs`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No applications yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ghosted Companies */}
      {(statusCounts.ghosted || 0) > 0 && (
        <Card className="border-muted shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-base">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Ghost className="h-4 w-4" />
              </div>
              Companies That Ghosted ({statusCounts.ghosted})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {applications
                .filter((app) => app.status === 'ghosted')
                .map((app) => (
                  <span 
                    key={app.id} 
                    className="px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground font-medium"
                  >
                    {app.company}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}