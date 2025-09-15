

import { db } from './firebase';
import { collection, getDocs, query, limit, doc, getDoc, where, writeBatch, updateDoc } from 'firebase/firestore';


/**
 * Fetches a random tip from the 'tips' collection.
 * @returns A random tip string from the collection.
 */
export const getRandomTip = async (): Promise<string> => {
    try {
        const tipsRef = collection(db, 'tips');
        const q = query(tipsRef, limit(50));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return "Take regular breaks to stay fresh and focused.";
        }

        const tips = querySnapshot.docs.map(doc => doc.data().text as string);
        const randomIndex = Math.floor(Math.random() * tips.length);
        return tips[randomIndex];
    } catch (error) {
        console.error(`Error fetching tips:`, error);
        return "Always double-check your calculations to avoid simple mistakes.";
    }
};

/**
 * Fetches a random one-liner motivation from the 'one-liners' collection.
 * @returns A random one-liner string from the collection.
 */
export const getRandomOneLiner = async (): Promise<string> => {
    try {
        const oneLinersRef = collection(db, 'one-liners');
        const q = query(oneLinersRef, limit(50));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return "Your hard work will pay off. Keep going!";
        }

        const liners = querySnapshot.docs.map(doc => doc.data().text as string);
        const randomIndex = Math.floor(Math.random() * liners.length);
        return liners[randomIndex];
    } catch (error) {
        console.error(`Error fetching one-liners:`, error);
        return "Believe in your potential.";
    }
};

/**
 * Fetches a random feature tip from the 'features' collection, prioritizing unread tips.
 * If all are read, it resets them and fetches one. Marks the fetched tip as read.
 * @returns A random feature tip string from the collection.
 */
export const getRandomFeatureTip = async (): Promise<string> => {
    const defaultTip = "Check out the Syllabus Analysis page to prioritize your studies based on chapter weightage.";
    try {
        const featuresRef = collection(db, 'features');

        // 1. Try to get an unread tip
        const unreadQuery = query(featuresRef, where('read', '==', false), limit(50));
        let querySnapshot = await getDocs(unreadQuery);

        // 2. If no unread tips, reset all and fetch again
        if (querySnapshot.empty) {
            const allDocsSnapshot = await getDocs(featuresRef);
            if (allDocsSnapshot.empty) {
                return defaultTip; // Collection is empty
            }
            
            // Reset all to unread
            const batch = writeBatch(db);
            allDocsSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { read: false });
            });
            await batch.commit();

            // Fetch again from the now unread tips
            querySnapshot = await getDocs(unreadQuery);
        }
        
        if (querySnapshot.empty) {
             return defaultTip; // Should not happen if reset logic works
        }

        const tips = querySnapshot.docs.map(doc => ({ id: doc.id, text: doc.data().text as string }));
        const randomIndex = Math.floor(Math.random() * tips.length);
        const selectedTip = tips[randomIndex];
        
        // 3. Mark the selected tip as read
        if (selectedTip && selectedTip.id) {
            const tipRef = doc(db, 'features', selectedTip.id);
            await updateDoc(tipRef, { read: true });
        }

        return selectedTip.text;

    } catch (error) {
        console.error(`Error fetching feature tips:`, error);
        return defaultTip;
    }
};
