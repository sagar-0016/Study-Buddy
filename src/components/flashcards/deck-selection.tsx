
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Search, BookOpen } from 'lucide-react';
import { getFlashcardDecks } from '@/lib/flashcards';
import type { FlashcardDeck } from '@/lib/types';
import { Input } from '@/components/ui/input';
import type { AccessLevel } from '@/context/auth-context';
import Icon from '@/components/ui/icon';


import { IS_MAINTENANCE } from '@/lib/config';

const DeckCard = ({ deck }: { deck: FlashcardDeck }) => {
  
  const getBadgeText = () => {
    const accessLevel = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? localStorage.getItem('study-buddy-access-level') as AccessLevel | null : null;
    
    if (deck.status === 'available') return 'Available';
    if (deck.status === 'not-available') {
      if (accessLevel === 'full') return 'Not for you babe';
      return 'Not for you';
    }
    return 'Coming Soon';
  };
  
  const getBadgeVariant = () => {
    if (deck.status === 'available') return 'default';
    if (deck.status === 'not-for-you') return 'destructive';
    return 'outline';
  }
  
  const isClickable = deck.status === 'available';
  const href = deck.status === 'not-for-you' ? '/flashcards/not-for-you' : `/flashcards/${deck.category}`;
  
  const cardContent = (
    <Card className={`flex flex-col h-full transition-all duration-300 ${isClickable ? 'hover:border-primary hover:-translate-y-1 hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}`}>
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-full ${deck.status === 'available' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
             <Icon name={deck.icon} className="w-8 h-8" />
          </div>
          <Badge variant={getBadgeVariant()}>
            {getBadgeText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex flex-col flex-grow">
        <CardTitle className="text-xl mb-2">{deck.title}</CardTitle>
        <CardDescription className="flex-grow">{deck.description}</CardDescription>
      </CardContent>
    </Card>
  );

  if (isClickable) {
    return <Link href={href}>{cardContent}</Link>;
  }
  return <div>{cardContent}</div>;
};

export default function DeckSelection() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDecks = async () => {
        try {
            setIsLoading(true);
            const fetchedDecks = await getFlashcardDecks('main');
            setDecks(fetchedDecks);
        } catch (err) {
            console.error(err);
            setError('Could not load flashcard decks. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    fetchDecks();
  }, []);

  const filteredDecks = useMemo(() => {
    if (!searchTerm) return decks;
    const lowercasedTerm = searchTerm.toLowerCase();
    return decks.filter(deck => 
      deck.title.toLowerCase().includes(lowercasedTerm) ||
      deck.description.toLowerCase().includes(lowercasedTerm)
    );
  }, [decks, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                  </div>
              ))}
          </div>
      );
    }

    if (error) {
      return (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-destructive/10 border-destructive">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-destructive-foreground">An Error Occurred</h3>
              <p className="text-destructive-foreground/80">{error}</p>
          </div>
      );
    }
    
    if (filteredDecks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[30vh]">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Decks Found</h3>
                <p className="text-muted-foreground">Try adjusting your search term.</p>
            </div>
        )
    }

    return (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredDecks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search for a subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        {renderContent()}
    </div>
  )
}
