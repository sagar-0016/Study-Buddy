
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, Moon } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getDayType, setDayType, getSchedule, getLateNightMessage } from '@/lib/schedule';
import type { Schedule, ScheduleTask, DayType } from '@/lib/types';
import type { AccessLevel } from '@/context/auth-context';

const TaskItem = ({ task, isActive, isUpcoming = false, accessLevel }: { task: ScheduleTask, isActive: boolean, isUpcoming?: boolean, accessLevel: AccessLevel | null }) => {
    const getVariantClasses = () => {
        if (isActive) return 'bg-primary/10 ring-2 ring-primary';
        if (isUpcoming) return 'bg-accent/10 ring-2 ring-accent';
        return 'bg-muted/50';
    }
    const getTextClasses = () => {
        if (isActive) return 'text-primary';
        if (isUpcoming) return 'text-accent';
        return 'text-muted-foreground';
    }
    
    const taskDescription = accessLevel === 'full' ? task.informal : task.formal;

    return (
        <div className={`p-4 rounded-lg transition-all duration-300 ${getVariantClasses()}`}>
            <div className={`flex items-center font-semibold ${getTextClasses()}`}>
                <Clock className="h-5 w-5 mr-2" />
                <p>{task.time}</p>
            </div>
            <h3 className={`text-lg font-bold mt-2 whitespace-pre-wrap ${!isActive && 'text-foreground/80'}`}>{taskDescription}</h3>
        </div>
    )
}

const DayTypeSelector = ({ onSelect }: { onSelect: (type: DayType) => void }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg text-center">
        <HelpCircle className="h-10 w-10 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">What's the plan for today?</h3>
        <p className="text-muted-foreground mb-4">Let me know if it's a coaching day or a holiday to pull up the right schedule.</p>
        <div className="flex gap-4">
            <Button onClick={() => onSelect('coaching')} size="lg">Coaching Day</Button>
            <Button onClick={() => onSelect('holiday')} variant="outline" size="lg">Holiday</Button>
        </div>
    </div>
)

export default function CurrentTask() {
  const [dayType, setDayTypeState] = useState<DayType | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lateNightMessage, setLateNightMessage] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);

  useEffect(() => {
    const level = (typeof window !== 'undefined' && typeof document !== 'undefined') ? localStorage.getItem('study-buddy-access-level') as AccessLevel | null : null;
    setAccessLevel(level);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentHour = currentTime.getHours();
        let messageCollection: '12amto2am' | '2amto5am' | '5amto6am' | null = null;
        if (currentHour >= 0 && currentHour < 2) messageCollection = '12amto2am';
        else if (currentHour >= 2 && currentHour < 5) messageCollection = '2amto5am';
        else if (currentHour >= 5 && currentHour < 6) messageCollection = '5amto6am';

        if(messageCollection) {
            const msg = await getLateNightMessage(messageCollection);
            setLateNightMessage(msg);
        } else {
            setLateNightMessage(null);
        }

        const type = await getDayType();
        setDayTypeState(type);
        if (type) {
          const scheduleData = await getSchedule(type);
          setSchedule(scheduleData);
        }
      } catch (err) {
        console.error("Error fetching schedule info:", err);
        setError("Could not load schedule information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentTime]);

  const handleDayTypeSelect = async (type: DayType) => {
    setIsLoading(true);
    try {
        await setDayType(type);
        setDayTypeState(type);
        const scheduleData = await getSchedule(type);
        setSchedule(scheduleData);
    } catch(err) {
        console.error("Error setting day type:", err);
        setError("Could not save your choice. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }

  const getActiveTaskIndex = (tasks: ScheduleTask[]) => {
    if (!tasks || tasks.length === 0) return -1;
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let activeIndex = -1;
    // Find the last task that has started
    for (let i = tasks.length - 1; i >= 0; i--) {
      const taskTime = tasks[i].time.split(':');
      const taskMinutes = parseInt(taskTime[0]) * 60 + parseInt(taskTime[1]);
      if (currentMinutes >= taskMinutes) {
        activeIndex = i;
        break;
      }
    }
     // If no task has started yet, default to the first task.
    if (activeIndex === -1 && tasks.length > 0) {
        return 0;
    }

    return activeIndex;
  }

  const renderContent = () => {
    if (isLoading || !accessLevel) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }
    if (error) {
        return <p className="text-destructive text-center">{error}</p>;
    }
    if (!dayType) {
        return <DayTypeSelector onSelect={handleDayTypeSelect} />;
    }
    
    const tasks = schedule?.tasks;

    if (!tasks || tasks.length === 0) {
        return <p className="text-muted-foreground text-center">No tasks found for a {dayType} schedule.</p>;
    }
    
    if (lateNightMessage) {
        const firstTask = tasks.length > 0 ? tasks[0] : null;
        const secondTask = tasks.length > 1 ? tasks[1] : null;
        return (
            <div className="space-y-6">
                <div className="p-4 bg-accent/10 rounded-lg text-foreground border-l-4 border-accent">
                    <div className="flex items-start">
                        <Moon className="h-5 w-5 mr-3 mt-1 text-accent flex-shrink-0" />
                        <p className="italic whitespace-pre-wrap">"{lateNightMessage}"</p>
                    </div>
                </div>

                {firstTask && (
                     <div>
                        <h4 className="text-sm font-semibold text-accent mb-2">Upcoming...</h4>
                        <TaskItem task={firstTask} isActive={false} isUpcoming={true} accessLevel={accessLevel} />
                    </div>
                )}
                {secondTask && (
                     <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Later upcoming...</h4>
                        <TaskItem task={secondTask} isActive={false} isUpcoming={false} accessLevel={accessLevel} />
                    </div>
                )}
            </div>
        )
    }
    
    const activeTaskIndex = getActiveTaskIndex(tasks);
    if(activeTaskIndex === -1){
        return <p className="text-muted-foreground text-center">No tasks scheduled for today.</p>;
    }

    const currentTask = tasks[activeTaskIndex];
    const nextTask = activeTaskIndex + 1 < tasks.length ? tasks[activeTaskIndex + 1] : null;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-semibold text-primary mb-2">Current Task</h4>
                <TaskItem task={currentTask} isActive={true} accessLevel={accessLevel} />
            </div>

            {nextTask && (
                 <div>
                    <h4 className="text-sm font-semibold text-accent mb-2">Upcoming...</h4>
                    <TaskItem task={nextTask} isActive={false} isUpcoming={true} accessLevel={accessLevel} />
                </div>
            )}
            
            {!nextTask && (
                <p className="text-center text-muted-foreground pt-4">This is the last task for today. Well done!</p>
            )}
        </div>
    )
  }

  return (
    <Card className="transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg border-0">
      <CardHeader>
        <CardTitle>
            {dayType ? `Today's Focus (${dayType.charAt(0).toUpperCase() + dayType.slice(1)})` : "Today's Focus"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
