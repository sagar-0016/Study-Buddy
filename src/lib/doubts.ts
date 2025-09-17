

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
    const batch = writeBatch(db);
    const now = serverTimestamp();

    // 1. Create the main doubt document
    const doubtRef = doc(collection(db, 'doubts'));
    const doubtPayload: Omit<Doubt, 'id' | 'thread' | 'lastMessage'> = {
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

    // 3. Update the main doubt doc with the last message info
    batch.update(doubtRef, {
        'lastMessage.text': data.text,
        'lastMessage.timestamp': now,
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
    const doubtRef = doc(db, 'doubts', doubtId);
    const threadRef = collection(doubtRef, 'thread');
    const now = serverTimestamp();
    
    const newDocRef = await addDoc(threadRef, {
        ...messageData,
        createdAt: now,
    });
    
    await updateDoc(doubtRef, {
        'lastMessage.text': messageData.text,
        'lastMessage.timestamp': now,
    });

    return newDocRef.id;
};

/**
 * Fetches all relevant doubts based on user's access level.
 * @param {AccessLevel} accessLevel - The access level of the current user.
 * @returns {Promise<Doubt[]>} An array of doubt objects, sorted by the last message time.
 */
export const getDoubts = async (accessLevel: AccessLevel): Promise<Doubt[]> => {
  try {
    const doubtsRef = collection(db, 'doubts');
    const constraints: QueryConstraint[] = [orderBy('lastMessage.timestamp', 'desc')];
    
    if (accessLevel === 'limited') {
      constraints.push(where('accessLevel', '==', 'limited'));
    }

    const q = query(doubtsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const allDoubts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
    
    return allDoubts;
  } catch (error) {
    console.error('Error fetching doubts:', error);
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
        return [];
    }
};

/**
 * Marks a doubt as cleared by the user.
 * @param {string} doubtId - The ID of the doubt document to update.
 */
export const markDoubtAsCleared = async (doubtId: string): Promise<void> => {
    try {
        const doubtRef = doc(db, 'doubts', doubtId);
        await updateDoc(doubtRef, {
            isCleared: true,
        });
    } catch (error) {
        console.error(`Error marking doubt ${doubtId} as cleared:`, error);
        throw error;
    }
}
