
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, HeartPulse, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPeriodData, logPeriodStart, logPeriodEnd } from '@/lib/periods';
import type { PeriodData } from '@/lib/types';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '../ui/skeleton';

const PeriodCareDialog = ({ children }: { children: React.ReactNode }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Period Care Tips</DialogTitle>
                    <DialogDescription>
                        Listen to your body. It's okay to slow down.
                    </DialogDescription>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3 py-4">
                    <p>When you're on your period, your body is working hard. Be gentle with yourself. Here are a few things that might help:</p>
                    <ul>
                        <li><strong>Hydrate:</strong> Drink plenty of water. Warm herbal tea, like ginger or chamomile, can also be very soothing.</li>
                        <li><strong>Nutrition:</strong> Focus on iron-rich foods like spinach and lentils. Magnesium-rich foods like dark chocolate and almonds can help with cramps.</li>
                        <li><strong>Gentle Movement:</strong> Light stretching, yoga, or a short walk can help ease cramps and boost your mood. Avoid intense workouts if you don't feel up to it.</li>
                        <li><strong>Rest:</strong> Prioritize sleep. If you need a nap, take one. Your body needs rest to recover.</li>
                        <li><strong>Comfort:</strong> A warm compress or hot water bottle on your lower abdomen can work wonders for cramps.</li>
                    </ul>
                    <p>Remember, it's okay to adjust your study schedule. Your health comes first.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function MenstrualCycleTracker() {
    const [periodData, setPeriodData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [actualStartDate, setActualStartDate] = useState('');
    const [actualEndDate, setActualEndDate] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getPeriodData();
            setPeriodData(data);
            if (data?.actualStartDate && !data.actualEndDate) {
                setActualStartDate(format(data.actualStartDate, 'yyyy-MM-dd'));
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleLogStart = async () => {
        if (!actualStartDate) return;
        setIsSaving(true);
        try {
            await logPeriodStart(parseISO(actualStartDate));
            const data = await getPeriodData();
            setPeriodData(data);
            toast({ title: "Start Date Logged", description: "Thank you for logging your start date." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save start date." });
        } finally {
            setIsSaving(false);
        }
    }

    const handleLogEnd = async () => {
        if (!actualEndDate) return;
        setIsSaving(true);
        try {
            await logPeriodEnd(parseISO(actualEndDate));
            const data = await getPeriodData();
            setPeriodData(data); // This should now be null if the logic is correct
            toast({ title: "End Date Logged", description: "Your cycle has been logged. See you next time!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save end date." });
        } finally {
            setIsSaving(false);
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            )
        }

        if (!periodData) {
            return null; // Don't render anything if there's no data (cycle logged or too far away)
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expectedDate = periodData.expectedDate;
        const daysUntilExpected = differenceInDays(expectedDate, today);

        // If cycle has been logged as ended, hide component
        if (periodData.actualEndDate) {
            return null;
        }

        // Countdown view
        if (daysUntilExpected > 2 && !periodData.actualStartDate) {
            const weeks = Math.round(daysUntilExpected / 7);
            let message = `About ${daysUntilExpected} days to go.`;
            if (weeks > 1) {
                message = `About ${weeks} weeks to go.`;
            }
            return (
                <CardContent>
                    <p className="text-muted-foreground text-center italic">{message}</p>
                </CardContent>
            )
        }

        // Main interaction view
        return (
            <CardContent className="space-y-6">
                {!periodData.actualStartDate ? (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Your next period is expected soon. Did it start?</p>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="grid w-full sm:max-w-sm items-center gap-1.5">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input id="start-date" type="date" value={actualStartDate} onChange={(e) => setActualStartDate(e.target.value)} />
                            </div>
                            <Button onClick={handleLogStart} disabled={isSaving || !actualStartDate}>
                                {isSaving ? <Loader2 className="animate-spin" /> : "Log Start Date"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Your period has started. Did it end?</p>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                             <div className="grid w-full sm:max-w-sm items-center gap-1.5">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input id="end-date" type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
                            </div>
                            <Button onClick={handleLogEnd} disabled={isSaving || !actualEndDate}>
                                {isSaving ? <Loader2 className="animate-spin" /> : "Log End Date"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        )
    }

    // This condition will hide the whole card if the component logic decides there's nothing to show
    const shouldShowCard = isLoading || (periodData && !periodData.actualEndDate);

    if (!shouldShowCard) {
        return null;
    }

    return (
        <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><HeartPulse/>Menstrual Cycle</CardTitle>
                        <CardDescription>A gentle reminder to listen to your body.</CardDescription>
                    </div>
                     <PeriodCareDialog>
                        <Button variant="secondary">Period Care</Button>
                    </PeriodCareDialog>
                </div>
            </CardHeader>
            {renderContent()}
        </Card>
    );
}
