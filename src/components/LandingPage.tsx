import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Trophy, Code } from 'lucide-react';
import AuthForm from './AuthForm';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin'>('login');

  const handleAuthClick = (mode: 'login' | 'signup' | 'admin') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthForm mode={authMode} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
            CTF Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the ultimate cybersecurity challenge. Test your skills, compete with teams, 
            and prove your expertise in capture-the-flag competitions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleAuthClick('signup')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => handleAuthClick('login')}
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => handleAuthClick('admin')}
            >
              Admin Portal
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-highlight" />
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Enterprise-grade security with role-based access control and real-time monitoring.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-highlight-secondary" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Form teams or compete solo. Built-in communication and collaboration tools.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-highlight-accent" />
              <CardTitle>Real-time Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Live leaderboards with detailed analytics and performance tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="text-center">
              <Code className="w-12 h-12 mx-auto mb-4 text-highlight" />
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
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Join a CTF</h3>
              <p className="text-muted-foreground">
                Use the CTF code provided by organizers to join an active competition.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Form Your Team</h3>
              <p className="text-muted-foreground">
                Choose to compete solo or create/join a team with other participants.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
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