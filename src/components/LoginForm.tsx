import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCTFStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Shield, Terminal } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useCTFStore();
  const { toast } = useToast();

  const handleLogin = () => {
    if (login(username, password)) {
      toast({
        title: "Access Granted",
        description: "Welcome to the CTF platform!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials. Try admin/admin123 or hacker/password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Terminal className="h-12 w-12 text-neon-green shadow-neon" />
            <Shield className="h-8 w-8 text-neon-blue ml-2 shadow-neon-blue" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            CyberCTF
          </h1>
          <p className="text-muted-foreground mt-2">Elite Hacking Platform</p>
        </div>

        <Card className="border-cyber-light bg-card/50 backdrop-blur-sm shadow-neon">
          <CardHeader className="text-center">
            <CardTitle className="text-neon-green">Access Terminal</CardTitle>
            <CardDescription>Enter your credentials to proceed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-cyber-light border-muted focus:border-neon-green focus:ring-neon-green"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-cyber-light border-muted focus:border-neon-green focus:ring-neon-green"
              />
            </div>
            <Button 
              onClick={handleLogin}
              className="w-full bg-neon-green text-cyber-dark hover:bg-neon-green/90 shadow-neon font-semibold"
            >
              HACK IN
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Demo Credentials:</p>
              <p className="text-neon-blue">User: hacker / password</p>
              <p className="text-neon-purple">Admin: admin / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;