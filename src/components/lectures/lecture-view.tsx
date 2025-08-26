
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lecture, LectureNote } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { addDoubt } from '@/lib/doubts';
import { uploadLectureNote, getLectureNotes, deleteLectureNote } from '@/lib/lectures';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Star, FileText, Upload, Link as LinkIcon, Info, Image as ImageIcon, MessageCircleQuestion, MessageSquarePlus, Trash2, Notebook, AlertCircle, View, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CustomVideoPlayer from './custom-video-player';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useClassMode } from '@/context/class-mode-context';
import { cn } from '@/lib/utils';

const DoubtSection = ({ lecture }: { lecture: Lecture }) => {
    const [doubtText, setDoubtText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmitDoubt = async () => {
        if (!doubtText) return;
        setIsSubmitting(true);
        try {
            const fullText = `Regarding the lecture "${lecture.title}":\n\n${doubtText}`;
            await addDoubt({ text: fullText, subject: lecture.subject });
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

const NotesSection = ({ lecture, isClassMode }: { lecture: Lecture, isClassMode: boolean }) => {
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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
            if (note.type === 'pdf') {
                 toast({title: "Please use the 'Notes' button on the video player to view this PDF."})
            } else {
                window.open(note.url, '_blank', 'noopener,noreferrer');
            }
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

    return (
        <Card className="h-full">
            <CardContent className="p-4">
                <div className="space-y-6">
                    <div>
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

const ResizablePanel = ({ children, initialWidth, onResize }: { children: React.ReactNode, initialWidth: number, onResize: (width: number) => void }) => {
    const [width, setWidth] = useState(initialWidth);
    const isResizing = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);
  
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
    }, []);
  
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current || !panelRef.current?.parentElement) return;

            const newWidth = panelRef.current.parentElement.getBoundingClientRect().right - e.clientX;
            const boundedWidth = Math.max(300, Math.min(newWidth, panelRef.current.parentElement.clientWidth - 400));
            setWidth(boundedWidth);
            onResize(boundedWidth);
        };

        const handleMouseUp = () => {
            isResizing.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onResize]);
  
    return (
      <div ref={panelRef} className="relative h-full" style={{ flexBasis: `${width}px`, flexShrink: 0, flexGrow: 0 }}>
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-2 cursor-col-resize z-10 bg-muted/50 hover:bg-accent transition-colors"
        />
        {children}
      </div>
    );
  };


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
        // This effect should only run when the component mounts and unmounts
        // to handle the class mode state correctly when navigating away.
        return () => {
            if (isClassMode) {
                toggleClassMode();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lecture.id]);

    return (
        <div className="relative min-h-screen">
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
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p>{lecture.description}</p>
                                    </div>
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
                    <ResizablePanel initialWidth={400} onResize={setRightPanelWidth}>
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
