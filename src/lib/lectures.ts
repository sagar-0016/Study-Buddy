
import { db, storage } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  updateDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Lecture, LectureNote, LectureFeedback, LectureCategory, LectureVideo } from './types';


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


/**
 * Fetches all notes for a specific lecture.
 * @param {string} lectureId - The ID of the lecture document.
 * @returns {Promise<LectureNote[]>} An array of lecture note objects.
 */
export const getLectureNotes = async (
  lectureId: string
): Promise<LectureNote[]> => {
  try {
    const notesRef = collection(db, 'lectures', lectureId, 'notes');
    const querySnapshot = await getDocs(notesRef);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as LectureNote)
    );
  } catch (error) {
    console.error(`Error fetching notes for lecture ${lectureId}:`, error);
    return [];
  }
};


/**
 * CLIENT-SIDE FUNCTION
 * Uploads a file from the user's browser to Firebase Storage, then adds the
 * note metadata to Firestore. This function should be called from a component.
 *
 * @param lectureId The ID of the lecture document.
 * @param lectureTitle The title of the lecture, used for the storage path.
 * @param file The file object from an input element.
 * @param onProgress A callback function to report upload progress.
 * @returns A promise that resolves when the entire process is complete.
 */
export const uploadLectureNote = async (
  lectureId: string,
  lectureTitle: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<void> => {
  if (!file) {
    throw new Error('File is required for upload.');
  }

  const storagePath = `lectures/${lectureTitle}/notes/${uuidv4()}-${file.name}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const notesRef = collection(db, 'lectures', lectureId, 'notes');
          await addDoc(notesRef, {
            name: file.name,
            url: downloadURL,
            type: 'pdf',
            uploadedAt: serverTimestamp(),
          });
          resolve();
        } catch (error) {
          console.error('Failed to get download URL or write to Firestore:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Deletes a note document from Firestore.
 * This does NOT delete the file from Firebase Storage.
 * @param lectureId The ID of the lecture containing the note.
 * @param noteId The ID of the note document to delete.
 */
export const deleteLectureNote = async (lectureId: string, noteId: string): Promise<void> => {
    try {
        const noteRef = doc(db, 'lectures', lectureId, 'notes', noteId);
        await deleteDoc(noteRef);
    } catch (error) {
        console.error(`Error deleting note ${noteId} from lecture ${lectureId}:`, error);
        throw error;
    }
}


/**
 * Adds feedback for a specific lecture to a 'feedback' subcollection.
 * @param lectureId The ID of the lecture document.
 * @param feedbackData The feedback data, including rating and text.
 */
export const addLectureFeedback = async (
  lectureId: string,
  feedbackData: { rating: number; text: string }
): Promise<void> => {
  try {
    const feedbackRef = collection(db, 'lectures', lectureId, 'feedback');
    await addDoc(feedbackRef, {
      ...feedbackData,
      submittedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error adding feedback for lecture ${lectureId}:`, error);
    throw error;
  }
};


/**
 * Creates a new lecture category document in Firestore.
 * @param {string} title - The title of the category.
 * @param {string} description - The description for the category.
 * @returns {Promise<string>} The ID of the newly created category document.
 */
export const createLectureCategory = async (title: string, description: string): Promise<string> => {
    const categoryData: Omit<LectureCategory, 'id'> = {
        title,
        description,
        type: 'category',
        lectureIds: [],
        createdAt: serverTimestamp().toString(),
    };
    const docRef = await addDoc(collection(db, 'lectures'), categoryData);
    return docRef.id;
};


/**
 * Adds multiple lectures to a category. This involves updating the category's lectureIds array
 * and updating the categoryId field on each lecture document.
 * @param {string} categoryId - The ID of the category to add lectures to.
 * @param {LectureVideo[]} lecturesToAdd - An array of lecture video objects to be added.
 */
export const addLecturesToCategory = async (categoryId: string, lecturesToAdd: LectureVideo[]): Promise<void> => {
    const batch = writeBatch(db);
    const categoryRef = doc(db, 'lectures', categoryId);

    // Prepare lecture IDs and update thumbnail if needed
    const lectureIds = lecturesToAdd.map(lecture => lecture.id);
    const categoryUpdate: Partial<LectureCategory> = {
        lectureIds: arrayUnion(...lectureIds) as any, // Use arrayUnion to add without duplicates
    };
    
    // Set category thumbnail to the first video's thumbnail if the category is empty
    if (lecturesToAdd.length > 0) {
        categoryUpdate.thumbnailUrl = lecturesToAdd[0].thumbnailUrl;
    }
    
    batch.update(categoryRef, categoryUpdate);

    // Update each lecture to set its categoryId
    lecturesToAdd.forEach(lecture => {
        const lectureRef = doc(db, 'lectures', lecture.id);
        batch.update(lectureRef, { categoryId: categoryId });
    });

    await batch.commit();
};


/**
 * Removes a lecture from a category. This updates both the category and lecture documents.
 * @param {string} categoryId - The ID of the category.
 * @param {string} lectureId - The ID of the lecture to remove.
 */
export const removeLectureFromCategory = async (categoryId: string, lectureId: string): Promise<void> => {
    const batch = writeBatch(db);
    const categoryRef = doc(db, 'lectures', categoryId);
    const lectureRef = doc(db, 'lectures', lectureId);

    // Remove lectureId from category's array
    batch.update(categoryRef, {
        lectureIds: arrayRemove(lectureId)
    });

    // Remove categoryId from the lecture
    batch.update(lectureRef, {
        categoryId: "" // Or deleteField() if you prefer
    });

    await batch.commit();
};


/**
 * Fetches all lectures belonging to a specific category.
 * @param {LectureCategory} category - The category object containing lectureIds.
 * @returns {Promise<LectureVideo[]>} An array of lecture video objects.
 */
export const getLecturesForCategory = async (category: LectureCategory): Promise<LectureVideo[]> => {
    if (!category.lectureIds || category.lectureIds.length === 0) {
        return [];
    }

    try {
        const allLecturesSnapshot = await getDocs(collection(db, 'lectures'));
        const allLecturesMap = new Map(allLecturesSnapshot.docs.map(d => [d.id, { id: d.id, ...d.data() } as LectureVideo]));
        
        const lecturesInCategory = category.lectureIds
            .map(id => allLecturesMap.get(id))
            .filter((lecture): lecture is LectureVideo => !!lecture && (lecture.type === 'video' || !lecture.type));
            
        return lecturesInCategory;
    } catch (error) {
        console.error(`Error fetching lectures for category ${category.id}:`, error);
        return [];
    }
};
