

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageSquare, Image as ImageIcon, CheckCircle2, AlertCircle, HelpCircle, Send, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getTechnicalHelp, addTechnicalHelp, markTechnicalHelpAsCleared } from '@/lib/technical-help';
import type { TechnicalHelp, AccessLevel } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';

const AddHelpRequestDialog = ({ onHelpRequestAdded, children }: { onHelpRequestAdded: () => void, children: React.ReactNode }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { pauseLocking } = useAuth();

    const canSubmit = useMemo(() => text && category, [text, category]);

    const resetForm = () => {
        setText('');
        setCategory('');
        setImageFile(null);
    };
    
    const triggerFileInput = () => {
        toast({
            title: "File Upload",
            description: "App locking is paused for 10 seconds while you select a file.",
            duration: 10000,
        });
        pauseLocking(10000);
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSaving(true);
        try {
            const accessLevel = localStorage.getItem('study-buddy-access-level') as AccessLevel || 'limited';
            await addTechnicalHelp({
                text,
                category,
                accessLevel,
                imageFile: imageFile || undefined
            });
            toast({ title: "Success!", description: "Your help request has been submitted." });
            onHelpRequestAdded();
            setIsOpen(false);
            resetForm();
        } catch (error) {
             toast({ title: "Error", description: "Could not submit your request.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Submit a Technical Help Request</DialogTitle>
                    <DialogDescription>
                        Clearly describe the issue. Attach a screenshot if it helps.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UI/UX">UI/UX Issue</SelectItem>
                                <SelectItem value="Functionality">Functionality Bug</SelectItem>
                                <SelectItem value="Performance">Performance Problem</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="help-text">Describe the Issue</Label>
                        <Textarea id="help-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Explain the problem in detail here..." rows={5} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">Attach Screenshot (Optional)</Label>
                         <Button variant="outline" onClick={triggerFileInput} className="w-full">
                            <ImageIcon className="mr-2 h-4 w-4" /> Choose Screenshot
                        </Button>
                        <input ref={fileInputRef} id="image" type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden"/>
                         {imageFile && <p className="text-sm text-muted-foreground">Selected: {imageFile.name}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                     <Button onClick={handleSubmit} disabled={isSaving || !canSubmit}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const HelpRequestCard = ({ request, onCleared }: { request: TechnicalHelp, onCleared: (id: string) => void }) => {
    const getStatus = () => {
        if (request.isCleared) return { text: 'Cleared by you', icon: CheckCircle2, color: 'text-green-600' };
        if (request.isAddressed) return { text: 'Addressed', icon: AlertCircle, color: 'text-yellow-600' };
        return { text: 'Pending', icon: HelpCircle, color: 'text-muted-foreground' };
    };

    const { text, icon: Icon, color } = getStatus();

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardDescription>
                        {request.createdAt?.toDate ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                         <Badge variant='secondary'>{request.category}</Badge>
                        <Badge variant={request.isCleared ? 'default' : request.isAddressed ? 'outline' : 'secondary'} className="flex items-center gap-1">
                            <Icon className={`h-3 w-3 ${color}`} />
                            {text}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{request.text}</p>
                {request.imageUrl && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="mt-4 rounded-lg overflow-hidden border w-full max-w-xs group relative">
                                <Image src={request.imageUrl} alt="Help request image" width={300} height={200} className="object-cover w-full" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="h-8 w-8 text-white" />
                                </div>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                             <Image src={request.imageUrl} alt="Help request image" width={800} height={600} className="rounded-lg object-contain" />
                        </DialogContent>
                    </Dialog>
                )}

                {request.adressedText && (
                    <>
                        <Separator />
                        <div className="p-4 bg-accent/20 rounded-lg border-l-4 border-accent">
                             <div className="flex items-center gap-2 mb-2">
                                <MessageSquareText className="h-5 w-5 text-accent-foreground" />
                                <h4 className="font-semibold text-accent-foreground">Response</h4>
                            </div>
                            <p className="whitespace-pre-wrap text-muted-foreground">{request.adressedText}</p>
                        </div>
                    </>
                )}
            </CardContent>
            {request.isAddressed && !request.isCleared && (
                 <CardFooter>
                    <Button onClick={() => onCleared(request.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Cleared
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};


export default function TechnicalHelpCentre() {
    const [requests, setRequests] = useState<TechnicalHelp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchHelpRequests = useCallback(async () => {
        setIsLoading(true);
        const accessLevel = localStorage.getItem('study-buddy-access-level') as AccessLevel | null || 'limited';
        const fetchedRequests = await getTechnicalHelp(accessLevel);
        setRequests(fetchedRequests);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchHelpRequests();
    }, [fetchHelpRequests]);
    
    const handleMarkCleared = async (id: string) => {
        try {
            await markTechnicalHelpAsCleared(id);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, isCleared: true } : r));
            toast({ title: 'Success', description: 'Request marked as cleared.' });
        } catch(error) {
            toast({ title: 'Error', description: 'Could not update the request status.', variant: 'destructive' });
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

        if (requests.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Help Requests Here</h3>
                    <p className="text-muted-foreground">Looks like everything is running smoothly! Submit a new request to get started.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                {requests.map(request => (
                    <HelpRequestCard key={request.id} request={request} onCleared={handleMarkCleared} />
                ))}
            </div>
        )
    }

    return (
         <div className="relative">
             {renderContent()}

            <div className="fixed bottom-8 right-8 z-50">
               <AddHelpRequestDialog onHelpRequestAdded={fetchHelpRequests}>
                    <Button className="rounded-full h-14 w-14 p-4 shadow-lg flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                        <span className="sr-only">New Help Request</span>
                    </Button>
               </AddHelpRequestDialog>
           </div>
        </div>
    );
}

    