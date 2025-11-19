
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Bot, User, Blend, Youtube, Loader2, Timer, Ban } from "lucide-react";
import MenstrualCycleTracker from "./menstrual-cycle-tracker";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { getYoutubeBlockStatus, setYoutubeBlockStatus, logYoutubeAccessRequest, clearYoutubeAccessRequest, AccessStatus } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useInterval } from "@/hooks/use-interval";
import { cn } from "@/lib/utils";


export type MotivationMode = "ai" | "personal" | "mixed";

const ProfileCard = () => {
    return (
        <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and current focus.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
                 <Image
                    src="/avatar.png"
                    width={80}
                    height={80}
                    alt="Avatar"
                    className="overflow-hidden rounded-full border-2 border-primary p-1"
                />
                <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                        <p className="text-sm font-medium text-muted-foreground w-12">Name:</p>
                        <p className="font-semibold text-lg">Pranjal</p>
                    </div>
                     <div className="flex items-baseline gap-3">
                        <p className="text-sm font-medium text-muted-foreground w-12">Aim:</p>
                        <p className="font-semibold text-lg">IIT Delhi</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const YoutubeBlockToggle = () => {
    const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [viewState, setViewState] = useState<'blocked' | 'waiting' | 'ready' | 'unblocked'>('blocked');
    const [timeLeft, setTimeLeft] = useState<number>(0);
    
    // Dialog states
    const [showInitialConfirm, setShowInitialConfirm] = useState(false);
    const [showReasonDialog, setShowReasonDialog] = useState(false);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);

    const [reason, setReason] = useState("");

    const { toast } = useToast();

    const fetchStatus = async () => {
        const status = await getYoutubeBlockStatus();
        setAccessStatus(status);

        if (status.blocked) {
            if (status.lastAccessRequest) {
                const now = Date.now();
                const requestTime = status.lastAccessRequest.getTime();
                const diffSeconds = (now - requestTime) / 1000;
                
                if (diffSeconds < 300) { // Less than 5 minutes
                    setViewState('waiting');
                    setTimeLeft(300 - Math.round(diffSeconds));
                } else if (diffSeconds < 900) { // Between 5 and 15 minutes
                    setViewState('ready');
                    setTimeLeft(900 - Math.round(diffSeconds));
                } else {
                    setViewState('blocked'); // Request expired
                }
            } else {
                setViewState('blocked');
            }
        } else {
            setViewState('unblocked');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useInterval(() => {
        if (timeLeft > 0) {
            setTimeLeft(timeLeft - 1);
        } else {
            // Timer finished, refetch status to transition to the next state
            fetchStatus();
        }
    }, timeLeft > 0 ? 1000 : null);


    const handleToggle = (checked: boolean) => {
        if (viewState === 'blocked' && !checked) { // Trying to unblock
            setShowInitialConfirm(true);
        } else if (viewState === 'unblocked' && checked) { // Trying to re-block
            updateBlockStatus(true);
        }
    };

    const handleReasonSubmit = async () => {
        if (reason.trim().length < 100) {
            toast({ title: "Reason Required", description: "Please provide a more detailed reason (at least 100 characters).", variant: "destructive" });
            return;
        }
        setShowReasonDialog(false);
        setShowFinalConfirm(true);
    }

    const handleFinalConfirm = async () => {
        setIsSaving(true);
        setShowFinalConfirm(false);
        try {
            await logYoutubeAccessRequest(reason);
            setReason('');
            toast({ title: "Request Logged", description: "Your unblock timer has started." });
            await fetchStatus();
        } catch (error) {
            toast({ title: "Error", description: "Could not log your request.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleAbort = async () => {
        setIsSaving(true);
        try {
            await clearYoutubeAccessRequest();
            setTimeLeft(0);
            toast({ title: "Aborted", description: "Good choice. Stay focused!" });
            await fetchStatus();
        } catch (error) {
             toast({ title: "Error", description: "Could not abort the timer.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleUnblockNow = async () => {
        setIsSaving(true);
        try {
            await setYoutubeBlockStatus(false);
            toast({ title: "YouTube Unblocked", description: "Access granted. Please use it wisely." });
            await fetchStatus();
        } catch (error) {
            toast({ title: "Error", description: "Could not unblock.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    const updateBlockStatus = async (newStatus: boolean) => {
        setIsSaving(true);
        try {
            await setYoutubeBlockStatus(newStatus);
            toast({
                title: "Status Updated",
                description: `YouTube is now ${newStatus ? 'blocked' : 'unblocked'}.`,
            });
            await fetchStatus();
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not update the status.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <Card className="border-0">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const renderContent = () => {
        switch (viewState) {
            case 'waiting':
                return (
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center">
                            <Timer className="h-5 w-5 text-yellow-600 mr-3" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none text-yellow-800 dark:text-yellow-300">
                                    Unblock request pending...
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Opportunity to unblock in {formatTime(timeLeft)}.
                                </p>
                            </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleAbort} disabled={isSaving}>
                            <Ban className="mr-2 h-4 w-4" /> Abort
                        </Button>
                    </div>
                );
            case 'ready':
                return (
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4 bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center">
                            <Timer className="h-5 w-5 text-green-600 mr-3" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none text-green-800 dark:text-green-300">
                                    Ready to Unblock
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This option expires in {formatTime(timeLeft)}.
                                </p>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={handleUnblockNow} disabled={isSaving}>
                           Unblock Now
                        </Button>
                    </div>
                );
            case 'blocked':
            case 'unblocked':
            default:
                return (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <Youtube />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                Block YouTube
                            </p>
                        </div>
                        {(isSaving) ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Switch
                                checked={viewState === 'blocked'}
                                onCheckedChange={handleToggle}
                                aria-label="Toggle YouTube block"
                            />
                        )}
                    </div>
                );
        }
    }

    return (
        <>
            <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                    <CardTitle>YouTube Blocker</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
            
            <AlertDialog open={showInitialConfirm} onOpenChange={setShowInitialConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are You Absolutely Sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Disabling this blocker can be a distraction. Are you certain this is necessary for your studies right now?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Yes, stay focused.</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setShowInitialConfirm(false); setShowReasonDialog(true); }}>
                            No, I need access.
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>A Quick Question</DialogTitle>
                        <DialogDescription>
                            Before unblocking, please state your reason. This helps in maintaining focus.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="reason">Why do you need to unblock YouTube?</Label>
                             <span className={cn(
                                "text-xs font-medium",
                                reason.trim().length < 100 ? "text-muted-foreground" : "text-green-600"
                            )}>
                                {reason.trim().length} / 100
                            </span>
                        </div>
                        <Textarea 
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., 'I need to watch a specific lecture on Thermodynamics by...' (Please be detailed - 100 characters minimum)"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleReasonSubmit} disabled={isSaving || reason.trim().length < 100}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                           Your reason is logged. An option to unblock will appear in 5 minutes and will be available for 10 minutes. Do you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalConfirm}>
                            Yes, start the timer.
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


export default function SettingsPage() {
    const [motivationMode, setMotivationMode] = useLocalStorage<MotivationMode>('motivation-mode', 'mixed');

    return (
        <div className="space-y-6">
            <ProfileCard />
            <YoutubeBlockToggle />
            <MenstrualCycleTracker />
            <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                    <CardTitle>Motivation Corner</CardTitle>
                    <CardDescription>
                        Choose the style of motivational messages you'd like to receive on the home page. Your choice is saved on this device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={motivationMode}
                        onValueChange={(value: string) => setMotivationMode(value as MotivationMode)}
                        className="space-y-4"
                    >
                        <Label
                            htmlFor="mixed"
                            className="flex flex-col items-start gap-4 rounded-lg border p-4 transition hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="mixed" id="mixed" />
                                <Blend className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold">Mixed</p>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        A random mix of personal and AI-generated messages.
                                    </span>
                                </div>
                            </div>
                        
                        </Label>
                        <Label
                            htmlFor="personal"
                            className="flex flex-col items-start gap-4 rounded-lg border p-4 transition hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="personal" id="personal" />
                                <User className="h-6 w-6 text-accent" />
                                <div>
                                    <p className="font-semibold">Personal</p>
                                </div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="ai"
                            className="flex flex-col items-start gap-4 rounded-lg border p-4 transition hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="ai" id="ai" />
                                <Bot className="h-6 w-6 text-destructive" />
                                <div>
                                    <p className="font-semibold">AI Powered</p>
                                </div>
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    )
}
