
"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Notebook, FileText, Link as LinkIcon, X, CornerDownRight, ArrowRightFromLine, ArrowDownFromLine, Loader2, Minus, Plus, ArrowLeft, ArrowRight, Hourglass, History
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { 
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Lecture, LectureNote, LectureVideo } from '@/lib/types';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { updateVideoProgress } from '@/lib/lectures';
import { useInterval } from '@/hooks/use-interval';


// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface CustomVideoPlayerProps {
    lecture: LectureVideo;
    notes: LectureNote[];
}

type Quality = 'hd' | 'sd';
type SidebarPosition = 'right' | 'bottom';

const PdfViewer = ({ url, onClose }: { url: string, onClose: () => void }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5);
    const { toast } = useToast();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function onDocumentLoadError(error: Error) {
        toast({
            title: "PDF Load Error",
            description: `Failed to load PDF: ${error.message}`,
            variant: "destructive",
        })
        console.error('Error while loading document!', error);
    }
    
    const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;

    return (
        <div className="flex flex-col h-full bg-background">
             <div className="flex-shrink-0 sticky top-0 z-10 p-1 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium">Page {pageNumber} of {numPages || '...'}</span>
                    <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.min(p + 1, numPages || 1))} disabled={!numPages || pageNumber >= numPages}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                     <div className="w-px h-6 bg-border mx-1"></div>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} disabled={scale <= 0.5}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(s + 0.2, 3))} disabled={scale >= 3}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex-grow p-4 flex justify-center bg-muted/20 overflow-auto">
                <Document
                    file={proxiedUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<Skeleton className='h-full w-full'/>}
                    className="flex justify-center"
                >
                    <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} />
                </Document>
            </div>
        </div>
    )
}

const NotesSidebar = ({ 
    notes, 
    position, 
    size, 
    onClose, 
    onPositionChange, 
    onResizeStart,
}: {
    notes: LectureNote[],
    position: SidebarPosition,
    size: number,
    onClose: () => void,
    onPositionChange: (pos: SidebarPosition) => void,
    onResizeStart: (e: MouseEvent<HTMLButtonElement>) => void,
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [viewingPdf, setViewingPdf] = useState<string | null>(null);

    const handleSelectNote = (note: LectureNote) => {
        if (note.type === 'pdf') {
            setViewingPdf(note.url);
        } else {
            window.open(note.url, '_blank', 'noopener,noreferrer');
        }
    };
    
    const renderContent = () => {
        if (viewingPdf) {
            return <PdfViewer url={viewingPdf} onClose={() => setViewingPdf(null)} />;
        }

        return (
            <>
                <div className="flex items-center justify-between p-1 border-b border-border text-xs">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onPositionChange('right')}>
                            <ArrowRightFromLine className={cn("h-4 w-4", position === 'right' && "text-primary")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onPositionChange('bottom')}>
                            <ArrowDownFromLine className={cn("h-4 w-4", position === 'bottom' && "text-primary")} />
                        </Button>
                    </div>
                    <span className="font-semibold">Notes</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-2">
                    {notes.map(note => (
                        <button
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className="flex w-full items-center gap-3 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                            {note.type === 'pdf' ? <FileText className="h-5 w-5 text-primary flex-shrink-0" /> : <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />}
                            <span className="font-medium text-sm truncate">{note.name}</span>
                        </button>
                    ))}
                </div>
                <button
                    onMouseDown={onResizeStart}
                    className={cn(
                        "absolute bg-muted hover:bg-accent transition-colors z-10",
                        position === 'right' ? "top-0 left-0 h-full w-1.5 cursor-ew-resize" : "top-0 left-0 w-full h-1.5 cursor-ns-resize"
                    )}
                />
            </>
        )
    }

    return (
        <div
            ref={sidebarRef}
            className={cn(
                "absolute z-20 bg-background/90 backdrop-blur-sm flex flex-col text-foreground overflow-hidden",
                position === 'right' ? 'top-0 right-0 h-full' : 'bottom-0 left-0 w-full'
            )}
            style={{
                width: position === 'right' ? `${size}px` : '100%',
                height: position === 'bottom' ? `${size}px` : '100%'
            }}
        >
           {renderContent()}
        </div>
    );
};

export default function CustomVideoPlayer({ lecture, notes }: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<number>(lecture.lastWatchedPosition || 0); // Start from last watched position
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [quality, setQuality] = useState<Quality>('hd');
    
    // States for the notes sidebar
    const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
    const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('right');
    const [sidebarSize, setSidebarSize] = useState(400);

    // State for resizing logic
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartPos = useRef(0);
    const initialSize = useRef(0);

    const { toast } = useToast();

    // Automatic progress saving every 10 seconds
    useInterval(() => {
        if (isPlaying && videoRef.current) {
            updateVideoProgress(lecture.id, { lastWatchedPosition: videoRef.current.currentTime });
        }
    }, 10000);

    let controlsTimeout: NodeJS.Timeout;

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handlePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
                // Also save progress on pause
                updateVideoProgress(lecture.id, { lastWatchedPosition: videoRef.current.currentTime });
            }
        }
    }, [lecture.id]);
    
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressChange = (value: number[]) => {
        if (videoRef.current) {
            const newTime = (value[0] / 100) * duration;
            videoRef.current.currentTime = newTime;
        }
    };
    
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setProgress((videoRef.current.currentTime / duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            // Set the start time from the last watched position
            if (timeRef.current > 0 && timeRef.current < videoRef.current.duration) {
                videoRef.current.currentTime = timeRef.current;
            }
        }
    };

    const handlePlaybackRateChange = (newRate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = newRate;
            setPlaybackRate(newRate);
        }
    };

    const handleQualityChange = (newQuality: Quality) => {
        if (videoRef.current && quality !== newQuality) {
            timeRef.current = videoRef.current.currentTime;
            setQuality(newQuality);
        }
    };

    const toggleFullscreen = useCallback(() => {
        if (!playerRef.current) return;

        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    const handleSeek = useCallback((amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
        }
    }, []);

    const handleTakeBreak = async () => {
        if (videoRef.current) {
            const breakTime = videoRef.current.currentTime;
            await updateVideoProgress(lecture.id, { breakPosition: breakTime });
            toast({
                title: "Break Point Saved",
                description: `Your position at ${formatTime(breakTime)} has been saved.`,
            });
            // Refetch lecture data to update the state in the parent might be needed
            // or just update local state if possible
        }
    };

    const handleResumeFromBreak = () => {
        if (videoRef.current && lecture.breakPosition) {
            videoRef.current.currentTime = lecture.breakPosition;
            toast({
                title: "Resumed from Break",
                description: `Jumped to your saved break point.`,
            });
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                handlePlayPause();
                break;
            case 'm':
                toggleMute();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'ArrowRight':
                handleSeek(5);
                break;
            case 'ArrowLeft':
                handleSeek(-5);
                break;
        }
    }, [handlePlayPause, toggleFullscreen, handleSeek]);

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying && !isNotesSidebarOpen) {
                 setShowControls(false);
            }
        }, 3000);
    };

    const handleResizeStart = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        resizeStartPos.current = sidebarPosition === 'right' ? e.clientX : e.clientY;
        initialSize.current = sidebarSize;
        document.body.style.cursor = sidebarPosition === 'right' ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
            if (!isResizing || !playerRef.current) return;
            
            let newSize;
            if (sidebarPosition === 'right') {
                const delta = e.clientX - resizeStartPos.current;
                newSize = initialSize.current - delta;
            } else { // bottom
                const delta = e.clientY - resizeStartPos.current;
                newSize = initialSize.current - delta;
            }

            const playerBounds = playerRef.current.getBoundingClientRect();
            
            const maxSize = sidebarPosition === 'right' ? playerBounds.width - 200 : playerBounds.height - 150;
            const minSize = 200;
            setSidebarSize(Math.max(minSize, Math.min(newSize, maxSize)));
        };

        const handleGlobalMouseUp = () => {
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
    }, [isResizing, sidebarPosition]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        
        const playHandler = () => setIsPlaying(true);
        const pauseHandler = () => setIsPlaying(false);
        const endedHandler = () => setIsPlaying(false);
        
        video.addEventListener('play', playHandler);
        video.addEventListener('pause', pauseHandler);
        video.addEventListener('ended', endedHandler);
        
        const player = playerRef.current;
        if (player) {
            const fullscreenChangeHandler = () => {
                const isFs = !!document.fullscreenElement;
                setIsFullscreen(isFs);
                if (!isFs) {
                    setIsNotesSidebarOpen(false); // Close sidebar on exiting fullscreen
                }
            }
            document.addEventListener('fullscreenchange', fullscreenChangeHandler);
            player.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
                player.removeEventListener('keydown', handleKeyDown);
            };
        }

        return () => {
            video.removeEventListener('play', playHandler);
            video.removeEventListener('pause', pauseHandler);
            video.removeEventListener('ended', endedHandler);
        }
    }, [handleKeyDown]);

    const activeSrc = quality === 'hd' && lecture.videoUrl ? lecture.videoUrl : lecture.sdVideoUrl || lecture.videoUrl;

    return (
        <div ref={playerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group" onMouseMove={handleMouseMove}>
            <video
                key={activeSrc}
                ref={videoRef}
                src={activeSrc}
                poster={lecture.thumbnailUrl}
                className="w-full h-full"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onClick={handlePlayPause}
                onDoubleClick={toggleFullscreen}
                autoPlay={isPlaying}
            >
                Your browser does not support the video tag.
            </video>

            <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity", 
                isPlaying ? 'opacity-0' : 'opacity-100 bg-black/30'
            )}>
                 <Button variant="ghost" size="icon" className="h-20 w-20 rounded-full" onClick={handlePlayPause}>
                    <Play className="h-10 w-10 text-white" />
                </Button>
            </div>
            
             <div className={cn("absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 z-10", showControls ? 'opacity-100' : 'opacity-0')}>
                <div className="flex justify-end items-center gap-2">
                     {lecture.breakPosition && lecture.breakPosition > 0 && (
                        <Button variant="ghost" size="sm" className="text-white bg-black/30 hover:bg-white/20 hover:text-white" onClick={handleResumeFromBreak}>
                            <History className="mr-2 h-4 w-4" />
                            Resume from Break
                        </Button>
                     )}
                     <Button variant="ghost" size="sm" className="text-white bg-black/30 hover:bg-white/20 hover:text-white" onClick={handleTakeBreak}>
                        <Hourglass className="mr-2 h-4 w-4" />
                        Take a Break
                    </Button>
                     {isFullscreen && (
                         <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setIsNotesSidebarOpen(prev => !prev)}>
                            <Notebook className="mr-2 h-4 w-4" />
                            Notes
                        </Button>
                     )}
                </div>
            </div>
            
            {isFullscreen && isNotesSidebarOpen && (
                <NotesSidebar
                    notes={notes}
                    position={sidebarPosition}
                    size={sidebarSize}
                    onClose={() => setIsNotesSidebarOpen(false)}
                    onPositionChange={setSidebarPosition}
                    onResizeStart={handleResizeStart}
                />
            )}

            <div className={cn("absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300", 
                 showControls ? 'opacity-100' : 'opacity-0'
            )}>
                <div className="flex items-center gap-2 sm:gap-4 text-white">
                    <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => handleSeek(-10)}>
                        <SkipBack className="h-5 w-5" />
                    </Button>

                     <Button variant="ghost" size="icon" onClick={() => handleSeek(10)}>
                        <SkipForward className="h-5 w-5" />
                    </Button>
                    
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                           {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                    </div>

                    <span className="text-sm font-mono">{formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}</span>

                    <div className="flex-grow mx-2 sm:mx-4">
                        <Slider
                            value={[progress]}
                            onValueChange={handleProgressChange}
                            max={100}
                            step={0.1}
                            className="w-full"
                        />
                    </div>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="font-mono w-20">{playbackRate.toFixed(1)}x</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" side="top" align="center">
                             <Slider
                                value={[playbackRate]}
                                onValueChange={(value) => handlePlaybackRateChange(value[0])}
                                min={0.1}
                                max={4}
                                step={0.1}
                            />
                        </PopoverContent>
                    </Popover>

                     {lecture.sdVideoUrl && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuPortal container={playerRef.current ?? undefined}>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={quality} onValueChange={(q) => handleQualityChange(q as Quality)}>
                                        <DropdownMenuRadioItem value="hd">HD (1080p)</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="sd">SD (480p)</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenuPortal>
                        </DropdownMenu>
                    )}

                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

    
