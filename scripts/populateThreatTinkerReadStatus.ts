
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/populateThreatTinkerReadStatus.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs, doc } from 'firebase/firestore';

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

const collectionsToUpdate = [
    'tinkering-messages',
    'threatening-messages',
];

const main = async () => {
    try {
        console.log("Starting to backfill 'read' status on tinkering/threatening collections...");
        const batch = writeBatch(db);
        let updatedCount = 0;

        for (const collectionName of collectionsToUpdate) {
            const collectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(collectionRef);

            if (querySnapshot.empty) {
                console.log(`- Collection '${collectionName}' is empty. Skipping.`);
                continue;
            }

            querySnapshot.forEach(docSnap => {
                if (docSnap.data().read === undefined) {
                    batch.update(docSnap.ref, { read: false });
                    updatedCount++;
                }
            });
            console.log(`- Prepared ${querySnapshot.size} documents in '${collectionName}' for update.`);
        }

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`\n✅ Successfully added 'read: false' to ${updatedCount} documents across ${collectionsToUpdate.length} collections!`);
        } else {
            console.log("\n✅ All relevant documents already have the 'read' field. No updates were needed.");
        }
        
        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error populating Firestore:", error);
        process.exit(1);
    }
}

main();
