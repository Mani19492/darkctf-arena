import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/types/ctf';
import { useCTFStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Flag, Users, Download, Eye, EyeOff } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const [flagInput, setFlagInput] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { submitFlag } = useCTFStore();
  const { toast } = useToast();

  const categoryColors = {
    Web: 'bg-neon-green text-cyber-dark',
    Pwn: 'bg-neon-blue text-cyber-dark',
    Crypto: 'bg-neon-purple text-cyber-dark',
    Forensics: 'bg-orange-500 text-cyber-dark',
    Reverse: 'bg-pink-500 text-cyber-dark',
    Misc: 'bg-yellow-500 text-cyber-dark'
  };

  const handleSubmitFlag = () => {
    if (submitFlag(challenge.id, flagInput)) {
      toast({
        title: "Flag Correct!",
        description: `You earned ${challenge.points} points!`,
      });
      setFlagInput('');
    } else {
      toast({
        title: "Incorrect Flag",
        description: "Try again, hacker!",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-cyber-light hover:border-neon-green transition-all duration-300 hover:shadow-neon">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-neon-green">{challenge.title}</CardTitle>
            <CardDescription className="mt-2">{challenge.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={categoryColors[challenge.category]}>
              {challenge.category}
            </Badge>
            <div className="text-2xl font-bold text-neon-blue">
              {challenge.points}pts
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {challenge.solves} solves
            </div>
            {challenge.files.length > 0 && (
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {challenge.files.length} files
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-neon-blue hover:text-neon-blue hover:bg-cyber-light"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {showDetails && (
          <div className="space-y-4 mb-4">
            {challenge.hints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neon-purple mb-2">Hints Available:</h4>
                {challenge.hints.map((hint) => (
                  <div key={hint.id} className="text-sm text-muted-foreground bg-cyber-light p-2 rounded">
                    {hint.text} <span className="text-orange-400">(-{hint.pointDeduction}pts)</span>
                  </div>
                ))}
              </div>
            )}
            
            {challenge.files.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neon-blue mb-2">Challenge Files:</h4>
                <div className="flex flex-wrap gap-2">
                  {challenge.files.map((file) => (
                    <Button
                      key={file}
                      variant="outline"
                      size="sm"
                      className="text-xs border-cyber-light hover:border-neon-blue"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {file}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            placeholder="CTF{flag_here}"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            className="bg-cyber-light border-muted focus:border-neon-green focus:ring-neon-green"
          />
          <Button
            onClick={handleSubmitFlag}
            className="bg-neon-green text-cyber-dark hover:bg-neon-green/90 shadow-neon"
          >
            <Flag className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;