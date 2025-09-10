
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import type { Notification } from './types';


/**
 * Fetches all unread notifications from Firestore, ordered by creation date.
 * @returns {Promise<Notification[]>} An array of notification objects.
 */
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef, 
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Notification)
    );
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
};

/**
 * Marks a notification as read.
 * @param {string} notificationId - The ID of the notification document to update.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            isRead: true,
        });
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        throw error;
    }
}
