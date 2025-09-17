

'use client';

import { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import type { Lecture, LectureNote, AccessLevel } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { addDoubt } from '@/lib/doubts';
import { uploadLectureNote, getLectureNotes, deleteLectureNote, addLectureFeedback } from '@/lib/lectures';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Star, FileText, Upload, Link as LinkIcon, Info, Image as ImageIcon, MessageCircleQuestion, MessageSquarePlus, Trash2, Notebook, AlertCircle, View, X, Minus, Plus, ArrowLeft, ArrowRight, Maximize, ZoomIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CustomVideoPlayer from './custom-video-player';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useClassMode } from '@/context/class-mode-context';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import FloatingBrowser from '../shared/floating-browser';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DoubtSection = ({ lecture }: { lecture: Lecture }) => {
    const [doubtText, setDoubtText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmitDoubt = async () => {
        if (!doubtText) return;
        setIsSubmitting(true);
        try {
            const accessLevel = localStorage.getItem('study-buddy-access-level') as AccessLevel || 'limited';
            await addDoubt({
                lectureId: lecture.id,
                lectureTitle: lecture.title,
                text: doubtText,
                subject: lecture.subject,
                accessLevel: accessLevel,
            });
            toast({ title: "Success", description: "Your doubt has been submitted." });
            setDoubtText('');
        } catch (error) {
            toast({ title: "Error", description: "Could not submit your doubt.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Have a Doubt?</h3>
            <p className="text-sm text-muted-foreground">
                Confused about a concept in this lecture? Ask your question here, and it will appear in the Doubt Centre.
            </p>
            <div className="space-y-2">
                <Label htmlFor="doubt-textarea">Your Question</Label>
                <Textarea 
                    id="doubt-textarea"
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    placeholder={`e.g., At 5:32, why is the force of friction acting upwards?`}
                    rows={4}
                />
            </div>
            <Button onClick={handleSubmitDoubt} disabled={isSubmitting || !doubtText}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Doubt
            </Button>
        </div>
    )
}

const FeedbackDialog = ({ lecture }: { lecture: Lecture }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [ratedLectures, setRatedLectures] = useLocalStorage<string[]>('rated-lectures', []);

    const hasRated = ratedLectures.includes(lecture.id);

    const handleSubmitFeedback = async () => {
        if (!feedbackText || (!hasRated && rating === 0)) {
            toast({ title: "Incomplete", description: "Please provide a rating (if it's your first time) and some feedback text.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await addLectureFeedback(lecture.id, { rating: hasRated ? 0 : rating, text: feedbackText });
            toast({ title: "Thank you!", description: "Your feedback has been submitted." });
            
            if (!hasRated) {
                setRatedLectures([...ratedLectures, lecture.id]);
            }
            
            setFeedbackText('');
            setRating(0);
            setIsOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Could not submit your feedback.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="shadow-lg rounded-full">
                    <Star className="mr-2 h-4 w-4"/> Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Lecture Feedback</DialogTitle>
                    <DialogDescription>
                        {hasRated ? "Share additional thoughts on this lecture." : "How would you rate this lecture? Your feedback helps."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {!hasRated && (
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)}>
                                    <Star className={`h-8 w-8 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="feedback-textarea">Your Feedback</Label>
                        <Textarea 
                            id="feedback-textarea"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder={hasRated ? "Add another comment..." : "What did you like or dislike?"}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitFeedback} disabled={isSubmitting || !feedbackText || (!hasRated && rating === 0)}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const EmbeddedPdfViewer = ({ url, onBack }: { url: string; onBack: () => void; }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(0.9);
    const [fitMode, setFitMode] = useState<'width' | 'zoom'>('width');
    const containerRef = useRef<HTMLDivElement>(null);
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
    
    const containerWidth = containerRef.current?.clientWidth;

    return (
        <div className="flex flex-col h-full bg-background">
             <div className="flex-shrink-0 sticky top-0 z-10 p-1 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium">Page {pageNumber} of {numPages || '...'}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPageNumber(p => Math.min(p + 1, numPages || 1))} disabled={!numPages || pageNumber >= numPages}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} disabled={scale <= 0.5 || fitMode === 'width'}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium">{fitMode === 'width' ? 'Fit' : `${Math.round(scale * 100)}%`}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.min(s + 0.2, 3))} disabled={scale >= 3 || fitMode === 'width'}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFitMode(m => m === 'width' ? 'zoom' : 'width')}>
                        {fitMode === 'width' ? <ZoomIn className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <div ref={containerRef} className="flex-grow bg-muted/20 overflow-auto">
                <div className={cn("flex justify-center", fitMode === 'zoom' && "h-full")}>
                    <div className={cn(fitMode === 'zoom' && "overflow-auto")}>
                        <Document
                            file={proxiedUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<Skeleton className='h-full w-full'/>}
                            className="flex justify-center"
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={fitMode === 'width' ? 1 : scale}
                                width={fitMode === 'width' && containerWidth ? containerWidth - 20 : undefined}
                                renderTextLayer={true} 
                            />
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    )
}

const NotesSection = ({ lecture, isClassMode }: { lecture: Lecture, isClassMode: boolean }) => {
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [viewingUrl, setViewingUrl] = useState<string | null>(null);
    const { pauseLocking } = useAuth();

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        const fetchedNotes = await getLectureNotes(lecture.id);
        setNotes(fetchedNotes);
        setIsLoading(false);
    }, [lecture.id]);
    
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
            return;
        }
        
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
           await uploadLectureNote(lecture.id, lecture.title, file, (progress) => setUploadProgress(progress));
           
           toast({ title: "Success", description: "Your note has been uploaded." });
           await fetchNotes();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not upload your note.";
            toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const triggerFileInput = () => {
        toast({
            title: "File Upload",
            description: "The app will lock in 10 seconds. Please select your file.",
            duration: 10000,
        });
        pauseLocking(10000); // Pause for 10 seconds
        fileInputRef.current?.click();
    }
    
    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm("Are you sure you want to delete this note? This cannot be undone.")) {
            return;
        }

        try {
            await deleteLectureNote(lecture.id, noteId);
            toast({ title: "Note Deleted", description: "The note has been removed successfully." });
            fetchNotes();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete the note.", variant: "destructive" });
        }
    };

    const NoteItem = ({ note }: { note: LectureNote }) => {
        const isUserUploaded = !note.name.startsWith("Sample");

        const handleClick = () => {
            setViewingUrl(note.url);
        };

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleClick}
                    className="flex w-full items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left flex-grow"
                >
                    {note.type === 'pdf' ? <FileText className="h-5 w-5 text-primary flex-shrink-0" /> : <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />}
                    <span className="font-medium text-sm truncate">{note.name}</span>
                </button>
                {!isClassMode && isUserUploaded && (
                     <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                )}
            </div>
        );
    };

    if (viewingUrl) {
        return <FloatingBrowser url={viewingUrl} onClose={() => setViewingUrl(null)} />
    }

    return (
        <Card className={cn("h-full", isClassMode && "border-0 shadow-none rounded-none")}>
            <CardContent className="p-4 h-full flex flex-col">
                <div className="space-y-6 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <h3 className="text-lg font-semibold">Lecture Notes</h3>
                        <p className="text-sm text-muted-foreground">Official notes and resources for this lecture.</p>
                        {isLoading ? (
                            <div className="mt-4 space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : notes.length > 0 ? (
                            <div className="mt-4 space-y-2">
                                {notes.map(note => (
                                    <NoteItem key={note.id} note={note} />
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-muted-foreground italic">No official notes available for this lecture.</p>
                        )}
                    </div>

                    {!isClassMode && (
                         <div className="pt-6 border-t">
                            <h3 className="text-lg font-semibold">Your Notes</h3>
                            <p className="text-sm text-muted-foreground">Upload your own PDF notes for this lecture.</p>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" onClick={triggerFileInput} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    {isUploading ? `Uploading... (${Math.round(uploadProgress)}%)` : 'Upload PDF'}
                                </Button>
                                <input 
                                    id="pdf-upload" 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="sr-only" 
                                    accept=".pdf" 
                                    onChange={handleFileUpload} 
                                    disabled={isUploading}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

const ResizablePanel = ({ children, width, setWidth }: { children: React.ReactNode, width: number, setWidth: (width: number) => void }) => {
    const isResizing = useRef(false);

    const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            // Correct logic: new width is based on mouse distance from right of screen
            const newWidth = window.innerWidth - e.clientX; 
            const boundedWidth = Math.max(300, Math.min(newWidth, window.innerWidth - 400));
            setWidth(boundedWidth);
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [setWidth]);

    return (
        <div className="relative h-full" style={{ width: `${width}px`, flexShrink: 0 }}>
            <div
                onMouseDown={handleMouseDown}
                className="absolute left-0 top-0 h-full w-2 cursor-col-resize z-10 bg-muted/50 hover:bg-accent transition-colors"
            />
            <div className="h-full bg-card ml-2">
                {children}
            </div>
        </div>
    );
};

const DescriptionSection = ({ lecture }: { lecture: Lecture }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <div className={cn("prose prose-sm dark:prose-invert max-w-none", !isExpanded && "line-clamp-2")}>
                <p className="whitespace-pre-wrap">{lecture.description}</p>
            </div>
            {lecture.description.split('\n').length > 2 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm font-semibold text-primary hover:underline mt-2"
                >
                    {isExpanded ? 'Show less' : 'Show more'}
                </button>
            )}
             {lecture.createdAt && (
                <p className="text-xs text-muted-foreground mt-3">
                    Uploaded on {format(new Date(lecture.createdAt), "MMMM d, yyyy")}
                </p>
            )}
        </div>
    )
}

export default function LectureView({ lecture }: { lecture: Lecture }) {
    const { isClassMode, toggleClassMode } = useClassMode();
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [rightPanelWidth, setRightPanelWidth] = useState(400);

    const fetchNotes = useCallback(async () => {
        setIsLoadingNotes(true);
        const fetchedNotes = await getLectureNotes(lecture.id);
        setNotes(fetchedNotes);
        setIsLoadingNotes(false);
    }, [lecture.id]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes, lecture.id]);

    useEffect(() => {
        // This effect is now tied to isClassMode state.
        // It runs a cleanup function ONLY when the component unmounts.
        return () => {
            // When leaving the lecture page, ensure class mode is turned off.
            if (isClassMode) {
                toggleClassMode();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only on mount and unmount.

    return (
        <div className="relative">
             <div className="mb-4 flex justify-end">
                <Button variant="outline" onClick={toggleClassMode}>
                    {isClassMode ? <X className="mr-2"/> : <View className="mr-2"/>}
                    {isClassMode ? 'Exit' : 'Enter'} Class Mode
                </Button>
            </div>
            
            <div className={cn("mt-2", isClassMode && "flex gap-2 h-[calc(100vh-200px)]")}>
                
                <div className={cn("space-y-6", isClassMode ? "flex-1 flex flex-col" : "lg:grid lg:grid-cols-3 lg:gap-6")}>
                    <div className={cn(isClassMode ? "flex-1" : "lg:col-span-2")}>
                        <Card className={cn("overflow-hidden", isClassMode ? "h-full border-0 shadow-none" : "")}>
                            {isLoadingNotes ? (
                                <Skeleton className="w-full aspect-video" />
                            ) : (
                                <CustomVideoPlayer 
                                    src={lecture.videoUrl}
                                    sdSrc={lecture.sdVideoUrl}
                                    poster={lecture.thumbnailUrl}
                                    notes={notes}
                                />
                            )}
                        </Card>
                    </div>

                    {!isClassMode && (
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{lecture.title}</CardTitle>
                                    <CardDescription>{lecture.channel} • {lecture.subject}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DescriptionSection lecture={lecture} />
                                </CardContent>
                            </Card>
                            
                             <Card>
                                <CardHeader>
                                    <CardTitle>Have a Doubt?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DoubtSection lecture={lecture} />
                                </CardContent>
                            </Card>

                            <Card className="sticky top-20">
                                <CardContent className="p-4">
                                    <NotesSection lecture={lecture} isClassMode={isClassMode} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {isClassMode && (
                    <ResizablePanel width={rightPanelWidth} setWidth={setRightPanelWidth}>
                        <NotesSection lecture={lecture} isClassMode={isClassMode} />
                    </ResizablePanel>
                )}
            </div>

            {!isClassMode && (
                <div className="fixed bottom-8 right-8 z-50">
                    <FeedbackDialog lecture={lecture} />
                </div>
            )}
        </div>
    )
}

    