
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPeriodData, logPeriodStart, logPeriodEnd } from '@/lib/periods';
import type { PeriodData } from '@/lib/types';
import { differenceInDays, format, parseISO, isToday } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

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
            const data = await getPeriodData(); // This will now fetch the reset data
            setPeriodData(data);
            setActualStartDate('');
            setActualEndDate('');
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

        if (!periodData?.expectedDate) {
            return (
                 <CardContent>
                    <p className="text-muted-foreground text-center italic">The expected date is yet to be analysed, study well, take care</p>
                </CardContent>
            )
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expectedDate = periodData.expectedDate;
        const daysUntilExpected = differenceInDays(expectedDate, today);

        if (periodData.actualStartDate && !periodData.actualEndDate) {
             const startDateIsToday = isToday(new Date(actualStartDate));
             return (
                <CardContent className="space-y-4 text-center">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        I hear you. The most important thing right now is to be gentle with yourself. Your body is working hard, and it's okay to take things a bit slower. Your strength isn't just in studying, but also in knowing when to rest and recharge.
                    </p>
                    
                    {!startDateIsToday && (
                        <div className="flex flex-col sm:flex-row gap-4 items-end pt-4 border-t justify-center">
                            <div className="grid w-full sm:max-w-sm items-center gap-1.5 text-left">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input id="end-date" type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
                            </div>
                            <Button onClick={handleLogEnd} disabled={isSaving || !actualEndDate}>
                                {isSaving ? <Loader2 className="animate-spin" /> : "It Ended"}
                            </Button>
                        </div>
                    )}
                </CardContent>
             )
        }

        if (daysUntilExpected > 14) {
            return <CardContent><p className="text-muted-foreground text-center italic">More than two weeks left.</p></CardContent>;
        }
        if (daysUntilExpected > 7) {
            return <CardContent><p className="text-muted-foreground text-center italic">Less than two weeks left.</p></CardContent>;
        }
        if (daysUntilExpected > 2) {
             return <CardContent><p className="text-muted-foreground text-center italic">Less than one week left.</p></CardContent>;
        }
        if (daysUntilExpected > 0 && daysUntilExpected <= 2) {
            return <CardContent><p className="text-muted-foreground text-center italic">Just a couple of days now. Stay prepared!</p></CardContent>;
        }
        
        if (daysUntilExpected <= 0) {
            const daysUntilCertain = periodData.certainDate ? differenceInDays(periodData.certainDate, today) : null;
            return (
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Your next period is expected around now. Did it start?</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="grid w-full sm:max-w-sm items-center gap-1.5">
                            <Label htmlFor="start-date">Actual Start Date</Label>
                            <Input id="start-date" type="date" value={actualStartDate} onChange={(e) => setActualStartDate(e.target.value)} />
                        </div>
                        <Button onClick={handleLogStart} disabled={isSaving || !actualStartDate}>
                            {isSaving ? <Loader2 className="animate-spin" /> : "It Started"}
                        </Button>
                    </div>
                    {daysUntilCertain !== null && daysUntilCertain > 0 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                           {daysUntilCertain} day{daysUntilCertain > 1 ? 's' : ''} left until the certain date.
                        </p>
                    )}
                </CardContent>
            );
        }

        return null;
    }
    
    const showCareButton = !isLoading && periodData?.expectedDate && differenceInDays(new Date(), periodData.expectedDate) >= -2;

    return (
        <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><HeartPulse/>Menstrual Cycle</CardTitle>
                        <CardDescription>A gentle reminder to listen to your body.</CardDescription>
                    </div>
                     {showCareButton && (
                        <Button asChild variant="secondary">
                           <Link href="/settings/period-care">Period Care</Link>
                        </Button>
                     )}
                </div>
            </CardHeader>
            {renderContent()}
        </Card>
    );
}
