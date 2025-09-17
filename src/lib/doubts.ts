

import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  collectionGroup,
  where,
  QueryConstraint,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Doubt, AccessLevel, DoubtMessage } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image to Firebase Storage for a doubt.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
const uploadDoubtImage = async (file: File): Promise<string> => {
    const fileId = uuidv4();
    const storageRef = ref(storage, `doubts/${fileId}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

/**
 * Adds a new doubt and its initial message to Firestore.
 * Handles optional image upload and includes access level.
 * @param data - The data for the new doubt.
 * @returns The ID of the newly created document.
 */
export const addDoubt = async (data: {
  text: string;
  subject: string;
  accessLevel: AccessLevel;
  lectureId?: string;
  lectureTitle?: string;
  imageFile?: File;
}): Promise<string> => {
    const isLectureDoubt = data.lectureId;
    const doubtsCollectionRef = isLectureDoubt 
        ? collection(db, 'lectures', data.lectureId!, 'doubts')
        : collection(db, 'doubts');

    const batch = writeBatch(db);
    const now = serverTimestamp();

    // 1. Create the main doubt document in the correct collection
    const doubtRef = doc(doubtsCollectionRef);
    const doubtPayload: Omit<Doubt, 'id' | 'thread' | 'lastReply'> = {
        text: data.text,
        subject: data.subject,
        accessLevel: data.accessLevel,
        isAddressed: false,
        isCleared: false,
        createdAt: now as Timestamp,
        ...(data.lectureId && { lectureId: data.lectureId }),
        ...(data.lectureTitle && { lectureTitle: data.lectureTitle }),
    };
    batch.set(doubtRef, doubtPayload);

    // 2. Create the first message in the 'thread' subcollection
    const threadRef = doc(collection(doubtRef, 'thread'));
    const messagePayload: Omit<DoubtMessage, 'id'> = {
        text: data.text,
        sender: 'user',
        createdAt: now as Timestamp,
    };
    
    if (data.imageFile) {
        messagePayload.mediaUrl = await uploadDoubtImage(data.imageFile);
        messagePayload.mediaType = 'image';
    }
    batch.set(threadRef, messagePayload);

    // 3. Update the main doubt doc with the last reply info
    batch.update(doubtRef, {
        'lastReply.text': data.text,
        'lastReply.timestamp': now,
    });
    
    await batch.commit();
    return doubtRef.id;
};

/**
 * Adds a reply message to a doubt's thread.
 * @param {string} doubtId - The ID of the doubt document.
 * @param {Omit<DoubtMessage, 'id' | 'createdAt'>} messageData - The message data.
 * @returns {Promise<string>} The ID of the new message document.
 */
export const addReplyToDoubt = async (doubtId: string, messageData: { text: string; sender: 'user' | 'admin' }): Promise<string> => {
    // This function needs the full path to the doubt, which we don't have here.
    // This logic is now handled inside the DoubtThreadDialog which has the full doubt object.
    // For now, this function is simplified and may need to be removed or adapted if used elsewhere.
    console.warn("addReplyToDoubt is simplified and assumes a top-level doubt. Refactor if needed for lecture doubts.");
    const doubtRef = doc(db, 'doubts', doubtId);
    const threadRef = collection(doubtRef, 'thread');
    const now = serverTimestamp();
    
    const newDocRef = await addDoc(threadRef, {
        ...messageData,
        createdAt: now,
    });
    
    await updateDoc(doubtRef, {
        'lastReply.text': messageData.text,
        'lastReply.timestamp': now,
    });

    return newDocRef.id;
};

/**
 * Fetches all relevant doubts based on user's access level from both top-level and nested collections.
 * @param {AccessLevel} accessLevel - The access level of the current user.
 * @returns {Promise<Doubt[]>} An array of doubt objects, sorted by creation time.
 */
export const getDoubts = async (accessLevel: AccessLevel): Promise<Doubt[]> => {
  try {
    const doubtsGroupRef = collectionGroup(db, 'doubts');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (accessLevel === 'limited') {
      constraints.push(where('accessLevel', '==', 'limited'));
    }

    const q = query(doubtsGroupRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const allDoubts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
    
    return allDoubts;
  } catch (error) {
    console.error('Error fetching doubts with collectionGroup:', error);
    return [];
  }
};


/**
 * Fetches all messages for a specific doubt thread.
 * @param {string} doubtId - The ID of the doubt.
 * @returns {Promise<DoubtMessage[]>} An array of message objects.
 */
export const getDoubtThread = async (doubtId: string): Promise<DoubtMessage[]> => {
    try {
        const threadRef = collection(db, 'doubts', doubtId, 'thread');
        const q = query(threadRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoubtMessage));
    } catch (error) {
        console.error(`Error fetching thread for doubt ${doubtId}:`, error);
        // Fallback for lecture doubts
         try {
            const lectureDoubtsQuery = query(collectionGroup(db, 'doubts'), where('__name__', '==', `lectures/${(error as any).resource?.segments?.[1]}/doubts/${doubtId}`));
            const lectureDoubtSnapshot = await getDocs(lectureDoubtsQuery);
            if (!lectureDoubtSnapshot.empty) {
                const docRef = lectureDoubtSnapshot.docs[0].ref;
                const threadSnapshot = await getDocs(query(collection(docRef, 'thread'), orderBy('createdAt', 'asc')));
                return threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as DoubtMessage);
            }
        } catch (fallbackError) {
             console.error(`Fallback fetch also failed for doubt ${doubtId}:`, fallbackError);
        }
        return [];
    }
};

/**
 * Marks a doubt as cleared by the user.
 * This function needs to handle both top-level and nested doubts.
 * @param {string} doubtId - The ID of the doubt document to update.
 * @param {string} [lectureId] - The lecture ID if it's a nested doubt.
 */
export const markDoubtAsCleared = async (doubtId: string, lectureId?: string): Promise<void> => {
    try {
        const doubtRef = lectureId 
            ? doc(db, 'lectures', lectureId, 'doubts', doubtId)
            : doc(db, 'doubts', doubtId);
            
        await updateDoc(doubtRef, {
            isCleared: true,
        });
    } catch (error) {
        console.error(`Error marking doubt ${doubtId} as cleared:`, error);
        throw error;
    }
}
