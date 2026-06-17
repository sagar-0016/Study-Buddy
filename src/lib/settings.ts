
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

import { IS_MAINTENANCE } from './config';

/**
 * Checks if direct editing for schedules is enabled via a local storage flag.
 * This is a client-side check.
 * @returns {boolean} True if direct editing is enabled, false otherwise.
 */
export const isDirectEditEnabled = (): boolean => {
    if (IS_MAINTENANCE || typeof window === "undefined" || typeof document === "undefined") {
        return false; // Default to false on the server
    }
    try {
        const storedValue = localStorage.getItem('direct-edit-enabled');
        return storedValue === 'true';
    } catch (error) {
        console.error("Error accessing localStorage for direct edit setting:", error);
        return false; // Safely default to false in case of an error
    }
};
