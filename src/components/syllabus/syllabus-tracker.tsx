
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { Subject, Chapter, SyllabusChapter, Syllabus } from '@/lib/types';
import { listenToSyllabusProgress, updateSyllabusTopicStatus, getSyllabusData } from '@/lib/syllabus';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck, AreaChart, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function SubjectSyllabus({ subject }: { subject: Subject }) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenToSyllabusProgress((progressData) => {
        const initialState: Record<string, boolean> = {};
        progressData.forEach(item => {
            initialState[item.id] = item.completed;
        });
        setCheckedState(initialState);
        setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [subject]);
  
  const generateTopicKey = (subjectLabel: string, chapterTitle: string, topicName: string) => {
    // This regex removes Roman numerals (like I, II) and trims whitespace.
    const cleanChapterTitle = chapterTitle.replace(/\s(I|II|III|IV|V)$/, '').trim();
    return `${subjectLabel}-${cleanChapterTitle}-${topicName}`;
  };

  const handleCheckboxChange = async (topicKey: string, checked: boolean) => {
    // Optimistically update UI to feel instant
    setCheckedState(prevState => ({ ...prevState, [topicKey]: checked }));
    
    // Update Firestore in the background
    await updateSyllabusTopicStatus(topicKey, checked);
  };

  const { completedTopics, totalTopics, progress } = useMemo(() => {
    let completed = 0;
    let total = 0;
    subject.chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        total++;
        const key = generateTopicKey(subject.label, chapter.title, topic.name);
        if (checkedState[key]) {
          completed++;
        }
      });
    });
    return {
      completedTopics: completed,
      totalTopics: total,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [checkedState, subject]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full mt-4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="space-y-2">
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-primary">{completedTopics} / {totalTopics} topics</span>
        </div>
        <Progress value={progress} />
      </div>

      <Accordion type="multiple" className="w-full">
        {subject.chapters.map((chapter: Chapter) => (
          <AccordionItem key={chapter.title} value={chapter.title}>
            <AccordionTrigger>{chapter.title}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {chapter.topics.map(topic => {
                  const topicKey = generateTopicKey(subject.label, chapter.title, topic.name);
                  return (
                    <div key={topic.name} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={topicKey}
                        checked={checkedState[topicKey] || false}
                        onCheckedChange={(checked) => handleCheckboxChange(topicKey, !!checked)}
                      />
                      <Label htmlFor={topicKey} className="w-full font-normal cursor-pointer">
                        {topic.name}
                      </Label>
                      {topic.isOutOfSyllabus && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This topic is not in the official JEE Mains 2024 syllabus.</p>
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
  );
}

export default function SyllabusTracker() {
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!syllabusData) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 bg-destructive/10 border-destructive">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive-foreground">Syllabus Data Not Found</h3>
            <p className="text-destructive-foreground/80">
                The syllabus data could not be loaded from the database. Please run the population script.
            </p>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0 sm:p-4">
          <Tabs defaultValue="physics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="maths">Maths</TabsTrigger>
            </TabsList>
            <TabsContent value="physics" className="p-4">
              <SubjectSyllabus subject={syllabusData.physics} />
            </TabsContent>
            <TabsContent value="chemistry" className="p-4">
              <SubjectSyllabus subject={syllabusData.chemistry} />
            </TabsContent>
            <TabsContent value="maths" className="p-4">
              <SubjectSyllabus subject={syllabusData.maths} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Note:</span> For the chapters which you have marked as completed, remember to practice their PYQs.
        </p>
        <div className="flex gap-2 flex-shrink-0">
             <Button asChild variant="secondary">
                <Link href="/pyq">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Track PYQs
                </Link>
            </Button>
            <Button asChild>
                <Link href="/syllabus/analysis">
                    <AreaChart className="mr-2 h-4 w-4" />
                    Analyse Weightage
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
