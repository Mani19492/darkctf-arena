import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCTFStore } from '@/lib/store';
import ChallengeCard from './ChallengeCard';
import { Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ChallengeList: React.FC = () => {
  const { challenges, currentCTF } = useCTFStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Web', 'Pwn', 'Crypto', 'Forensics', 'Reverse', 'Misc'];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && challenge.enabled;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
          {currentCTF?.name}
        </h1>
        <p className="text-muted-foreground">{currentCTF?.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`
                  ${selectedCategory === category
                    ? 'bg-neon-green text-cyber-dark shadow-neon'
                    : 'border-cyber-light hover:border-neon-green hover:text-neon-green'
                  }
                `}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-cyber-light border-muted focus:border-neon-green focus:ring-neon-green"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">
            No challenges found matching your criteria.
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeList;