

import { DocumentData, Timestamp } from 'firebase/firestore';
export type AccessLevel = 'full' | 'limited';

export type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export type SyllabusChapter = {
    name: string;
    jeeMainWeightage: number;
    jeeAdvancedWeightage: number;
}

export type Chapter = {
  title: string;
  topics: SyllabusChapter[];
};

export type Subject = {
  label: string;
  chapters: Chapter[];
};

export type Syllabus = {
  physics: Subject;
  chemistry: Subject;
  maths: Subject;
};

export type ChartData = {
  [key: string]: string | number;
}[];

export type BarChartData = {
  subject: string;
  score: number;
}[];

export type ScheduleTask = {
  time: string;
  informal: string;
  formal: string;
};

export type Schedule = {
  type: 'holiday' | 'coaching';
  tasks: ScheduleTask[]; // This will be the transformed, sorted array for the UI
};

export type DayType = 'holiday' | 'coaching';

export type LateNightMessageCollection = '12amto2am' | '2amto5am' | '5amto6am';

export interface Question extends DocumentData {
  id: string;
  questionText: string;
  questionImageURL?: string;
  answerType: 'options' | 'text';
  options?: string[];
  correctAnswer: string;
  isAttempted: boolean;
  subject: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export type Flashcard = {
    id: string;
    question: string;
    answer: string;
};

export interface FlashcardDeck extends DocumentData {
    id: string;
    category: 'main' | 'physics' | 'chemistry' | 'maths';
    title: string;
    description: string;
    icon: string;
    status: 'available' | 'coming-soon' | 'not-available' | 'not-for-you';
    href: string;
    difficulty?: 'Basic' | 'Intermediate' | 'Advanced';
}

export type ProgressData = {
  id: string;
  completed: number;
  total: number;
  subject: string;
};

export type SyllabusTopic = {
  id: string;
  completed: boolean;
};

export type SyllabusTopicWithTimestamp = SyllabusTopic & {
  lastUpdated: Timestamp;
};


export interface RevisionTopic extends DocumentData {
  id: string;
  subject: string;
  chapterName: string;
  topicName: string;
  hints: string;
  hintsImageURL?: string;
  recallSuccess: number;
  recallFails: number;
  lastReviewed: Timestamp;
}

export interface RecallEvent extends DocumentData {
    id: string;
    result: 'success' | 'fail';
    timestamp: Timestamp;
}

export type PyqProgress = {
  id: string;
  completed: boolean;
};

export type PyqProgressWithTimestamp = PyqProgress & {
    lastUpdated: Timestamp;
};

export interface Lecture extends DocumentData {
  id: string;
  title: string;
  description: string;
  subject: 'Physics' | 'Chemistry' | 'Maths';
  videoUrl: string;
  sdVideoUrl?: string;
  thumbnailUrl: string;
  channel: string;
  duration: string;
  createdAt?: string; // Changed from Timestamp
}

export interface LectureNote extends DocumentData {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'link';
}

export interface LectureFeedback extends DocumentData {
    id: string;
    rating: number;
    text: string;
    submittedAt: Timestamp;
}

export interface DoubtMessage extends DocumentData {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    createdAt: Timestamp;
    mediaUrl?: string;
    mediaType?: 'image' | 'link';
}

export interface Doubt extends DocumentData {
    id: string;
    text: string; // The initial question
    subject: string;
    lectureId?: string;
    lectureTitle?: string;
    isAddressed: boolean; // Now means "has an admin replied?"
    isCleared: boolean; // Now means "user has closed the thread"
    createdAt: Timestamp;
    accessLevel: AccessLevel;
    thread?: DoubtMessage[]; // For client-side state
    lastReply?: {
        text: string;
        timestamp: Timestamp;
        sender: 'user' | 'admin';
    }
}


export interface TechnicalHelp extends DocumentData {
    id:string;
    text: string;
    category: string;
    imageUrl?: string;
    isAddressed: boolean;
    isCleared: boolean;
    createdAt: Timestamp;
    adressedText?: string;
}

export interface BrainstormingTopic extends DocumentData {
    id: string;
    subject: string;
    question: string;
    guideline: string;
}

export interface BrainstormingSubmission extends DocumentData {
    id: string;
    topicId: string;
    topicQuestion: string;
    thoughts: string;
    submittedAt: Timestamp;
}

export interface Notification extends DocumentData {
    id: string;
    text: string;
    isRead: boolean;
    createdAt: Timestamp;
}

export interface MoodLog extends DocumentData {
    id: string;
    mood: string;
    createdAt: Timestamp;
}

export interface FeatureTip extends DocumentData {
    id: string;
    text: string;
    read: boolean;
}

export interface PeriodData {
    expectedDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
}

export interface PeriodLog {
    id?: string;
    startDate: Date;
    endDate: Date;
    cycleLength: number;
}
    
