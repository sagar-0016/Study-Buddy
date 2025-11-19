
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
import { getYoutubeBlockStatus, setYoutubeBlockStatus, logYoutubeAccessRequest, AccessStatus } from "@/lib/youtube";
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
    const [isBlocked, setIsBlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showReasonDialog, setShowReasonDialog] = useState(false);
    const [reason, setReason] = useState("");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchStatus = async () => {
        setIsLoading(true);
        const status = await getYoutubeBlockStatus();
        setAccessStatus(status);
        setIsBlocked(status.blocked);
        if (status.lastAccessRequest) {
            const now = Date.now();
            const requestTime = status.lastAccessRequest.getTime();
            const fiveMinutes = 5 * 60 * 1000;
            if (now < requestTime + fiveMinutes) {
                setTimeLeft(Math.round((requestTime + fiveMinutes - now) / 1000));
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useInterval(() => {
        if (timeLeft !== null) {
            if (timeLeft > 1) {
                setTimeLeft(timeLeft - 1);
            } else {
                setTimeLeft(null);
                setYoutubeBlockStatus(false).then(() => {
                    toast({ title: "YouTube Unblocked", description: "You can now access YouTube." });
                    fetchStatus();
                });
            }
        }
    }, timeLeft !== null ? 1000 : null);


    const handleToggle = (checked: boolean) => {
        if (isBlocked && !checked) { // If trying to unblock
            setShowReasonDialog(true);
        } else {
            updateBlockStatus(checked);
        }
    };
    
    const handleReasonSubmit = async () => {
        if (reason.trim().length < 100) {
            toast({ title: "Reason Required", description: "Please provide a more detailed reason (at least 100 characters).", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            await logYoutubeAccessRequest(reason);
            setShowReasonDialog(false);
            setReason('');
            toast({ title: "Request Logged", description: "Your request has been logged. The timer has started." });
            await fetchStatus(); // Refetch status to start the timer
        } catch (error) {
            toast({ title: "Error", description: "Could not log your request.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleAbort = async () => {
        setIsSaving(true);
        try {
            await setYoutubeBlockStatus(true); // Ensure it remains blocked
            setTimeLeft(null);
            toast({ title: "Aborted", description: "Good choice. Stay focused!" });
            await fetchStatus();
        } catch (error) {
             toast({ title: "Error", description: "Could not abort the timer.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    const updateBlockStatus = async (newStatus: boolean) => {
        setIsSaving(true);
        try {
            await setYoutubeBlockStatus(newStatus);
            setIsBlocked(newStatus);
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
                    <Skeleton className="h-4 w-1/2" />
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

    return (
        <>
            <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                    <CardTitle>YouTube Blocker</CardTitle>
                </CardHeader>
                <CardContent>
                    {timeLeft !== null ? (
                        <div className="flex items-center justify-between space-x-4 rounded-md border p-4 bg-yellow-50 dark:bg-yellow-900/20">
                            <div className="flex items-center">
                                <Timer className="h-5 w-5 text-yellow-600 mr-3" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none text-yellow-800 dark:text-yellow-300">
                                        Unblocking in {formatTime(timeLeft)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Wait for the timer to finish or abort.
                                    </p>
                                </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={handleAbort} disabled={isSaving}>
                                <Ban className="mr-2 h-4 w-4" /> Abort
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <Youtube />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Block YouTube
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This will restrict access to YouTube videos.
                                </p>
                            </div>
                            {(isSaving) ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Switch
                                    checked={isBlocked}
                                    onCheckedChange={handleToggle}
                                    aria-label="Toggle YouTube block"
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

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
                            placeholder="e.g., 'I need to watch a specific lecture on Thermodynamics by...'"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleReasonSubmit} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : "Log Request & Start Timer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
