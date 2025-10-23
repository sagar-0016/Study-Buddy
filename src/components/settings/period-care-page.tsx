
'use client';

import {
    Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { periodCareTips } from '@/lib/period-care-data';
import { Card, CardContent } from '@/components/ui/card';


const heartChars = ['♡', '♥', '❣', 'ღ', '♥️', '💗'];

export default function PeriodCarePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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
    
    const floatingHearts = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}%`, // Random horizontal position
                animationDuration: `${Math.random() * 8 + 10}s`, // Random duration between 10s and 18s
                animationDelay: `${Math.random() * 15}s`, // Random delay up to 15s
            };
            const character = heartChars[i % heartChars.length];
            const swayClass = `sway-${(i % 3) + 1}`;
            return { style, character, swayClass, id: i };
        });
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto overflow-hidden">
             <div className="absolute inset-0 -z-10 pointer-events-none">
                {floatingHearts.map(heart => (
                  <div 
                    key={heart.id} 
                    className={`floating-heart ${heart.swayClass}`}
                    style={heart.style}
                  >
                    {heart.character}
                  </div>
                ))}
            </div>

            <div className="text-center mb-8">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mb-4"
                >
                    <Heart className="h-10 w-10 text-red-500" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight">Hey, Superwoman — It’s Okay to Hit Pause 💕</h1>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                    Your body’s doing something incredible right now. So be kind to yourself — you deserve softness, warmth, and maybe a cozy blanket burrito.
                </p>
            </div>
             <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {periodCareTips.map((tip) => (
                    <motion.div key={tip.title} variants={itemVariants}>
                        <Card className="bg-muted/30 border-0 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="p-3 bg-background rounded-full">
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
            <div className="text-center mt-10">
                <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
                    You're doing amazing. This will pass soon, and you'll be back to conquering the world (and JEE)!
                </p>
            </div>
        </div>
    )
}
