

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, HeartPulse, Sparkles, Heart, Droplets, Utensils, Bed, Wind, Heater } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPeriodData, logPeriodStart, logPeriodEnd } from '@/lib/periods';
import type { PeriodData } from '@/lib/types';
import { differenceInDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

const periodCareTips = [
    {
        icon: Droplets,
        title: "Stay Hydrated",
        text: "Drinking plenty of water is really important. It can help reduce bloating and ease cramps.",
        color: "text-blue-500",
    },
    {
        icon: Heater,
        title: "Warm Compresses are Friends",
        text: "Using a heating pad or a warm water bottle on your tummy can work wonders for cramps. It's like a warm hug for your muscles.",
        color: "text-orange-500",
    },
    {
        icon: Utensils,
        title: "Nourish Your Body",
        text: "Some find that salty foods (like chips or some Chinese dishes) can make bloating worse. A banana can be great for potassium, but it's also okay to have your favorite comfort food!",
        color: "text-green-500",
    },
    {
        icon: Wind,
        title: "Gentle Movement",
        text: "Light stretching, yoga, or a short walk can really help ease cramps and boost your mood. No need for intense workouts.",
        color: "text-purple-500",
    },
    {
        icon: Bed,
        title: "Prioritize Rest",
        text: "Your body is doing a lot of work. If you feel tired, listen to it. A nap isn't lazy, it's necessary for recovery.",
        color: "text-yellow-500",
    },
];

const PeriodCareDialog = ({ children }: { children: React.ReactNode }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader className="text-center flex-shrink-0">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mb-4"
                    >
                        <Heart className="h-10 w-10 text-red-500" />
                    </motion.div>
                    <DialogTitle>It's Okay to Slow Down</DialogTitle>
                    <DialogDescription>
                        Listen to your body. Being kind to yourself is the most productive thing you can do right now.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow my-4">
                     <motion.div
                        className="space-y-4 pr-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {periodCareTips.map((tip) => (
                            <motion.div key={tip.title} variants={itemVariants}>
                                <Card className="bg-muted/50 border-0">
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <div className="p-2 bg-background rounded-full">
                                        <tip.icon className={`h-6 w-6 ${tip.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{tip.title}</h4>
                                            <p className="text-sm text-muted-foreground">{tip.text}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </ScrollArea>
                <DialogFooter className="text-center w-full flex-shrink-0">
                    <p className="text-sm text-muted-foreground italic w-full">You're doing amazing. This will pass soon, and you'll be back to conquering the world (and JEE)!</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


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

        if (!periodData || periodData.actualEndDate) {
            // Hide the card content if the cycle has been fully logged
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expectedDate = periodData.expectedDate;
        const daysUntilExpected = differenceInDays(expectedDate, today);

        // If a start date has been logged, we only need to ask for the end date.
        if (periodData.actualStartDate) {
             return (
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Hope you're taking it easy. Did your period end?</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="grid w-full sm:max-w-sm items-center gap-1.5">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input id="end-date" type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
                        </div>
                        <Button onClick={handleLogEnd} disabled={isSaving || !actualEndDate}>
                            {isSaving ? <Loader2 className="animate-spin" /> : "It Ended"}
                        </Button>
                    </div>
                </CardContent>
            );
        }

        // Countdown logic before expected date
        if (daysUntilExpected > 14) {
            return <CardContent><p className="text-muted-foreground text-center italic">More than two weeks left.</p></CardContent>;
        }
        if (daysUntilExpected > 7) {
            return <CardContent><p className="text-muted-foreground text-center italic">Less than two weeks left.</p></CardContent>;
        }
        if (daysUntilExpected > 2) {
             return <CardContent><p className="text-muted-foreground text-center italic">Less than a week left.</p></CardContent>;
        }
        if (daysUntilExpected > 0 && daysUntilExpected <= 2) {
            return <CardContent><p className="text-muted-foreground text-center italic">Just a couple of days now. Stay prepared!</p></CardContent>;
        }

        // Logic for when the expected date has arrived
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

    const cardContent = renderContent();
    if (isLoading) {
         return (
            <Card className="border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-12 w-full" /></CardContent>
            </Card>
        )
    }

    // Don't render the card at all if there's nothing to show
    if (!cardContent) {
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
            {cardContent}
        </Card>
    );
}
