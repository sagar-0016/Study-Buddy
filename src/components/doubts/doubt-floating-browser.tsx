
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FloatingBrowserProps {
  url: string | null;
  onClose: () => void;
}

export default function DoubtFloatingBrowser({ url, onClose }: FloatingBrowserProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (url) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                if (isLoading) {
                     toast({
                        title: "Content may be blocked",
                        description: "If the window remains blank, the external site may be preventing it from being embedded. Try opening it in a new tab.",
                        variant: "destructive",
                        duration: 8000,
                    });
                }
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [url, isLoading, toast]);


    if (!url) return null;

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const isPdf = url.endsWith('.pdf') || url.includes('.pdf?');
    const displayUrl = isPdf ? `/api/proxy-pdf?url=${encodeURIComponent(url)}` : url;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in-25" onClick={onClose}>
            <div
                className="relative z-[101] bg-card border shadow-2xl rounded-lg flex flex-col w-full max-w-4xl h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-1 border-b bg-muted/50 rounded-t-lg">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Open in new tab</span>
                        </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-grow overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p>Loading content...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={displayUrl}
                        title="Floating Content"
                        onLoad={handleIframeLoad}
                        className={cn("w-full h-full border-0", isLoading && "opacity-0")}
                    />
                </div>
            </div>
        </div>
    );
}
