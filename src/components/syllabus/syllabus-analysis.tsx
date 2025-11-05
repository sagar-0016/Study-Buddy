

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Subject, SyllabusChapter, Syllabus } from '@/lib/types';
import { getSyllabusData } from '@/lib/syllabus';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Pencil, Edit, AlertTriangle, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PriorityDot } from './priority-dot';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


type ExamType = 'jeeMain' | 'jeeAdvanced';

type TopicWithUnit = SyllabusChapter & { unit: string };

function SubjectAnalysis({ subject }: { subject: Subject }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('weightage-desc');
  const [isSuggestMode, setIsSuggestMode] = useState(false);
  const [examType, setExamType] = useState<ExamType>('jeeMain');

  const allTopicsWithUnit = useMemo(() => {
    return subject.chapters.flatMap(chapter => 
        chapter.topics.map(topic => ({
            ...topic,
            unit: chapter.title
        }))
    );
  }, [subject]);

  const filteredAndSortedTopics = useMemo(() => {
    let topics: TopicWithUnit[] = [...allTopicsWithUnit];
    const weightageKey = examType === 'jeeMain' ? 'jeeMainWeightage' : 'jeeAdvancedWeightage';

    if (filter !== 'all') {
      topics = topics.filter(c => c[weightageKey] === parseInt(filter));
    }

    if (sort === 'weightage-desc') {
      topics.sort((a, b) => a[weightageKey] - b[weightageKey]);
    } else if (sort === 'weightage-asc') {
      topics.sort((a, b) => b[weightageKey] - a[weightageKey]);
    } else if (sort === 'alphabetical') {
      topics.sort((a, b) => a.name.localeCompare(b.name));
    }

    return topics;
  }, [allTopicsWithUnit, filter, sort, examType]);

  const weightageKey = examType === 'jeeMain' ? 'jeeMainWeightage' : 'jeeAdvancedWeightage';

  const TopicItem = ({ topic }: { topic: TopicWithUnit }) => {
    const topicContent = (
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{topic.name}</p>
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
        <p className="text-sm text-muted-foreground">{topic.unit}</p>
      </div>
    );

    return (
      <Card className={cn("transition-colors", topic.isOutOfSyllabus && examType === 'jeeMain' && "bg-muted/50")}>
          <div className="flex items-center justify-between p-4">
              {topic.details && examType === 'jeeMain' ? (
                  <Popover>
                      <PopoverTrigger asChild>
                          <div className="cursor-pointer">{topicContent}</div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 max-h-80 overflow-y-auto" side="bottom" align="start">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="whitespace-pre-wrap">{topic.details}</p>
                          </div>
                      </PopoverContent>
                  </Popover>
              ) : (
                  topicContent
              )}
              
              <div className="flex items-center gap-4 pl-4">
                  <PriorityDot priority={topic[weightageKey]} />
                  {isSuggestMode && (
                      <SuggestChangeDialog topic={topic}>
                          <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                          </Button>
                      </SuggestChangeDialog>
                  )}
              </div>
          </div>
      </Card>
    );
  };


  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="1">Priority 1</SelectItem>
                        <SelectItem value="2">Priority 2</SelectItem>
                        <SelectItem value="3">Priority 3</SelectItem>
                        <SelectItem value="4">Priority 4</SelectItem>
                        <SelectItem value="5">Priority 5</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weightage-desc">Priority: High to Low</SelectItem>
                        <SelectItem value="weightage-asc">Priority: Low to High</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Tabs value={examType} onValueChange={(value) => setExamType(value as ExamType)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="jeeMain">JEE Main</TabsTrigger>
                    <TabsTrigger value="jeeAdvanced">JEE Advanced</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        
        <div className="space-y-3">
            {filteredAndSortedTopics.map(topic => (
                <TopicItem key={topic.name} topic={topic} />
            ))}
        </div>
        
        <Separator className="my-6" />

        <div className="flex justify-end">
            <Button variant={isSuggestMode ? "default" : "outline"} onClick={() => setIsSuggestMode(!isSuggestMode)}>
                <Edit className="mr-2 h-4 w-4" />
                {isSuggestMode ? "Finish Suggesting" : "Suggest Changes"}
            </Button>
        </div>
    </div>
  );
}

const SuggestChangeDialog = ({ topic, children }: { topic: TopicWithUnit, children: React.ReactNode}) => {
    const [suggestion, setSuggestion] = useState('');

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Suggest Priority Change</DialogTitle>
                    <DialogDescription>
                        Your feedback on the priority for "{topic.name}" helps improve the app. This will be reviewed.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="suggestion">Your Suggestion</Label>
                    <Textarea 
                        id="suggestion"
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="e.g., 'I think this chapter should be Priority 1 because it has appeared frequently in recent years...'"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                     <Button>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Suggestion
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SyllabusAnalysis() {
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
          <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
      )
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
    <Card>
      <CardContent className="p-0 sm:p-4">
        <Tabs defaultValue="physics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="physics">Physics</TabsTrigger>
            <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
            <TabsTrigger value="maths">Maths</TabsTrigger>
          </TabsList>
          <TabsContent value="physics" className="p-4">
            <SubjectAnalysis subject={syllabusData.physics} />
          </TabsContent>
          <TabsContent value="chemistry" className="p-4">
            <SubjectAnalysis subject={syllabusData.chemistry} />
          </TabsContent>
          <TabsContent value="maths" className="p-4">
            <SubjectAnalysis subject={syllabusData.maths} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
