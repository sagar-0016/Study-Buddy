

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLectureById, getLecturesForCategory, removeLectureFromCategory } from '@/lib/lectures';
import type { LectureVideo, LectureCategory } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, ArrowLeft, Trash2, FolderOpen, Clapperboard } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


const CategoryVideoCard = ({ lecture, onRemove }: { lecture: LectureVideo; onRemove: (lectureId: string) => void }) => {
    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col border-0 group/card">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove "{lecture.title}" from this category. It will not delete the lecture itself.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(lecture.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Link href={`/lectures/${lecture.id}`} className="block group">
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
            </Link>
            <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold text-base line-clamp-2">{lecture.title}</h3>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-xs text-muted-foreground font-medium">{lecture.channel}</p>
            </CardFooter>
        </Card>
    );
};


export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;
    const { toast } = useToast();
    
    const [category, setCategory] = useState<LectureCategory | null>(null);
    const [lectures, setLectures] = useState<LectureVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!categoryId) return;
        setIsLoading(true);
        const fetchedCategory = await getLectureById(categoryId);
        if (fetchedCategory && fetchedCategory.type === 'category') {
            setCategory(fetchedCategory);
            const fetchedLectures = await getLecturesForCategory(fetchedCategory);
            setLectures(fetchedLectures);
        } else {
            router.push('/lectures'); // Redirect if not a valid category
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [categoryId, router]);

    const handleRemoveLecture = async (lectureId: string) => {
        if (!category) return;
        try {
            await removeLectureFromCategory(category.id, lectureId);
            toast({ title: "Success", description: "Lecture removed from the category."});
            // Refetch data to update the UI
            fetchData();
        } catch (error) {
            console.error("Failed to remove lecture:", error);
            toast({ title: "Error", description: "Could not remove lecture from the category.", variant: "destructive" });
        }
    }

    if (isLoading) {
        return (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                 <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Category Not Found</h1>
                <p className="text-muted-foreground">This lecture category could not be found.</p>
                 <Button asChild className="mt-4">
                    <Link href="/lectures">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                    </Link>
                </Button>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FolderOpen className="h-6 w-6 text-primary" />
                        {category.title}
                    </h1>
                    <p className="text-muted-foreground mt-1">{category.description}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/lectures">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                    </Link>
                </Button>
            </div>

            {lectures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lectures.map(lecture => (
                        <CategoryVideoCard key={lecture.id} lecture={lecture} onRemove={handleRemoveLecture} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
                    <Clapperboard className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">This Category is Empty</h3>
                    <p className="text-muted-foreground">Add some videos to this category from the main lecture library.</p>
                </div>
            )}
        </div>
    )
}
