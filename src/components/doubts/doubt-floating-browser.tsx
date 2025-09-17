

"use client";

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DraggableResizableDivProps {
  children: React.ReactNode;
  onClose: () => void;
  url: string;
}

const DraggableResizableDiv = ({ children, onClose, url }: DraggableResizableDivProps) => {
    const [position, setPosition] = useState(() => {
        if (typeof window !== 'undefined') {
            const width = 800;
            const height = 600;
            const x = (window.innerWidth - width) / 2;
            const y = (window.innerHeight - height) / 2;
            return { x: Math.max(x, 0), y: Math.max(y, 0) };
        }
        return { x: 50, y: 50 };
    });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartPos = useRef({ x: 0, y: 0 });
    const initialSize = useRef({ width: 0, height: 0 });

    const handleDragStart = (e: ReactMouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains('drag-handle')) {
            setIsDragging(true);
            dragStartPos.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        }
    };

    const handleResizeStart = (e: ReactMouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartPos.current = { x: e.clientX, y: e.clientY };
        initialSize.current = size;
        document.body.style.cursor = 'se-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartPos.current.x,
                    y: e.clientY - dragStartPos.current.y,
                });
            }
            if (isResizing) {
                const dx = e.clientX - resizeStartPos.current.x;
                const dy = e.clientY - resizeStartPos.current.y;
                setSize({
                    width: Math.max(400, initialSize.current.width + dx),
                    height: Math.max(300, initialSize.current.height + dy),
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, isResizing]);

    return (
        <div
            className="fixed z-[100] bg-card border shadow-2xl rounded-lg flex flex-col"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the window
        >
            <div onMouseDown={handleDragStart} className="drag-handle flex items-center justify-between p-1 border-b cursor-grab bg-muted/50 rounded-t-lg">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <a href={url} target="_blank" rel="noopener noreferrer" onMouseDown={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open in new tab</span>
                    </a>
                </Button>
                <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-grow overflow-hidden">
                {children}
            </div>
            <div
                onMouseDown={handleResizeStart}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            />
        </div>
    );
};


interface FloatingBrowserProps {
  url: string;
  onClose: () => void;
}

export default function DoubtFloatingBrowser({ url, onClose }: FloatingBrowserProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const handleIframeLoad = () => {
        setIsLoading(false);
    };
    
    useEffect(() => {
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
    }, [isLoading, toast]);

    const isPdf = url.endsWith('.pdf') || url.includes('.pdf?');
    const displayUrl = isPdf ? `/api/proxy-pdf?url=${encodeURIComponent(url)}` : url;

    return (
        <div className="fixed inset-0 bg-black/30 z-[99] backdrop-blur-sm" onClick={onClose}>
            <DraggableResizableDiv onClose={onClose} url={url}>
                <div className="relative w-full h-full">
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
            </DraggableResizableDiv>
        </div>
    );
}
