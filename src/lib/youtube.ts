
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';

export interface AccessStatus {
    blocked: boolean;
    lastAccessRequest: Date | null;
}

/**
 * Fetches the current YouTube block status from Firestore.
 * If the document doesn't exist, it creates it with a default of 'false'.
 * @returns {Promise<AccessStatus>} The current block status and last request time.
 */
export const getYoutubeBlockStatus = async (): Promise<AccessStatus> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          blocked: data.blocked || false,
          lastAccessRequest: data.lastAccessRequest ? (data.lastAccessRequest as Timestamp).toDate() : null,
      };
    } else {
      // If the document doesn't exist, create it with blocked: false
      await setDoc(docRef, { blocked: false, lastAccessRequest: null });
      return { blocked: false, lastAccessRequest: null };
    }
  } catch (error) {
    console.error("Error getting YouTube block status:", error);
    return { blocked: false, lastAccessRequest: null }; // Safely default to false on error
  }
};

/**
 * Updates the YouTube block status in Firestore.
 * @param {boolean} blocked - The new status to set.
 */
export const setYoutubeBlockStatus = async (blocked: boolean): Promise<void> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    await updateDoc(docRef, { blocked });
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

/**
 * Logs a YouTube access request to Firestore and updates the main status document.
 * @param {string} reason - The reason provided by the user for unblocking.
 */
export const logYoutubeAccessRequest = async (reason: string): Promise<void> => {
    const accessRequestRef = collection(db, 'youtube_access_requests');
    const statusRef = doc(db, 'youtubeBlock', 'status');
    const now = serverTimestamp();

    try {
        // Log the detailed request
        await addDoc(accessRequestRef, {
            reason,
            timestamp: now,
        });

        // Update the status document with the timestamp of this request
        await updateDoc(statusRef, {
            lastAccessRequest: now,
        });

    } catch (error) {
        console.error("Error logging YouTube access request:", error);
        throw error;
    }
}
