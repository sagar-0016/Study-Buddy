// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/populateFeatures.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs } from 'firebase/firestore';

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
        console.log("Starting to update 'features' collection with 'read' field...");
        const featuresRef = collection(db, "features");
        const querySnapshot = await getDocs(featuresRef);

        if (querySnapshot.empty) {
            console.log("The 'features' collection is empty. Nothing to update.");
            return;
        }

        const batch = writeBatch(db);
        let updatedCount = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Only update documents that do not have the 'read' field
            if (data.read === undefined) {
                batch.update(doc.ref, { read: false });
                updatedCount++;
            }
        });
        
        if (updatedCount > 0) {
            await batch.commit();
            console.log(`\n✅ Successfully updated ${updatedCount} documents in the 'features' collection with 'read: false'.`);
        } else {
            console.log("\n✅ All documents in the 'features' collection already have the 'read' field. No updates were needed.");
        }

        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error updating Firestore:", error);
        process.exit(1);
    }
}

main();
