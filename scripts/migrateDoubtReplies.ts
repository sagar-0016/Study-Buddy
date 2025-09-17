
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/migrateDoubtReplies.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, doc, collection, writeBatch, Timestamp, where, query } from 'firebase/firestore';

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

// Function to generate a random timestamp between 12:10 AM and 12:20 AM today
const getRandomTimestamp = (): Timestamp => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const minMinutes = 10; // 12:10 AM
    const maxMinutes = 20; // 12:20 AM

    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    const randomSeconds = Math.floor(Math.random() * 60);

    const timestampDate = new Date(today.getTime());
    timestampDate.setMinutes(randomMinutes);
    timestampDate.setSeconds(randomSeconds);

    return Timestamp.fromDate(timestampDate);
};


const main = async () => {
    console.log("Starting migration of admin replies from 'adressedText' to 'thread' subcollection...");
    const batch = writeBatch(db);
    let migrationCount = 0;

    try {
        // Query all 'doubts' collections, whether top-level or nested
        const doubtsGroupRef = collectionGroup(db, 'doubts');
        const q = query(doubtsGroupRef, where('adressedText', '!=', null));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("✅ No doubts found with 'adressedText'. Migration not needed.");
            return;
        }

        console.log(`Found ${querySnapshot.size} doubts with 'adressedText' to migrate.`);

        querySnapshot.forEach(doubtDoc => {
            const doubtData = doubtDoc.data();
            const addressedText = doubtData.adressedText;

            // Ensure addressedText is a non-empty string
            if (typeof addressedText === 'string' && addressedText.trim() !== '') {
                migrationCount++;

                // Path to the 'thread' subcollection for this specific doubt
                const threadCollectionRef = collection(doubtDoc.ref, 'thread');
                const newThreadMessageRef = doc(threadCollectionRef);

                // Prepare the new message document
                const newMessage = {
                    text: addressedText,
                    sender: 'admin',
                    createdAt: getRandomTimestamp()
                };

                // Add the new message to the batch
                batch.set(newThreadMessageRef, newMessage);

                // Optional: Update the original document to show it's migrated
                // batch.update(doubtDoc.ref, { adressedText: null }); // Uncomment to clear old field
            }
        });

        if (migrationCount > 0) {
            await batch.commit();
            console.log(`\n✅ Successfully migrated ${migrationCount} admin replies to the 'thread' subcollection.`);
            console.log("You can review the changes in your Firestore database.");
        } else {
            console.log("\n✅ No actionable replies found in 'adressedText' fields.");
        }

    } catch (error) {
        console.error("\n❌ An error occurred during migration:", error);
        process.exit(1);
    }
    
    console.log("\nScript finished. You can now close this (Ctrl+C).");
}

main();
