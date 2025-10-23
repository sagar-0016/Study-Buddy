
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
    
    const { hearts, swayKeyframes } = useMemo(() => {
        const generatedHearts = Array.from({ length: 15 }).map((_, i) => {
            const swayName = `sway-${i}`;
            const swayDuration = Math.random() * 4 + 3; // 3s to 7s
            const startX = Math.random() * 80 - 40; // -40px to +40px
            const endX = Math.random() * 80 - 40; // -40px to +40px

            const style = {
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 8 + 10}s, ${swayDuration}s`,
                animationDelay: `${Math.random() * 15}s, ${Math.random() * -swayDuration}s`,
                animationName: `float, ${swayName}`,
                animationTimingFunction: 'linear, ease-in-out',
                animationIterationCount: 'infinite, infinite',
                animationDirection: 'normal, alternate',
            };
            const character = heartChars[i % heartChars.length];
            
            const keyframe = `
                @keyframes ${swayName} {
                    from { transform: translateX(0px); }
                    to { transform: translateX(${endX - startX}px); }
                }
            `;

            return { style, character, id: i, keyframe, initialTransform: `translateX(${startX}px)` };
        });

        return {
            hearts: generatedHearts,
            swayKeyframes: generatedHearts.map(h => h.keyframe).join('\n')
        };
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto overflow-hidden">
             <style jsx>{swayKeyframes}</style>
             <div className="absolute inset-0 -z-10 pointer-events-none">
                {hearts.map(heart => (
                  <div 
                    key={heart.id} 
                    className="floating-heart"
                    style={{ ...heart.style, transform: heart.initialTransform }}
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
