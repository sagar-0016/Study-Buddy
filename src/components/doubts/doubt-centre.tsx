

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageSquare, Image as ImageIcon, CheckCircle, AlertCircle, HelpCircle, Send, Reply, ShieldCheck, MessageCircle as MessageCircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getDoubts, addDoubt, markDoubtAsCleared, getDoubtThread, addReplyToDoubt } from '@/lib/doubts';
import type { Doubt, DoubtMessage, AccessLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';


const AddDoubtDialog = ({ onDoubtAdded, children }: { onDoubtAdded: () => void, children: React.ReactNode }) => {
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const { pauseLocking } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSubmit = useMemo(() => text && subject, [text, subject]);

    const resetForm = () => {
        setText('');
        setSubject('');
        setImageFile(null);
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

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSaving(true);
        try {
            const accessLevel = localStorage.getItem('study-buddy-access-level') as AccessLevel || 'limited';
            await addDoubt({ text, subject, accessLevel, imageFile: imageFile || undefined });
            toast({ title: "Success!", description: "Your doubt has been submitted." });
            onDoubtAdded();
            setIsOpen(false);
            resetForm();
        } catch (error) {
             toast({ title: "Error", description: "Could not submit your doubt.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ask a New Doubt</DialogTitle>
                    <DialogDescription>
                        Clearly describe your question. It will appear in the Doubt Centre as a new thread.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select onValueChange={setSubject} value={subject}>
                            <SelectTrigger id="subject"><SelectValue placeholder="Select a subject" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Maths">Maths</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doubt-text">Your Question</Label>
                        <Textarea id="doubt-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Explain your doubt in detail here..." rows={5} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">Attach Image (Optional)</Label>
                        <Button variant="outline" onClick={triggerFileInput} className="w-full">
                            <ImageIcon className="mr-2 h-4 w-4" /> Choose Image
                        </Button>
                        <input ref={fileInputRef} id="image" type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden"/>
                         {imageFile && <p className="text-sm text-muted-foreground">Selected: {imageFile.name}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving || !canSubmit}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Doubt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DoubtThreadDialog = ({ doubt, onCleared, children }: { doubt: Doubt, onCleared: (doubtId: string, lectureId?: string) => void, children: React.ReactNode }) => {
    const [thread, setThread] = useState<DoubtMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { toast } = useToast();
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const fetchThread = useCallback(async () => {
        setIsLoading(true);
        const fetchedThread = await getDoubtThread(doubt.id, doubt.lectureId);
        setThread(fetchedThread);
        setIsLoading(false);
    }, [doubt.id, doubt.lectureId]);
    
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const handleReply = async () => {
        if (!replyText) return;
        setIsReplying(true);
        try {
            await addReplyToDoubt(doubt.id, doubt.lectureId, { text: replyText, sender: 'user' });
            setReplyText('');
            await fetchThread(); // Re-fetch the thread
        } catch (error) {
            toast({ title: 'Error', description: 'Could not send reply.', variant: 'destructive' });
        } finally {
            setIsReplying(false);
        }
    };
    
    return (
        <Dialog onOpenChange={(open) => {
            if (open) fetchThread();
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg md:max-w-2xl flex flex-col h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{doubt.text}</DialogTitle>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                        <span>Conversation about your doubt in {doubt.subject}.</span>
                         {doubt.lectureTitle && (
                           <div className="flex items-center gap-2">
                               <span>From lecture:</span>
                               <Badge variant="outline">{doubt.lectureTitle}</Badge>
                           </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {isLoading ? <Skeleton className="h-20 w-full" /> : (
                        thread.map(message => (
                             <div key={message.id} className={cn("flex items-end gap-3 text-sm", message.sender === 'user' ? "justify-end" : "justify-start")}>
                                {message.sender === 'admin' ? <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" /> : null}
                                <div className={cn("relative p-3 rounded-lg max-w-sm", message.sender === 'user' ? "bg-primary/10" : "bg-muted")}>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                    {message.mediaUrl && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button type="button" className="mt-2 rounded-lg overflow-hidden border w-full group relative">
                                                    <Image src={message.mediaUrl} alt="Doubt media" width={300} height={200} className="object-cover w-full" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl"><Image src={message.mediaUrl} alt="Doubt media" width={800} height={600} className="rounded-lg object-contain" /></DialogContent>
                                        </Dialog>
                                    )}
                                    <p className="text-xs text-muted-foreground/80 mt-2 text-right">{message.createdAt?.toDate ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'sending...'}</p>
                                
                                     {message.sender === 'user' && (
                                        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full overflow-hidden flex-shrink-0 -mr-8 -mb-1 border-2 border-background">
                                            <Image
                                                src="/avatar.png"
                                                width={24}
                                                height={24}
                                                alt="User Avatar"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
                
                <Separator />
                
                 <div className="relative">
                    <Textarea 
                        id={`reply-${doubt.id}`} 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)} 
                        placeholder="Type your reply..." 
                        rows={1}
                        className="pr-12 resize-none"
                        disabled={isReplying || doubt.isCleared} 
                    />
                    <Button 
                        onClick={handleReply} 
                        disabled={!replyText || isReplying || doubt.isCleared} 
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                        {isReplying ? <Loader2 className="h-4 w-4 animate-spin"/> : <Reply className="h-4 w-4"/>}
                        <span className="sr-only">Send Reply</span>
                    </Button>
                </div>


                {doubt.isAddressed && !doubt.isCleared && (
                    <DialogFooter className='border-t pt-4'>
                        <Button onClick={() => onCleared(doubt.id, doubt.lectureId)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Cleared
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

const DoubtCard = ({ doubt, onCleared }: { doubt: Doubt, onCleared: (doubtId: string, lectureId?: string) => void }) => {
    const getStatus = () => {
        if (doubt.isCleared) return { text: 'Cleared by you', icon: CheckCircle, color: 'text-green-600' };
        if (doubt.isAddressed) return { text: 'Admin Replied', icon: AlertCircle, color: 'text-yellow-600' };
        return { text: 'Pending', icon: HelpCircle, color: 'text-muted-foreground' };
    };

    const { text, icon: Icon, color } = getStatus();

    return (
        <DoubtThreadDialog doubt={doubt} onCleared={onCleared}>
            <Card className="cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className='space-y-1.5'>
                            <p className='font-semibold line-clamp-2'>{doubt.text}</p>
                            <CardDescription>
                                {doubt.lastReply?.timestamp ? `Last reply ${formatDistanceToNow(doubt.lastReply.timestamp.toDate(), { addSuffix: true })}` : `Created ${formatDistanceToNow(doubt.createdAt.toDate(), { addSuffix: true })}`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge variant={doubt.subject === 'Physics' ? 'default' : doubt.subject === 'Chemistry' ? 'destructive' : 'secondary'}>
                                {doubt.subject}
                            </Badge>
                            <Badge variant={doubt.isCleared ? 'default' : doubt.isAddressed ? 'outline' : 'secondary'} className="flex items-center gap-1">
                                <Icon className={cn("h-3 w-3", color)} />
                                {text}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </DoubtThreadDialog>
    )
}

export default function DoubtCentre() {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDoubts = useCallback(async () => {
        setIsLoading(true);
        const accessLevel = localStorage.getItem('study-buddy-access-level') as AccessLevel | null || 'limited';
        const fetchedDoubts = await getDoubts(accessLevel);
        setDoubts(fetchedDoubts);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchDoubts();
    }, [fetchDoubts]);
    
    const handleMarkCleared = async (doubtId: string, lectureId?: string) => {
        try {
            await markDoubtAsCleared(doubtId, lectureId);
            fetchDoubts(); // Re-fetch all doubts to ensure UI is consistent
            toast({ title: 'Success', description: 'Doubt thread marked as cleared.' });
        } catch(error) {
            toast({ title: 'Error', description: 'Could not update the doubt status.', variant: 'destructive' });
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }

        if (doubts.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
                    <MessageCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Doubts Here</h3>
                    <p className="text-muted-foreground">Looks like you're all clear! Ask a new question to get started.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                {doubts.map(doubt => (
                    <DoubtCard key={doubt.id} doubt={doubt} onCleared={handleMarkCleared} />
                ))}
            </div>
        )
    }

    return (
         <div className="relative pb-24">
             {renderContent()}
            <div className="fixed bottom-8 right-8 z-50">
               <AddDoubtDialog onDoubtAdded={fetchDoubts}>
                    <Button className="rounded-full h-14 w-14 p-4 shadow-lg flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                        <span className="sr-only">Ask a new doubt</span>
                    </Button>
               </AddDoubtDialog>
           </div>
        </div>
    );
}
