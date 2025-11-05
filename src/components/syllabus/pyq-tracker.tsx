
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Subject, Chapter, Syllabus, SyllabusChapter } from '@/lib/types';
import { getPyqProgress, updatePyqStatus } from '@/lib/pyq';
import { getSyllabusData } from '@/lib/syllabus';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ExamType = 'jeeMain' | 'jeeAdvanced';

function SubjectPyqTracker({ subject, examType }: { subject: Subject, examType: ExamType }) {
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            setIsLoading(true);
            const progressData = await getPyqProgress(examType);
            const initialState: Record<string, boolean> = {};
            progressData.forEach(item => {
                initialState[item.id] = item.completed;
            });
            setCheckedState(initialState);
            setIsLoading(false);
        };
        fetchProgress();
    }, [subject, examType]);
    
    const handleCheckboxChange = async (pyqKey: string, checked: boolean) => {
        setCheckedState(prevState => ({ ...prevState, [pyqKey]: checked }));
        await updatePyqStatus(pyqKey, checked, examType);
    };

     if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        );
    }

    return (
         <div className="space-y-4">
            <Accordion type="multiple" className="w-full">
                {subject.chapters.map((chapter: Chapter) => (
                    <AccordionItem key={chapter.title} value={chapter.title}>
                        <AccordionTrigger>{chapter.title}</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-3">
                                {chapter.topics.map(topic => { 
                                    const pyqKey = `${subject.label}-${chapter.title}-${topic.name}`;
                                    return (
                                        <div key={pyqKey} className={cn("flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50 transition-colors", topic.isOutOfSyllabus && examType === 'jeeMain' && "opacity-60")}>
                                            <Checkbox
                                                id={`${pyqKey}-${examType}`}
                                                checked={checkedState[pyqKey] || false}
                                                onCheckedChange={(checked) => handleCheckboxChange(pyqKey, !!checked)}
                                                disabled={topic.isOutOfSyllabus && examType === 'jeeMain'}
                                            />
                                            <Label htmlFor={`${pyqKey}-${examType}`} className={cn("w-full font-normal", (topic.isOutOfSyllabus && examType === 'jeeMain') ? "cursor-not-allowed" : "cursor-pointer")}>
                                                {topic.name}
                                            </Label>
                                            {topic.isOutOfSyllabus && examType === 'jeeMain' && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <AlertCircle className="h-4 w-4 text-destructive" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>This topic is not in the official JEE Mains syllabus.</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default function PyqTracker() {
    const [examType, setExamType] = useState<ExamType>('jeeMain');
    const [syllabusData, setSyllabusData] = useState<Syllabus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getSyllabusData();
            setSyllabusData(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <Skeleton className="h-[500px] w-full" />;
    }

    if (!syllabusData) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 bg-destructive/10 border-destructive">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-destructive-foreground">Syllabus Data Not Found</h3>
                <p className="text-destructive-foreground/80">
                    Cannot load PYQ tracker because syllabus data is missing from the database.
                </p>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0 sm:p-4">
                <Tabs defaultValue={examType} onValueChange={(value) => setExamType(value as ExamType)}>
                     <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="jeeMain">JEE Main</TabsTrigger>
                        <TabsTrigger value="jeeAdvanced">JEE Advanced</TabsTrigger>
                    </TabsList>
                    <Tabs defaultValue="physics" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="physics">Physics</TabsTrigger>
                            <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                            <TabsTrigger value="maths">Maths</TabsTrigger>
                        </TabsList>
                        <TabsContent value="physics" className="p-4">
                            <SubjectPyqTracker subject={syllabusData.physics} examType={examType} />
                        </TabsContent>
                        <TabsContent value="chemistry" className="p-4">
                            <SubjectPyqTracker subject={syllabusData.chemistry} examType={examType} />
                        </TabsContent>
                        <TabsContent value="maths" className="p-4">
                            <SubjectPyqTracker subject={syllabusData.maths} examType={examType} />
                        </TabsContent>
                    </Tabs>
                </Tabs>
            </CardContent>
        </Card>
    )
}
