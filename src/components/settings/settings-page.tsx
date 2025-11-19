
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Bot, User, Blend, Youtube, Loader2 } from "lucide-react";
import MenstrualCycleTracker from "./menstrual-cycle-tracker";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { getYoutubeBlockStatus, setYoutubeBlockStatus } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


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
    const [isBlocked, setIsBlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStatus = async () => {
            setIsLoading(true);
            const status = await getYoutubeBlockStatus();
            setIsBlocked(status);
            setIsLoading(false);
        }
        fetchStatus();
    }, []);

    const handleToggle = (checked: boolean) => {
        if (isBlocked && !checked) { // If trying to unblock
            setShowConfirmation(true);
        } else {
            updateStatus(checked);
        }
    };
    
    const updateStatus = async (newStatus: boolean) => {
        setIsSaving(true);
        try {
            await setYoutubeBlockStatus(newStatus);
            setIsBlocked(newStatus);
            toast({
                title: "Status Updated",
                description: `YouTube is now ${newStatus ? 'blocked' : 'unblocked'}.`,
            });
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

    return (
        <>
            <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                    <CardTitle>YouTube Blocker</CardTitle>
                    <CardDescription>
                        Toggle this to block or unblock YouTube functionality across the app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <Youtube />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                Block YouTube
                            </p>
                            <p className="text-sm text-muted-foreground">
                                When enabled, this will restrict access to YouTube videos.
                            </p>
                        </div>
                        {isSaving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Switch
                                checked={isBlocked}
                                onCheckedChange={handleToggle}
                                aria-label="Toggle YouTube block"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Disabling this blocker might lead to distractions. Remember your goals. Do you still want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => updateStatus(false)}>
                            Yes, unblock it
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
