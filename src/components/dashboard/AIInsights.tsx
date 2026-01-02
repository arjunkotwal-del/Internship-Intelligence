import { Application } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeMatchAnalysis } from './ResumeMatchAnalysis';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Target,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Rocket,
  Code2
} from 'lucide-react';

interface AIInsightsProps {
  applications: Application[];
}

export function AIInsights({ applications }: AIInsightsProps) {
  const totalApplications = applications.length;
  const rejections = applications.filter(a => a.status === 'rejected').length;
  const ghosted = applications.filter(a => a.status === 'ghosted').length;
  const interviews = applications.filter(a => a.status === 'interview' || a.status === 'offer').length;

  const rejectionRate = totalApplications > 0 ? Math.round(rejections / totalApplications * 100) : 0;
  const ghostRate = totalApplications > 0 ? Math.round(ghosted / totalApplications * 100) : 0;

  const insights: Array<{
    type: string;
    icon: typeof Target;
    title: string;
    description: string;
  }> = [];

  if (totalApplications < 10) {
    insights.push({
      type: 'info',
      icon: Target,
      title: 'Apply to more positions',
      description: 'Industry data shows that most candidates need 30-50 applications to land an internship. Keep applying!',
    });
  }

  if (rejectionRate > 50 && totalApplications >= 10) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'High rejection rate detected',
      description: 'Consider tailoring your resume more specifically to each role. Generic resumes often get filtered out by ATS systems.',
    });
  }

  if (ghostRate > 40 && totalApplications >= 5) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Many applications going unanswered',
      description: 'Try applying through referrals or reaching out to recruiters on LinkedIn. Direct connections improve response rates significantly.',
    });
  }

  if (interviews > 0 && interviews / totalApplications < 0.1) {
    insights.push({
      type: 'tip',
      icon: Lightbulb,
      title: 'Improve your resume keywords',
      description: 'Use the job description to identify key skills and include them naturally in your resume. ATS systems scan for keyword matches.',
    });
  }

  if (totalApplications >= 20 && interviews >= 3) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Great progress!',
      description: "You're getting interview callbacks. Focus on practicing behavioral and technical questions for your upcoming interviews.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: BookOpen,
      title: 'Build your application history',
      description: 'As you add more applications, AI insights will analyze your patterns and provide personalized recommendations.',
    });
  }

  const skillSuggestions = [
    { skill: 'Docker', frequency: '72%', priority: 'high' },
    { skill: 'SQL', frequency: '68%', priority: 'high' },
    { skill: 'AWS', frequency: '54%', priority: 'medium' },
    { skill: 'TypeScript', frequency: '48%', priority: 'medium' },
    { skill: 'CI/CD', frequency: '42%', priority: 'medium' },
  ];

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          border: 'border-l-warning',
          bg: 'bg-warning/10',
          icon: 'text-warning',
        };
      case 'success':
        return {
          border: 'border-l-success',
          bg: 'bg-success/10',
          icon: 'text-success',
        };
      default:
        return {
          border: 'border-l-primary',
          bg: 'bg-primary/10',
          icon: 'text-primary',
        };
    }
  };

  return (
    <Tabs defaultValue="insights" className="space-y-8">
      <TabsList className="h-12 bg-muted/50 p-1">
        <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm h-10 px-4">
          <Brain className="h-4 w-4" />
          Insights
        </TabsTrigger>
        <TabsTrigger value="resume-match" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm h-10 px-4">
          <FileText className="h-4 w-4" />
          Resume Match
        </TabsTrigger>
      </TabsList>

      <TabsContent value="insights" className="space-y-8">
        {/* AI Insights Cards */}
        <div className="grid gap-4">
          {insights.map((insight, index) => {
            const style = getInsightStyle(insight.type);
            return (
              <Card 
                key={index}
                className={`border-l-4 ${style.border} shadow-card hover:shadow-card-hover transition-shadow`}
              >
                <CardContent className="pt-6 pb-6">
                  <div className="flex gap-5">
                    <div className={`p-3 rounded-xl ${style.bg} shrink-0`}>
                      <insight.icon className={`h-5 w-5 ${style.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skills Gap Analysis */}
          <Card className="shadow-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Skills to Add
              </CardTitle>
              <CardDescription className="text-sm">
                Top skills appearing in similar internship listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skillSuggestions.map((item) => (
                  <div 
                    key={item.skill}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-semibold">{item.skill}</span>
                      <Badge 
                        variant="outline"
                        className={
                          item.priority === 'high' 
                            ? 'border-destructive/50 text-destructive bg-destructive/10' 
                            : 'border-warning/50 text-warning bg-warning/10'
                        }
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {item.frequency} of roles
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Suggestions */}
          <Card className="shadow-card border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                Project Ideas to Build
              </CardTitle>
              <CardDescription className="text-sm">
                Based on trending skills in your target roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Full-Stack CRUD App',
                    skills: ['React', 'Node.js', 'SQL'],
                    difficulty: 'Beginner',
                  },
                  {
                    title: 'CI/CD Pipeline',
                    skills: ['Docker', 'GitHub Actions', 'AWS'],
                    difficulty: 'Intermediate',
                  },
                  {
                    title: 'Real-time Chat App',
                    skills: ['WebSockets', 'TypeScript', 'Redis'],
                    difficulty: 'Intermediate',
                  },
                ].map((project) => (
                  <div 
                    key={project.title}
                    className="p-5 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h4>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {project.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="resume-match">
        <ResumeMatchAnalysis />
      </TabsContent>
    </Tabs>
  );
}