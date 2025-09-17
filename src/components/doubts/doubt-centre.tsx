

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageSquare, Image as ImageIcon, CheckCircle, AlertCircle, HelpCircle, Send, ChevronsUpDown, MessageSquareText, Reply, ArrowDown, User, ShieldCheck } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

const DoubtThread = ({ doubt, onCleared }: { doubt: Doubt, onCleared: (doubtId: string) => void }) => {
    const [thread, setThread] = useState<DoubtMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { toast } = useToast();
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const fetchThread = async () => {
            const fetchedThread = await getDoubtThread(doubt.id);
            setThread(fetchedThread);
            setIsLoading(false);
        };
        fetchThread();
    }, [doubt.id]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const handleReply = async () => {
        if (!replyText) return;
        setIsReplying(true);
        try {
            await addReplyToDoubt(doubt.id, { text: replyText, sender: 'user' });
            setReplyText('');
            const updatedThread = await getDoubtThread(doubt.id);
            setThread(updatedThread);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not send reply.', variant: 'destructive' });
        } finally {
            setIsReplying(false);
        }
    };

    const getStatus = () => {
        if (doubt.isCleared) return { text: 'Cleared by you', icon: CheckCircle, color: 'text-green-600' };
        if (doubt.isAddressed) return { text: 'Admin Replied', icon: AlertCircle, color: 'text-yellow-600' };
        return { text: 'Pending', icon: HelpCircle, color: 'text-muted-foreground' };
    };

    const { text, icon: Icon, color } = getStatus();

    return (
        <Card className="flex flex-col">
            <Collapsible defaultOpen={true}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 rounded-t-lg">
                        <div className="flex justify-between items-start gap-4">
                            <div className='space-y-1.5'>
                                <p className='font-semibold'>{doubt.text}</p>
                                <CardDescription>
                                    Last message {doubt.lastMessage?.timestamp ? formatDistanceToNow(doubt.lastMessage.timestamp.toDate(), { addSuffix: true }) : 'just now'}
                                </CardDescription>
                                 {doubt.lectureTitle && <Badge variant="outline">From: {doubt.lectureTitle}</Badge>}
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Badge variant={doubt.subject === 'Physics' ? 'default' : doubt.subject === 'Chemistry' ? 'destructive' : 'secondary'}>
                                    {doubt.subject}
                                </Badge>
                                <Badge variant={doubt.isCleared ? 'default' : doubt.isAddressed ? 'outline' : 'secondary'} className="flex items-center gap-1">
                                    <Icon className={cn("h-3 w-3", color)} />
                                    {text}
                                </Badge>
                                <div className="flex items-center text-muted-foreground">
                                    <ChevronsUpDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-4 max-h-[500px] overflow-y-auto">
                        {isLoading ? <Skeleton className="h-20 w-full" /> : (
                            thread.map(message => (
                                <div key={message.id} className={cn("flex gap-3", message.sender === 'user' ? "justify-start" : "justify-end")}>
                                    {message.sender === 'user' ? <User className="h-6 w-6 text-muted-foreground" /> : null}
                                    <div className={cn("p-3 rounded-lg max-w-sm", message.sender === 'user' ? "bg-muted" : "bg-primary/10")}>
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
                                        <p className="text-xs text-muted-foreground/80 mt-2 text-right">{formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}</p>
                                    </div>
                                    {message.sender === 'admin' ? <ShieldCheck className="h-6 w-6 text-primary" /> : null}
                                </div>
                            ))
                        )}
                        <div ref={endOfMessagesRef} />
                    </CardContent>

                    <Separator />
                    
                    <div className="p-4 space-y-4">
                        <Label htmlFor={`reply-${doubt.id}`}>Your Reply</Label>
                        <div className="flex gap-2">
                            <Textarea id={`reply-${doubt.id}`} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={1} disabled={isReplying || doubt.isCleared} />
                            <Button onClick={handleReply} disabled={!replyText || isReplying || doubt.isCleared} size="icon">
                                {isReplying ? <Loader2 className="h-4 w-4 animate-spin"/> : <Reply className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            
            {doubt.isAddressed && !doubt.isCleared && (
                 <CardFooter className='border-t pt-4'>
                    <Button onClick={() => onCleared(doubt.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Cleared
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

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
    
    const handleMarkCleared = async (doubtId: string) => {
        try {
            await markDoubtAsCleared(doubtId);
            setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, isCleared: true } : d));
            toast({ title: 'Success', description: 'Doubt thread marked as cleared.' });
        } catch(error) {
            toast({ title: 'Error', description: 'Could not update the doubt status.', variant: 'destructive' });
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            );
        }

        if (doubts.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Doubts Here</h3>
                    <p className="text-muted-foreground">Looks like you're all clear! Ask a new question to get started.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                {doubts.map(doubt => (
                    <DoubtThread key={doubt.id} doubt={doubt} onCleared={handleMarkCleared} />
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
