
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/populateNotifications.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';

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

const notifications = [
    {
        text: "A new lecture on 'Rotational Motion' has been added to the library. Check it out!",
        isRead: false,
    },
    {
        text: "The 'Tricky Questions' bank for Chemistry has been updated with new challenging problems.",
        isRead: false,
    },
    {
        text: "Don't forget to review your schedule in the Planner for the upcoming week.",
        isRead: true, // This one won't be shown as a pop-up initially
    },
];

const main = async () => {
    try {
        console.log("Starting to populate 'notifications' collection...");
        const batch = writeBatch(db);
        const notificationsRef = collection(db, "notifications");

        notifications.forEach(notif => {
            const docRef = doc(notificationsRef);
            batch.set(docRef, { ...notif, createdAt: serverTimestamp()});
        });
        
        await batch.commit();

        console.log(`\n✅ Successfully populated 'notifications' collection with ${notifications.length} new entries in Firestore!`);
        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error populating Firestore:", error);
        process.exit(1);
    }
}

main();
