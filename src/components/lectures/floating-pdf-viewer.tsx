
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Skeleton } from '../ui/skeleton';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FloatingPdfViewerProps {
  url: string;
  onClose: () => void;
}

export default function FloatingPdfViewer({ url, onClose }: FloatingPdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const { toast } = useToast();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }
    
    function onDocumentLoadError(error: Error) {
        console.error('Error while loading document!', error);
        toast({
            title: "PDF Load Error",
            description: `Failed to load PDF. It might be blocked by the source. Try opening it in a new tab from the notes list.`,
            variant: "destructive",
        });
        onClose();
    }
    
    const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-50" onClick={onClose}>
            <div
                className="relative bg-card border shadow-2xl rounded-lg flex flex-col w-full max-w-4xl h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg">
                    <span className="text-sm font-medium text-muted-foreground ml-2">PDF Viewer</span>
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-grow overflow-auto p-4 bg-muted/20">
                     <Document
                        file={proxiedUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<Skeleton className='h-full w-full'/>}
                        className="flex flex-col items-center gap-4"
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <Page 
                                key={`page_${index + 1}`} 
                                pageNumber={index + 1} 
                                renderTextLayer={false} 
                                className="shadow-lg"
                            />
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
}
