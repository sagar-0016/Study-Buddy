
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/populateFeatures.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';

// IMPORTANT: Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBv26GpTGNi56cOHY23H4JWk_Q0iu7WRbg",
  authDomain: "study-buddy-7357a.firebaseapp.com",
  projectId: "study-buddy-7357a",
  storageBucket: "study-buddy-7357a.appspot.com",
  messagingSenderId: "286721031921",
  appId: "1:286721031921:web:bdebedc76dd6081dbfb350"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase initialized for script.");

const features = [
    { text: "Did you know? In the Lecture player, you can use the spacebar to play/pause, 'f' to toggle fullscreen, and arrow keys to skip forward or backward.", read: false },
    { text: "Want to change your schedule? The Study Planner has a 'discipline challenge' to make you think twice before changing your routine.", read: false },
    { text: "The Syllabus Analysis page lets you filter and sort topics by their JEE Main and Advanced weightage to help you prioritize.", read: false },
    { text: "In the Revision Centre, you can browse all your topics or start a 'Recall Session' that intelligently picks topics for you based on your performance.", read: false },
    { text: "Use the 'AI Feedback' page to get personalized suggestions on what to study next based on your recent activity across the app.", read: false },
    { text: "You can upload your own PDF notes for any lecture in the Lecture Library, and view them right next to the video player.", read: false },
    { text: "The PYQ Tracker is separate for JEE Main and Advanced. Toggle between them to track your progress for each exam.", read: false },
    { text: "In the Doubt Centre, you can upload an image along with your question to provide more context.", read: false },
    { text: "Don't like the background? Go to Settings and upload your own custom background image for a more personalized feel.", read: false },
    { text: "In the News section, you can switch between live news fetched from APIs and AI-generated articles for reading practice.", read: false },
    { text: "The Motivation Corner on the homepage can be configured in Settings to show personal messages, AI-generated ones, or a mix of both.", read: false },
    { text: "In the Revision Centre, click the pencil icon on any topic in the 'Browse' tab to edit its hints or details.", read: false }
];

const main = async () => {
    try {
        console.log("Starting to populate 'features' collection...");
        const batch = writeBatch(db);
        const featuresRef = collection(db, "features");

        features.forEach(feature => {
            const docRef = doc(featuresRef); // Firestore will auto-generate an ID
            batch.set(docRef, feature);
        });
        
        await batch.commit();

        console.log(`\n✅ Successfully populated 'features' collection with ${features.length} new entries in Firestore!`);
        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error populating Firestore:", error);
        process.exit(1);
    }
}

main();
