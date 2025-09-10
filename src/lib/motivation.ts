
import { db } from './firebase';
import { collection, getDocs, query, limit, where, writeBatch, doc, updateDoc } from 'firebase/firestore';

type MotivationMessage = {
    id: string;
    text: string;
    collectionName: string;
}

/**
 * Marks a specific motivational message as read.
 * @param collectionName - The name of the collection the message belongs to.
 * @param messageId - The ID of the message document.
 */
export const markMotivationAsRead = async (collectionName: string, messageId: string): Promise<void> => {
    try {
        if (!collectionName || messageId === 'fallback') {
            return;
        }
        const messageRef = doc(db, collectionName, messageId);
        await updateDoc(messageRef, {
            read: true
        });
    } catch (error) {
        console.error(`Error marking message ${messageId} as read in ${collectionName}:`, error);
        // We don't throw here to avoid breaking the user-facing flow for a background task.
    }
}


/**
 * Fetches a random motivational message from a specified collection based on mood and access level.
 * It prioritizes unread messages. If all messages have been read, it will pick any message from the collection.
 * @param mood - The mood to fetch a message for (e.g., 'motivated', 'focused', 'worried').
 * @param accessLevel - The user's access level, which determines the message collection.
 * @returns A random message object from the collection, including its ID and collection name.
 */
export const getRandomMotivationByMood = async (
  mood: string,
  accessLevel: 'full' | 'limited' = 'full'
): Promise<MotivationMessage> => {
    const moodLower = mood.toLowerCase();
    const suffix = accessLevel === 'limited' ? '-formal' : '';
    const collectionName = `motivation-${moodLower}${suffix}`;
    
    const defaultMessages: { [key: string]: string } = {
        motivated: "You've got this, one step at a time!",
        focused: "Keep up the great work.",
        worried: "It's okay to feel this way. Take a deep breath."
    };
    
    const fallbackText = defaultMessages[moodLower] || "Keep pushing forward.";
    const fallbackMessage: MotivationMessage = {
        id: 'fallback',
        text: fallbackText,
        collectionName: ''
    };

    try {
        const messagesRef = collection(db, collectionName);
        
        // 1. Query for unread messages first
        const unreadQuery = query(messagesRef, where('read', '!=', true));
        let querySnapshot = await getDocs(unreadQuery);

        // 2. If no unread messages, query for ALL messages in the collection
        if (querySnapshot.empty) {
            console.log(`No unread messages in ${collectionName}, fetching from all messages.`);
            querySnapshot = await getDocs(messagesRef);
        }

        const messages = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            text: doc.data().message as string,
            collectionName: collectionName
        }));

        if (messages.length === 0) {
            console.warn(`Firestore collection '${collectionName}' is empty or does not exist.`);
            return fallbackMessage;
        }

        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];

    } catch (error) {
        console.error(`Error fetching from ${collectionName}:`, error);
        return fallbackMessage;
    }
};

/**
 * Fetches a random message from the 'tinkering-messages' collection.
 * It prioritizes unread messages and marks the fetched message as read.
 * @returns A random message string.
 */
export const getTinkeringMessage = async (): Promise<string> => {
    const messageData = await getRandomMessageFromCollection('tinkering-messages', "Are you sure you're focusing on what's important right now?");
    await markMotivationAsRead(messageData.collectionName, messageData.id);
    return messageData.text;
};

/**
 * Fetches a random message from the 'threatening-messages' collection.
 * It prioritizes unread messages and marks the fetched message as read.
 * @returns A random message string.
 */
export const getThreateningMessage = async (): Promise<string> => {
    const messageData = await getRandomMessageFromCollection('threatening-messages', "Okay, that's enough. Get back to work.");
    await markMotivationAsRead(messageData.collectionName, messageData.id);
    return messageData.text;
};


/**
 * Fetches a random message from the 'worried-messages' collection for when the user is persistently worried.
 * It prioritizes unread messages and marks the fetched message as read.
 * @returns A random message string.
 */
export const getWorriedStreakMessage = async (): Promise<string> => {
    const messageData = await getRandomMessageFromCollection('worried-messages', "It seems like you've been worried for a few days. Remember to be kind to yourself. It's okay to take a break.");
    await markMotivationAsRead(messageData.collectionName, messageData.id);
    return messageData.text;
};


/**
 * A generic helper function to fetch a random message from any given collection, prioritizing unread messages.
 * @param collectionName - The name of the Firestore collection.
 * @param defaultMessage - A fallback message if the collection is empty or an error occurs.
 * @returns A random message object including its text, id, and collection name.
 */
const getRandomMessageFromCollection = async (collectionName: string, defaultMessage: string): Promise<MotivationMessage> => {
    const fallbackMessage: MotivationMessage = {
        id: 'fallback',
        text: defaultMessage,
        collectionName: '',
    };
    
    try {
        const messagesRef = collection(db, collectionName);
        
        // 1. Query for unread messages first
        const unreadQuery = query(messagesRef, where('read', '!=', true));
        let querySnapshot = await getDocs(unreadQuery);

        // 2. If no unread messages, query for ALL messages in the collection
        if (querySnapshot.empty) {
            querySnapshot = await getDocs(messagesRef);
        }

        if (querySnapshot.empty) {
            console.warn(`Firestore collection '${collectionName}' is empty or does not exist.`);
            return fallbackMessage;
        }

        const messages = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            text: doc.data().message as string,
            collectionName: collectionName
        }));

        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex] || fallbackMessage;
    } catch (error) {
        console.error(`Error fetching from ${collectionName}:`, error);
        return fallbackMessage;
    }
}
