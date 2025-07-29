import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthFormProps {
  mode: 'participant-login' | 'participant-signup' | 'admin';
  onBack: () => void;
}

const AuthForm = ({ mode, onBack }: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState(
    mode === 'participant-login' ? 'login' : 
    mode === 'participant-signup' ? 'signup' : 'admin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin for admin mode, allow regular users for participant mode
          if (mode === 'admin') {
            // For admin mode, check admin status
            supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()
              .then(({ data }) => {
                if (data?.is_admin) {
                  window.location.href = '/app';
                } else {
                  // Not an admin, sign them out
                  supabase.auth.signOut();
                  toast({
                    title: "Access denied",
                    description: "This platform is restricted to administrators only",
                    variant: "destructive"
                  });
                }
              });
          } else {
            // For participant mode, redirect directly
            window.location.href = '/app';
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/app`;
      
      // Only allow participant signup for non-admin modes
      if (mode === 'admin') {
        toast({
          title: "Invalid signup",
          description: "Admin accounts must be created by existing administrators",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            phone_number: phoneNumber
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to complete your registration."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user) {
        // Check admin status if this is admin login
        if (mode === 'admin') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

          if (!profile?.is_admin) {
            await supabase.auth.signOut();
            toast({
              title: "Access denied",
              description: "This platform is restricted to administrators only",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Admin login failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Check if user is admin after login
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session?.user?.id)
          .single();

        if (!profile?.is_admin) {
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "This platform is restricted to administrators only",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Admin access granted",
            description: "Welcome to the CTF Administration Platform"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground hover-scale"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        <Card className="bg-card/80 backdrop-blur border-border/50 hover-glow animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === 'admin' ? 'CTF Admin Portal' : 'CTF Platform'}
            </CardTitle>
            <CardDescription>
              {mode === 'admin' 
                ? 'Administrator access only' 
                : 'Join CTF competitions and test your cybersecurity skills'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {mode === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="hover-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="hover-glow"
                  />
                </div>
                <Button type="submit" className="w-full hover-scale" disabled={loading}>
                  {loading ? "Signing in..." : "Admin Sign In"}
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="hover-glow"
                      />
                    </div>
                    <Button type="submit" className="w-full hover-scale" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="hover-glow"
                      />
                    </div>
                    <Button type="submit" className="w-full hover-scale" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;