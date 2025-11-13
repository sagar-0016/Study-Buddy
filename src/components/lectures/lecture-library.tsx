

'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLectures, createLectureCategory, addLecturesToCategory } from '@/lib/lectures';
import type { Lecture, LectureVideo, LectureCategory } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Clapperboard, Play, Folder, Plus, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

const VideoCard = ({ lecture }: { lecture: LectureVideo }) => {
  return (
    <Link href={`/lectures/${lecture.id}`} className="block group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col border-0">
            <div className="relative aspect-video">
            <Image 
                src={lecture.thumbnailUrl} 
                alt={`Thumbnail for ${lecture.title}`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Play className="h-12 w-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
            </div>
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none text-xs">{lecture.duration}</Badge>
            </div>
            <CardContent className="p-4 flex-grow">
            <Badge variant={lecture.subject === 'Physics' ? 'default' : lecture.subject === 'Chemistry' ? 'destructive' : 'secondary'} className="mb-2">
                {lecture.subject}
            </Badge>
            <h3 className="font-semibold text-base line-clamp-2">{lecture.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{lecture.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-xs text-muted-foreground font-medium">{lecture.channel}</p>
            </CardFooter>
        </Card>
    </Link>
  );
};

const AddVideosToCategoryDialog = ({ category, lectures, onVideosAdded }: { category: LectureCategory, lectures: LectureVideo[], onVideosAdded: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const uncategorizedLectures = useMemo(() => {
        return lectures.filter(lecture => !lecture.categoryId);
    }, [lectures]);
    
    const filteredLectures = useMemo(() => {
        if (!searchTerm) return uncategorizedLectures;
        const lowercasedTerm = searchTerm.toLowerCase();
        return uncategorizedLectures.filter(lecture => 
            lecture.title.toLowerCase().includes(lowercasedTerm) ||
            lecture.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [uncategorizedLectures, searchTerm]);

    const handleToggleSelection = (lectureId: string) => {
        setSelectedLectures(prev => 
            prev.includes(lectureId) ? prev.filter(id => id !== lectureId) : [...prev, lectureId]
        );
    };

    const handleAddVideos = async () => {
        if (selectedLectures.length === 0) return;
        setIsSaving(true);
        try {
            const lecturesToAdd = lectures.filter(l => selectedLectures.includes(l.id));
            await addLecturesToCategory(category.id, lecturesToAdd);
            toast({ title: "Success", description: `${selectedLectures.length} video(s) added to category.` });
            setSelectedLectures([]);
            setSearchTerm('');
            onVideosAdded();
            setIsOpen(false);
        } catch (error) {
            console.error("Error adding lectures to category:", error);
            toast({ title: "Error", description: "Could not add videos to the category.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="secondary" size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl flex flex-col h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Add Videos to "{category.title}"</DialogTitle>
                    <DialogDescription>Select videos to include in this category. Only uncategorized videos are shown.</DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search uncategorized videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <ScrollArea className="flex-grow border rounded-md">
                    <div className="p-4 space-y-2">
                        {filteredLectures.length > 0 ? filteredLectures.map(lecture => (
                            <div key={lecture.id} onClick={() => handleToggleSelection(lecture.id)} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                                <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0">
                                    <Image src={lecture.thumbnailUrl} alt={lecture.title} fill className="object-cover" />
                                    {selectedLectures.includes(lecture.id) && (
                                        <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
                                            <Check className="h-8 w-8 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold line-clamp-1">{lecture.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{lecture.channel}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No more uncategorized videos available.</p>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddVideos} disabled={isSaving || selectedLectures.length === 0}>
                        {isSaving ? <Loader2 className="animate-spin" /> : `Add ${selectedLectures.length} Video(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const CategoryCard = ({ category, lectures, onVideosAdded }: { category: LectureCategory, lectures: LectureVideo[], onVideosAdded: () => void }) => {
    return (
         <Card className="overflow-hidden transition-all duration-300 h-full flex flex-col border-0 relative group/cat">
            <Link href={`/lectures/category/${category.id}`} className="block group flex-grow">
                <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                    {category.thumbnailUrl ? (
                         <Image 
                            src={category.thumbnailUrl} 
                            alt={`Thumbnail for ${category.title}`} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <Folder className="h-16 w-16 text-muted-foreground" />
                    )}
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>
                <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold text-base line-clamp-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">{category.description}</p>
                </CardContent>
            </Link>
            <CardFooter className="p-2 pt-0 flex-col gap-2">
                 <p className="text-xs text-muted-foreground font-medium w-full text-center">{category.lectureIds?.length || 0} video(s)</p>
            </CardFooter>
            <div className="opacity-0 group-hover/cat:opacity-100 transition-opacity">
                <AddVideosToCategoryDialog category={category} lectures={lectures} onVideosAdded={onVideosAdded} />
            </div>
        </Card>
    )
}

const CreateCategoryDialog = ({ onCategoryCreated }: { onCategoryCreated: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleCreateCategory = async () => {
        if (!title) return;
        setIsSaving(true);
        try {
            await createLectureCategory(title, description);
            toast({ title: "Success!", description: `Category "${title}" created.` });
            setTitle('');
            setDescription('');
            onCategoryCreated();
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating category:", error);
            toast({ title: "Error", description: "Could not create the category.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Create Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a New Category</DialogTitle>
                    <DialogDescription>Group your lectures into categories for better organization.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Category Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Advanced Mechanics" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of this category." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCategory} disabled={!title || isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function LectureLibrary() {
  const [allContent, setAllContent] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLectures = async () => {
    setIsLoading(true);
    const fetchedContent = await getLectures();
    setAllContent(fetchedContent);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchLectures();
  }, []);

  const { videos, categories } = useMemo(() => {
      const videos: LectureVideo[] = [];
      const categories: LectureCategory[] = [];
      allContent.forEach(item => {
        // A lecture is a video if its type is 'video' OR if the type field does not exist (for backward compatibility)
        if (item.type === 'video' || !item.type) {
            videos.push(item as LectureVideo);
        } else if (item.type === 'category') {
            categories.push(item as LectureCategory);
        }
      });
      return { videos, categories };
  }, [allContent]);

  const filteredContent = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // Filter categories based on search term
    const filteredCategories = searchTerm 
        ? categories.filter(cat => 
            cat.title.toLowerCase().includes(lowercasedTerm) ||
            (cat.description && cat.description.toLowerCase().includes(lowercasedTerm))
          )
        : categories;

    // Filter videos that are not in any category
    const uncategorizedVideos = videos.filter(vid => !vid.categoryId);
    
    // If there's a search term, filter the uncategorized videos as well
    const filteredUncategorizedVideos = searchTerm 
        ? uncategorizedVideos.filter(vid => 
            vid.title.toLowerCase().includes(lowercasedTerm) ||
            (vid.description && vid.description.toLowerCase().includes(lowercasedTerm)) ||
            vid.subject.toLowerCase().includes(lowercasedTerm) ||
            vid.channel.toLowerCase().includes(lowercasedTerm)
          )
        : uncategorizedVideos; // Otherwise, show all uncategorized videos

    // Combine the filtered categories and filtered uncategorized videos
    return [...filteredCategories, ...filteredUncategorizedVideos];
  }, [videos, categories, searchTerm]);

  if (isLoading) {
    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Skeleton className="h-10 w-full sm:flex-1" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search lectures or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <CreateCategoryDialog onCategoryCreated={fetchLectures} />
      </div>

      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map(item =>
             item.type === 'category' ? (
                <CategoryCard key={item.id} category={item as LectureCategory} lectures={videos} onVideosAdded={fetchLectures} />
             ) : (
                <VideoCard key={item.id} lecture={item as LectureVideo} />
             )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
          <Clapperboard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Lectures Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or check back later for new content.</p>
        </div>
      )}
    </div>
  );
}
