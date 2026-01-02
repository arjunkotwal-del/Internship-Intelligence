import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  BarChart3, 
  Brain, 
  Target, 
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Check,
  Rocket
} from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Target,
      title: 'Smart Tracking',
      description: 'Track every application with real-time status updates, deadlines, and organized notes.',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Beautiful charts showing response rates, interview trends, and success patterns.',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get personalized AI recommendations to improve your application strategy.',
    },
    {
      icon: Zap,
      title: 'Resume Match',
      description: 'Instantly compare your resume against job descriptions to find skill gaps.',
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-info/5 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative container mx-auto px-4 pt-6 pb-28">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-accent">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Internship Intelligence
              </span>
            </div>
            <Link to="/auth">
              <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 gap-2 px-5">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Rocket className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-white/90">
                Your smart internship tracker
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
              Stop Applying Blindly.
              <br />
              <span className="text-gradient-accent">Start Winning Offers.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
              Track your internship applications, analyze your success patterns, and get AI-powered insights to land your dream role.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-accent hover:opacity-90 text-white gap-2 px-8 h-13 text-base shadow-glow-accent transition-all duration-300 hover:scale-[1.02]">
                  Start Tracking Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 gap-2 h-13 px-6 text-base">
                <Users className="h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              Everything You Need to
              <br />
              <span className="text-gradient">Land That Internship</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Replace spreadsheets and guesswork with a powerful platform built for ambitious students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group bg-card border-border/60 card-hover overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 pb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to supercharge your internship search
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Add Applications',
                description: 'Log each application with company, role, and relevant details.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Track Progress',
                description: 'Update statuses as you move through your job search pipeline.',
                icon: TrendingUp,
              },
              {
                step: '03',
                title: 'Get Insights',
                description: 'Use AI-powered feedback to continuously improve your approach.',
                icon: Brain,
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative text-center animate-slide-up group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="h-9 w-9 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-primary mb-2 tracking-wider">
                  STEP {item.step}
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-hero border-0 overflow-hidden shadow-2xl">
            <CardContent className="p-12 lg:p-20 text-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/15 rounded-full blur-[80px]" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[80px]" />
              </div>
              <div className="relative">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to Take Control of
                  <br />
                  Your Job Search?
                </h2>
                <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Stop applying blindly and start winning interviews with smart tracking and AI insights.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 px-10 h-14 text-base font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    Get Started — It's Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-6 mt-8 text-white/60 text-sm">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    Free forever
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    No credit card
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    Setup in 30 seconds
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-accent rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Internship Intelligence</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Internship Intelligence. Built for ambitious students.
          </p>
        </div>
      </footer>
    </div>
  );
}