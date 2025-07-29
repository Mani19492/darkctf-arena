import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Trophy, Code, UserCheck, ShieldCheck } from 'lucide-react';
import AuthForm from './AuthForm';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'participant-login' | 'participant-signup' | 'admin'>('participant-login');

  const handleAuthClick = (mode: 'participant-login' | 'participant-signup' | 'admin') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthForm mode={authMode} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 gradient-text animate-glow">
            CTF Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up">
            Join the ultimate cybersecurity challenge. Test your skills, compete with teams, 
            and prove your expertise in capture-the-flag competitions.
          </p>
          
          {/* Participant Section */}
          <div className="mb-12 animate-scale-in stagger-1">
            <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur border-border/50 hover-scale hover-glow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-highlight-secondary to-highlight rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">For Participants & Hackers</CardTitle>
                <CardDescription>
                  Join CTF competitions, solve challenges, and compete with teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => handleAuthClick('participant-signup')}
                    className="bg-gradient-to-r from-highlight-secondary to-highlight hover:opacity-90 text-white hover-scale"
                  >
                    Join as Participant
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => handleAuthClick('participant-login')}
                    className="hover-glow"
                  >
                    Participant Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Section */}
          <div className="animate-scale-in stagger-2">
            <Card className="max-w-lg mx-auto bg-card/80 backdrop-blur border-border/50 hover-scale hover-glow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-highlight-accent to-destructive rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Admin Portal</CardTitle>
                <CardDescription>
                  Manage CTF events, challenges, and platform administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  onClick={() => handleAuthClick('admin')}
                  className="w-full bg-gradient-to-r from-highlight-accent to-destructive hover:opacity-90 text-white hover-scale"
                >
                  Admin Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card/50 backdrop-blur border-border/50 hover-scale hover-glow animate-scale-in stagger-1">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-highlight animate-pulse-slow" />
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Enterprise-grade security with role-based access control and real-time monitoring.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 hover-scale hover-glow animate-scale-in stagger-2">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-highlight-secondary animate-pulse-slow" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Form teams or compete solo. Built-in communication and collaboration tools.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 hover-scale hover-glow animate-scale-in stagger-3">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-highlight-accent animate-pulse-slow" />
              <CardTitle>Real-time Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Live leaderboards with detailed analytics and performance tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 hover-scale hover-glow animate-scale-in stagger-4">
            <CardHeader className="text-center">
              <Code className="w-12 h-12 mx-auto mb-4 text-highlight animate-pulse-slow" />
              <CardTitle>Multiple Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Web, Pwn, Crypto, Forensics, Reverse Engineering, and Miscellaneous challenges.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 gradient-text">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 animate-slide-up stagger-1 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-r from-highlight to-highlight-secondary rounded-full flex items-center justify-center mx-auto animate-glow">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold">Join a CTF</h3>
              <p className="text-muted-foreground">
                Use the CTF code provided by organizers to join an active competition.
              </p>
            </div>
            
            <div className="space-y-4 animate-slide-up stagger-2 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-r from-highlight-secondary to-highlight-accent rounded-full flex items-center justify-center mx-auto animate-glow">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold">Form Your Team</h3>
              <p className="text-muted-foreground">
                Choose to compete solo or create/join a team with other participants.
              </p>
            </div>
            
            <div className="space-y-4 animate-slide-up stagger-3 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-r from-highlight-accent to-highlight rounded-full flex items-center justify-center mx-auto animate-glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold">Solve Challenges</h3>
              <p className="text-muted-foreground">
                Tackle cybersecurity challenges across multiple categories and submit flags.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;