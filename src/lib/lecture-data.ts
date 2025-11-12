

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Lecture } from './types';

/**
 * Fetches all lectures and categories from the 'lectures' collection in Firestore,
 * sorted by creation date.
 * @returns {Promise<Lecture[]>} An array of lecture objects (both videos and categories).
 */
export const getLectures = async (): Promise<Lecture[]> => {
  try {
    const lecturesRef = collection(db, 'lectures');
    const q = query(lecturesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Lecture)
    );
  } catch (error) {
    console.error('Error fetching lectures:', error);
    return [];
  }
};

/**
 * Fetches a single lecture or category by its ID.
 * @param {string} lectureId - The ID of the document.
 * @returns {Promise<Lecture | null>} A lecture object or null if not found.
 */
export const getLectureById = async (
  lectureId: string
): Promise<Lecture | null> => {
  try {
    const lectureRef = doc(db, 'lectures', lectureId);
    const docSnap = await getDoc(lectureRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lecture;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching lecture ${lectureId}:`, error);
    return null;
  }
};
