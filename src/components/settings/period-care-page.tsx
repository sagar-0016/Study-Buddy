
"use client";

import {
    Heart,
    Droplets,
    Wind,
    Heater,
    Bed,
    Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';


const periodCareTips = [
    {
        icon: Droplets,
        title: "Stay Hydrated",
        text: "Drinking plenty of water can help reduce bloating and ease cramps. It's simple but really effective.",
        color: "text-blue-500",
    },
    {
        icon: Heater,
        title: "Warm Compresses are Your Friend",
        text: "Using a heating pad, a warm water bottle, or even a warm cloth on your lower abdomen can work wonders for cramps. It's like a warm hug for your muscles.",
        color: "text-orange-500",
    },
    {
        icon: Utensils,
        title: "Nourish Your Body",
        text: "Some find that salty foods (like chips or some Chinese dishes) can make bloating worse. A banana can be great for potassium, but it's also okay to have your favorite comfort food!",
        color: "text-green-500",
    },
    {
        icon: Wind,
        title: "Gentle Movement",
        text: "Light stretching, yoga, or a short walk can really help ease cramps and boost your mood. No need for intense workouts.",
        color: "text-purple-500",
    },
    {
        icon: Bed,
        title: "Prioritize Rest",
        text: "Your body is doing a lot of work. If you feel tired, listen to it. A nap isn't lazy, it's necessary for recovery.",
        color: "text-yellow-500",
    },
];

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
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mb-4"
                >
                    <Heart className="h-10 w-10 text-red-500" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight">It's Okay to Slow Down</h1>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                    Listen to your body. Being kind to yourself is the most productive thing you can do right now.
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
