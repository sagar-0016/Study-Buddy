

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageSquare, Image as ImageIcon, CheckCircle, AlertCircle, HelpCircle, Send, Reply, ShieldCheck, MessageCircle as MessageCircleIcon, Link as LinkIcon, FileText, ExternalLink, Check, Circle, Smile, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getDoubts, addDoubt, markDoubtAsCleared, getDoubtThread, addReplyToDoubt, markDoubtAsAddressed } from '@/lib/doubts';
import type { Doubt, DoubtMessage, AccessLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import DoubtFloatingBrowser from './doubt-floating-browser';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from '@/components/ui/scroll-area';

const AddDoubtDialog = ({ onDoubtAdded, children }: { onDoubtAdded: () => void, children: React.ReactNode }) => {
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { pauseLocking } = useAuth();

    const canSubmit = useMemo(() => text && subject, [text, subject]);

    const resetForm = () => {
        setText('');
        setSubject('');
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

const AddLinkDialog = ({ onLinkAdd }: { onLinkAdd: (url: string) => void }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        onLinkAdd(linkUrl);
        setLinkUrl('');
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LinkIcon className="h-4 w-4" />
                    <span className="sr-only">Add link</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a Link</DialogTitle>
                    <DialogDescription>Paste the URL you want to share below.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="link-url">URL</Label>
                    <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const emojiList: { emoji: string, keywords: string[] }[] = [
    { emoji: '😀', keywords: ['grin', 'happy', 'smile'] }, { emoji: '😃', keywords: ['smiley', 'happy', 'big eyes'] }, { emoji: '😄', keywords: ['smile', 'happy', 'eyes closed'] }, { emoji: '😁', keywords: ['grinning', 'beaming', 'smile'] }, { emoji: '😆', keywords: ['laughing', 'happy', 'lol'] }, { emoji: '😅', keywords: ['sweat', 'smile', 'nervous'] }, { emoji: '😂', keywords: ['joy', 'laugh', 'cry'] }, { emoji: '🤣', keywords: ['rofl', 'rolling', 'laughing'] }, { emoji: '😭', keywords: ['crying', 'sad', 'sob'] }, { emoji: '😉', keywords: ['wink', 'flirt'] }, { emoji: '😗', keywords: ['kissing', 'pucker'] }, { emoji: '😙', keywords: ['kissing', 'smile'] }, { emoji: '😚', keywords: ['kissing', 'closed eyes'] }, { emoji: '😘', keywords: ['kiss', 'heart'] }, { emoji: '🥰', keywords: ['love', 'hearts', 'blush'] }, { emoji: '😍', keywords: ['heart eyes', 'love'] }, { emoji: '🤩', keywords: ['star-struck', 'excited'] }, { emoji: '🥳', keywords: ['party', 'celebrate'] }, { emoji: '🫠', keywords: ['melting', 'hot', 'overwhelmed'] }, { emoji: '🙃', keywords: ['upside-down', 'silly'] }, { emoji: '🙂', keywords: ['smile', 'slight'] }, { emoji: '🥲', keywords: ['smiling face with tear', 'happy cry'] }, { emoji: '🥹', keywords: ['holding back tears', 'sad', 'proud'] }, { emoji: '😊', keywords: ['blush', 'happy'] }, { emoji: '☺️', keywords: ['relaxed', 'blush'] }, { emoji: '😌', keywords: ['relieved', 'calm'] }, { emoji: '🙂‍↕️', keywords: ['shaking head yes', 'agree'] }, { emoji: '🙂‍↔️', keywords: ['shaking head no', 'disagree'] }, { emoji: '😏', keywords: ['smirk', 'smug'] }, { emoji: '🤤', keywords: ['drooling', 'hungry'] }, { emoji: '😋', keywords: ['yum', 'tasty'] }, { emoji: '😛', keywords: ['tongue out', 'playful'] }, { emoji: '😝', keywords: ['tongue out', 'silly'] }, { emoji: '😜', keywords: ['wink tongue', 'playful'] }, { emoji: '🤪', keywords: ['zany', 'crazy'] }, { emoji: '🥴', keywords: ['woozy', 'drunk'] }, { emoji: '😔', keywords: ['pensive', 'sad'] }, { emoji: '🥺', keywords: ['pleading', 'puppy eyes'] }, { emoji: '😬', keywords: ['grimacing', 'nervous'] }, { emoji: '😑', keywords: ['expressionless', 'meh'] }, { emoji: '😐', keywords: ['neutral', 'blank'] }, { emoji: '😶', keywords: ['no mouth', 'silent'] }, { emoji: '😶‍🌫️', keywords: ['face in clouds', 'absent'] }, { emoji: '🫥', keywords: ['dotted line', 'hidden'] }, { emoji: '🤐', keywords: ['zipper mouth', 'secret'] }, { emoji: '🫡', keywords: ['saluting', 'respect'] }, { emoji: '🤔', keywords: ['thinking', 'hmmm'] }, { emoji: '🤫', keywords: ['shushing', 'quiet'] }, { emoji: '🫢', keywords: ['hand over mouth', 'shock'] }, { emoji: '🤭', keywords: ['giggle', 'hand over mouth'] }, { emoji: '🥱', keywords: ['yawning', 'tired'] }, { emoji: '🤗', keywords: ['hugging', 'hug'] }, { emoji: '🫣', keywords: ['peeking', 'scared'] }, { emoji: '😱', keywords: ['scream', 'shock'] }, { emoji: '🤨', keywords: ['raised eyebrow', 'suspicious'] }, { emoji: '🧐', keywords: ['monocle', 'inspect'] }, { emoji: '😒', keywords: ['unamused', 'annoyed'] }, { emoji: '🙄', keywords: ['rolling eyes', 'annoyed'] }, { emoji: '😮‍💨', keywords: ['exhaling', 'sigh'] }, { emoji: '😤', keywords: ['steam nose', 'angry'] }, { emoji: '😠', keywords: ['angry', 'mad'] }, { emoji: '😡', keywords: ['pouting', 'furious'] }, { emoji: '🤬', keywords: ['swearing', 'cursing'] }, { emoji: '😞', keywords: ['disappointed', 'sad'] }, { emoji: '😓', keywords: ['cold sweat', 'anxious'] }, { emoji: '😟', keywords: ['worried', 'concerned'] }, { emoji: '😥', keywords: ['sad but relieved', 'sweat'] }, { emoji: '😢', keywords: ['crying', 'sad'] }, { emoji: '☹️', keywords: ['frowning', 'sad'] }, { emoji: '🙁', keywords: ['slightly frowning', 'sad'] }, { emoji: '🫤', keywords: ['wavy mouth', 'uncertain'] }, { emoji: '😕', keywords: ['confused', 'uncertain'] }, { emoji: '😰', keywords: ['anxious', 'blue'] }, { emoji: '😨', keywords: ['fearful', 'scared'] }, { emoji: '😧', keywords: ['anguished', 'pain'] }, { emoji: '😦', keywords: ['frowning open mouth', 'surprise'] }, { emoji: '😮', keywords: ['open mouth', 'surprise'] }, { emoji: '😯', keywords: ['hushed', 'silent'] }, { emoji: '😲', keywords: ['astonished', 'shocked'] }, { emoji: '😳', keywords: ['flushed', 'embarrassed'] }, { emoji: '🤯', keywords: ['exploding head', 'mind blown'] }, { emoji: '😖', keywords: ['confounded', 'struggling'] }, { emoji: '😣', keywords: ['persevering', 'struggling'] }, { emoji: '😩', keywords: ['weary', 'tired'] }, { emoji: '😫', keywords: ['tired', 'frustrated'] }, { emoji: '😵', keywords: ['dizzy', 'knocked out'] }, { emoji: '😵‍💫', keywords: ['spiral eyes', 'dizzy'] }, { emoji: '🫨', keywords: ['shaking face', 'shock'] }, { emoji: '🥶', keywords: ['cold', 'freezing'] }, { emoji: '🥵', keywords: ['hot', 'sweating'] }, { emoji: '🤢', keywords: ['nauseated', 'sick'] }, { emoji: '🤮', keywords: ['vomiting', 'sick'] }, { emoji: '🫩', keywords: ['pregnant', 'woman'] }, { emoji: '😴', keywords: ['sleeping', 'zzz'] }, { emoji: '😪', keywords: ['sleepy', 'tired'] }, { emoji: '🤧', keywords: ['sneezing', 'sick'] }, { emoji: '🤒', keywords: ['thermometer', 'sick'] }, { emoji: '🤕', keywords: ['bandage', 'injured'] }, { emoji: '😷', keywords: ['mask', 'sick'] }, { emoji: '🤥', keywords: ['lying', 'pinocchio'] }, { emoji: '😇', keywords: ['angel', 'halo'] }, { emoji: '🤠', keywords: ['cowboy', 'hat'] }, { emoji: '🤑', keywords: ['money mouth', 'rich'] }, { emoji: '🤓', keywords: ['nerd', 'glasses'] }, { emoji: '😎', keywords: ['sunglasses', 'cool'] }, { emoji: '🥸', keywords: ['disguised', 'glasses nose'] }, { emoji: '🤡', keywords: ['clown'] }, { emoji: '💩', keywords: ['poop', 'crap'] }, { emoji: '😈', keywords: ['devil', 'smiling'] }, { emoji: '👿', keywords: ['devil', 'angry'] }, { emoji: '👻', keywords: ['ghost'] }, { emoji: '💀', keywords: ['skull'] }, { emoji: '☠️', keywords: ['skull crossbones', 'danger'] }, { emoji: '👹', keywords: ['ogre', 'monster'] }, { emoji: '👺', keywords: ['goblin', 'monster'] }, { emoji: '☃️', keywords: ['snowman', 'winter'] }, { emoji: '⛄', keywords: ['snowman no snow', 'winter'] }, { emoji: '😺', keywords: ['cat', 'grinning'] }, { emoji: '😸', keywords: ['cat', 'smile'] }, { emoji: '😹', keywords: ['cat', 'joy', 'laugh'] }, { emoji: '😻', keywords: ['cat', 'heart eyes', 'love'] }, { emoji: '😼', keywords: ['cat', 'smirk'] }, { emoji: '😽', keywords: ['cat', 'kiss'] }, { emoji: '🙀', keywords: ['cat', 'scream', 'shock'] }, { emoji: '😿', keywords: ['cat', 'cry', 'sad'] }, { emoji: '😾', keywords: ['cat', 'pouting', 'angry'] }, { emoji: '🙈', keywords: ['see no evil', 'monkey'] }, { emoji: '🙉', keywords: ['hear no evil', 'monkey'] }, { emoji: '🙊', keywords: ['speak no evil', 'monkey'] }, { emoji: '💫', keywords: ['dizzy', 'star'] }, { emoji: '⭐', keywords: ['star'] }, { emoji: '🌟', keywords: ['glowing star', 'sparkle'] }, { emoji: '✨', keywords: ['sparkles', 'magic'] }, { emoji: '⚡', keywords: ['lightning', 'zap'] }, { emoji: '💥', keywords: ['collision', 'boom'] }, { emoji: '💢', keywords: ['anger', 'symbol'] }, { emoji: '💨', keywords: ['dash', 'wind'] }, { emoji: '💦', keywords: ['sweat drops', 'water'] }, { emoji: '💤', keywords: ['sleep', 'zzz'] }, { emoji: '🕳️', keywords: ['hole'] }, { emoji: '🔥', keywords: ['fire', 'lit'] }, { emoji: '💯', keywords: ['100', 'score'] }, { emoji: '🎉', keywords: ['tada', 'party'] }, { emoji: '🎊', keywords: ['confetti', 'celebrate'] }, { emoji: '❤️', keywords: ['heart', 'love', 'red'] }, { emoji: '💗', keywords: ['growing heart', 'love'] }, { emoji: '💘', keywords: ['heart arrow', 'love'] }, { emoji: '💖', keywords: ['sparkling heart', 'love'] }, { emoji: '💝', keywords: ['ribbon heart', 'gift', 'love'] }, { emoji: '❣️', keywords: ['exclamation heart', 'love'] }, { emoji: '🫀', keywords: ['anatomical heart', 'organ'] }, { emoji: '👍🏻', keywords: ['thumbs up', 'like'] }, { emoji: '👎', keywords: ['thumbs down', 'dislike'] }, { emoji: '🫶', keywords: ['heart hands', 'love'] }, { emoji: '🙌', keywords: ['raising hands', 'celebrate'] }, { emoji: '👐', keywords: ['open hands', 'hug'] }, { emoji: '🤜', keywords: ['fist bump', 'right'] }, { emoji: '🤛', keywords: ['fist bump', 'left'] }, { emoji: '✊', keywords: ['fist', 'power'] }, { emoji: '👊', keywords: ['punch', 'fist'] }, { emoji: '🫳', keywords: ['palm down', 'drop'] }, { emoji: '🫴', keywords: ['palm up', 'receive'] }, { emoji: '🫱', keywords: ['rightwards hand', 'offer'] }, { emoji: '🫲', keywords: ['leftwards hand', 'receive'] }, { emoji: '🫸', keywords: ['pushing right', 'stop'] }, { emoji: '🫷', keywords: ['pushing left', 'stop'] }, { emoji: '👋', keywords: ['wave', 'hello', 'bye'] }, { emoji: '🤚', keywords: ['raised hand', 'stop'] }, { emoji: '🖐️', keywords: ['raised hand', 'five'] }, { emoji: '✋', keywords: ['raised hand', 'stop'] }, { emoji: '🖖', keywords: ['vulcan salute', 'spock'] }, { emoji: '🤟', keywords: ['love you', 'gesture'] }, { emoji: '🤘', keywords: ['rock on', 'horns'] }, { emoji: '✌️', keywords: ['peace', 'two'] }, { emoji: '🤞', keywords: ['fingers crossed', 'luck'] }, { emoji: '🫰', keywords: ['heart finger', 'love'] }, { emoji: '🤙', keywords: ['call me', 'shaka'] }, { emoji: '👇', keywords: ['down'] }, { emoji: '👆', keywords: ['up'] }, { emoji: '☝️', keywords: ['up', 'one'] }, { emoji: '👈', keywords: ['left'] }, { emoji: '👉', keywords: ['right'] }, { emoji: '🫵', keywords: ['you', 'point'] }, { emoji: '👌', keywords: ['ok', 'perfect'] }, { emoji: '🤏', keywords: ['pinching', 'small'] }, { emoji: '🤌', keywords: ['pinched fingers', 'italian'] }, { emoji: '🖕', keywords: ['middle finger'] }, { emoji: '✍️', keywords: ['writing', 'write'] }, { emoji: '🤳', keywords: ['selfie'] }, { emoji: '🙏', keywords: ['pray', 'namaste', 'thanks'] }, { emoji: '💅', keywords: ['nail polish', 'care'] }, { emoji: '🤝', keywords: ['handshake', 'deal'] },
];

const EmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
    const [search, setSearch] = useState('');

    const filteredEmojis = useMemo(() => {
        if (!search) return emojiList;
        const lowercasedSearch = search.toLowerCase();
        return emojiList.filter(e => e.keywords.some(kw => kw.includes(lowercasedSearch)));
    }, [search]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Smile className="h-4 w-4" />
                    <span className="sr-only">Add emoji</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search emoji..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8"
                        />
                    </div>
                </div>
                <ScrollArea className="h-60">
                    <div className="grid grid-cols-8 gap-1 p-2">
                        {filteredEmojis.map(({ emoji, keywords }) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                size="icon"
                                onClick={() => onEmojiSelect(emoji)}
                                className="text-xl"
                                title={keywords.join(', ')}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

const DoubtThreadDialog = ({ doubt, onStateChange, children }: { doubt: Doubt, onStateChange: () => void, children: React.ReactNode }) => {
    const [thread, setThread] = useState<DoubtMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [viewingUrl, setViewingUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { toast } = useToast();
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const fetchThread = useCallback(async () => {
        setIsLoading(true);
        const fetchedThread = await getDoubtThread(doubt.id, doubt.lectureId);
        setThread(fetchedThread);
        setIsLoading(false);
    }, [doubt.id, doubt.lectureId]);
    
    useEffect(() => {
        const adminMode = localStorage.getItem('admin-mode') === 'true';
        setIsAdmin(adminMode);
    }, []);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const handleReply = async () => {
        if (!replyText) return;
        setIsReplying(true);

        const sender = isAdmin ? 'admin' : 'user';

        const messageData: { text: string; sender: 'user' | 'admin'; mediaUrl?: string; mediaType?: 'link' } = {
            text: replyText,
            sender: sender
        };

        if (linkUrl) {
            messageData.mediaUrl = linkUrl;
            messageData.mediaType = 'link';
        }

        try {
            await addReplyToDoubt(doubt.id, doubt.lectureId, messageData);
            setReplyText('');
            setLinkUrl('');
            await fetchThread(); // Re-fetch the thread
        } catch (error) {
            toast({ title: 'Error', description: 'Could not send reply.', variant: 'destructive' });
        } finally {
            setIsReplying(false);
        }
    };

    const handleMarkAddressed = async () => {
        try {
            await markDoubtAsAddressed(doubt.id, doubt.lectureId);
            toast({ title: 'Marked as Addressed', description: 'The user will be notified that their doubt is addressed.' });
            onStateChange();
        } catch (error) {
            toast({ title: 'Error', description: 'Could not mark as addressed.', variant: 'destructive' });
        }
    }
    
    const handleMarkCleared = async () => {
        try {
            await markDoubtAsCleared(doubt.id, doubt.lectureId);
            toast({ title: 'Success', description: 'Doubt thread marked as cleared.' });
            onStateChange();
        } catch(error) {
            toast({ title: 'Error', description: 'Could not update the doubt status.', variant: 'destructive' });
        }
    }

    const handleLinkClick = (url: string) => {
        setViewingUrl(url);
    }

    const MessageBubble = ({ message }: { message: DoubtMessage }) => {
        const isUser = message.sender === 'user';
        const isLink = message.mediaType === 'link';
        const isImage = message.mediaType === 'image';
    
        return (
            <div className={cn("flex w-full items-end gap-2", isUser ? "justify-end" : "justify-start")}>
                 {!isUser && <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 self-start" />}
                 
                <div className={cn("p-3 rounded-lg relative max-w-sm", isUser ? "bg-primary/10" : "bg-muted")}>
                    {isLink && message.mediaUrl ? (
                        <button onClick={() => handleLinkClick(message.mediaUrl!)} className="flex items-center gap-2 text-left hover:underline text-blue-600 dark:text-blue-400">
                            <span className="font-medium">{message.text}</span>
                             <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                    ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                    )}

                    {isImage && message.mediaUrl && (
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
                </div>
    
                {isUser && (
                     <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 self-end">
                        <Image src="/avatar.png" width={24} height={24} alt="User Avatar" className="object-cover" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <Dialog onOpenChange={(open) => { if (open) fetchThread(); }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg md:max-w-2xl flex flex-col h-[80vh]">
                {viewingUrl && <DoubtFloatingBrowser url={viewingUrl} onClose={() => setViewingUrl(null)} />}
                <DialogHeader>
                    <DialogTitle>{doubt.text}</DialogTitle>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Conversation about your doubt in {doubt.subject}.
                        </span>
                        {doubt.lectureTitle && (
                        <span className="block mt-1">
                                <Badge variant="outline">From lecture: {doubt.lectureTitle}</Badge>
                        </span>
                        )}
                    </div>
                </DialogHeader>

                <div className="pr-6 pt-2">
                    {!isAdmin && doubt.isAddressed && !doubt.isCleared && (
                        <div className="flex justify-end">
                            <Button onClick={handleMarkCleared} variant="outline" size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Cleared
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {isLoading ? <Skeleton className="h-20 w-full" /> : (
                        thread.map(message => (
                            <MessageBubble key={message.id} message={message} />
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
                        placeholder={linkUrl ? `Text for link: ${linkUrl}` : "Type your reply..."}
                        rows={1}
                        className="pr-28 resize-none"
                        disabled={isReplying || doubt.isCleared} 
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <EmojiPicker onEmojiSelect={(emoji) => setReplyText(replyText + emoji)} />
                        <AddLinkDialog onLinkAdd={setLinkUrl} />
                    </div>
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


                <DialogFooter className="border-t pt-4">
                    {isAdmin && !doubt.isAddressed && (
                         <Button variant="secondary" onClick={handleMarkAddressed}>
                            <Circle className="mr-2 h-4 w-4" />
                            Mark as Addressed
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DoubtCard = ({ doubt, onStateChange }: { doubt: Doubt, onStateChange: () => void }) => {
    const getStatus = () => {
        if (doubt.isCleared) return { text: 'Cleared by you', icon: CheckCircle, color: 'text-green-600' };
        if (doubt.isAddressed) return { text: 'Admin Replied', icon: AlertCircle, color: 'text-yellow-600' };
        return { text: 'Pending', icon: HelpCircle, color: 'text-muted-foreground' };
    };

    const { text, icon: Icon, color } = getStatus();

    return (
        <DoubtThreadDialog doubt={doubt} onStateChange={onStateChange}>
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
    
    const handleStateChange = () => {
        // Just re-fetch all doubts to ensure UI is consistent
        fetchDoubts();
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
                    <DoubtCard key={doubt.id} doubt={doubt} onStateChange={handleStateChange} />
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

    

    

    

    