
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Fetches the current YouTube block status from Firestore.
 * If the document doesn't exist, it creates it with a default of 'false'.
 * @returns {Promise<boolean>} The current block status.
 */
export const getYoutubeBlockStatus = async (): Promise<boolean> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().blocked || false;
    } else {
      // If the document doesn't exist, create it with blocked: false
      await setDoc(docRef, { blocked: false });
      return false;
    }
  } catch (error) {
    console.error("Error getting YouTube block status:", error);
    return false; // Safely default to false on error
  }
};

/**
 * Updates the YouTube block status in Firestore.
 * @param {boolean} blocked - The new status to set.
 */
export const setYoutubeBlockStatus = async (blocked: boolean): Promise<void> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    await updateDoc(docRef, { blocked: blocked });
  } catch (error) {
    // If update fails because the doc doesn't exist, create it.
    if ((error as any).code === 'not-found') {
        const docRef = doc(db, 'youtubeBlock', 'status');
        await setDoc(docRef, { blocked: blocked });
    } else {
        console.error("Error setting YouTube block status:", error);
        throw error; // Re-throw other errors
    }
  }
};
