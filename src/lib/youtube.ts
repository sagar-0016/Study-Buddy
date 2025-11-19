
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection, Timestamp, deleteField } from 'firebase/firestore';

export interface AccessStatus {
    blocked: boolean;
    lastAccessRequest: Date | null;
    lastUnblockedAt: Date | null;
}

/**
 * Fetches the current YouTube block status from Firestore.
 * If the document doesn't exist, it creates it with a default of 'true'.
 * @returns {Promise<AccessStatus>} The current block status and last request time.
 */
export const getYoutubeBlockStatus = async (): Promise<AccessStatus> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          blocked: data.blocked !== false, // Default to blocked if undefined
          lastAccessRequest: data.lastAccessRequest ? (data.lastAccessRequest as Timestamp).toDate() : null,
          lastUnblockedAt: data.lastUnblockedAt ? (data.lastUnblockedAt as Timestamp).toDate() : null,
      };
    } else {
      // If the document doesn't exist, create it with blocked: true
      await setDoc(docRef, { blocked: true, lastAccessRequest: null, lastUnblockedAt: null });
      return { blocked: true, lastAccessRequest: null, lastUnblockedAt: null };
    }
  } catch (error) {
    console.error("Error getting YouTube block status:", error);
    return { blocked: true, lastAccessRequest: null, lastUnblockedAt: null }; // Safely default to blocked on error
  }
};

/**
 * Updates the YouTube block status in Firestore.
 * If unblocking, it also clears the request timestamp and sets the unblock time.
 * If blocking, it clears all timestamps.
 * @param {boolean} blocked - The new status to set.
 */
export const setYoutubeBlockStatus = async (blocked: boolean): Promise<void> => {
  try {
    const docRef = doc(db, 'youtubeBlock', 'status');
    const updateData: any = { blocked };

    if (blocked) {
        // When blocking, clear out all timestamps.
        updateData.lastAccessRequest = null;
        updateData.lastUnblockedAt = null;
    } else {
        // When unblocking, set the unblock time and clear the request time.
        updateData.lastAccessRequest = null;
        updateData.lastUnblockedAt = serverTimestamp();
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    if ((error as any).code === 'not-found') {
        const docRef = doc(db, 'youtubeBlock', 'status');
        await setDoc(docRef, { blocked: blocked, lastAccessRequest: null, lastUnblockedAt: null });
    } else {
        console.error("Error setting YouTube block status:", error);
        throw error;
    }
  }
};

/**
 * Aborts an unblock request by clearing the timestamp.
 */
export const clearYoutubeAccessRequest = async (): Promise<void> => {
  try {
    const statusRef = doc(db, 'youtubeBlock', 'status');
    await updateDoc(statusRef, {
      lastAccessRequest: null
    });
  } catch (error) {
    console.error("Error clearing YouTube access request:", error);
    throw error;
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
        await addDoc(accessRequestRef, {
            reason,
            timestamp: now,
        });

        await updateDoc(statusRef, {
            lastAccessRequest: now,
        });

    } catch (error) {
        console.error("Error logging YouTube access request:", error);
        throw error;
    }
}
