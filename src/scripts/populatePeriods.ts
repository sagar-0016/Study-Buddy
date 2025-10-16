
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./src/scripts/populatePeriods.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { add } from 'date-fns';

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

const main = async () => {
    try {
        console.log("Setting up initial period data...");

        const periodRef = doc(db, 'periods', 'current');
        
        // Set the initial expected date to 28 days from now
        const defaultExpectedDate = add(new Date(), { days: 28 });
        const initialData = { 
            expectedDate: Timestamp.fromDate(defaultExpectedDate),
            actualStartDate: null,
            actualEndDate: null,
        };

        await setDoc(periodRef, initialData);

        console.log("\n✅ Successfully created initial 'periods/current' document in Firestore.");
        console.log("The next expected date is set to approximately 28 days from now.");
        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error setting up initial period data:", error);
        process.exit(1);
    }
}

main();
