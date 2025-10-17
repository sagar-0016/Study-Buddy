

import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection, updateDoc, Timestamp } from 'firebase/firestore';
import { add, differenceInDays } from 'date-fns';
import type { PeriodData, PeriodLog } from './types';

const AVERAGE_CYCLE_LENGTH = 28; // Default average cycle length in days

/**
 * Fetches the current period data. If it doesn't exist, it creates a default one.
 * The default is set to start 28 days from now.
 * @returns {Promise<PeriodData>} The current period data.
 */
export const getPeriodData = async (): Promise<PeriodData> => {
  const periodRef = doc(db, 'periods', 'current');
  let docSnap = await getDoc(periodRef);

  if (!docSnap.exists()) {
    const defaultExpectedDate = add(new Date(), { days: AVERAGE_CYCLE_LENGTH });
    const defaultData = { expectedDate: Timestamp.fromDate(defaultExpectedDate) };
    await setDoc(periodRef, defaultData);
    docSnap = await getDoc(periodRef); // Re-fetch the newly created doc
  }

  const data = docSnap.data();
  return {
    expectedDate: (data?.expectedDate as Timestamp).toDate(),
    actualStartDate: data?.actualStartDate ? (data.actualStartDate as Timestamp).toDate() : undefined,
    actualEndDate: data?.actualEndDate ? (data.actualEndDate as Timestamp).toDate() : undefined,
  };
};

/**
 * Logs the actual start date of a period.
 * This updates the 'current' period document.
 * @param {Date} startDate - The actual date the period started.
 */
export const logPeriodStart = async (startDate: Date): Promise<void> => {
    const periodRef = doc(db, 'periods', 'current');
    await updateDoc(periodRef, {
        actualStartDate: Timestamp.fromDate(startDate),
        updatedAt: serverTimestamp()
    });
};

/**
 * Logs the end date of a period, archives the cycle, and calculates the next expected date.
 * @param {Date} endDate - The actual date the period ended.
 */
export const logPeriodEnd = async (endDate: Date): Promise<void> => {
    const periodRef = doc(db, 'periods', 'current');
    const periodLogRef = collection(db, 'periodLog');

    const currentPeriodSnap = await getDoc(periodRef);
    if (!currentPeriodSnap.exists()) {
        throw new Error("Current period data not found.");
    }
    const currentPeriodData = currentPeriodSnap.data() as PeriodData;
    const actualStartDate = currentPeriodData.actualStartDate;
    const expectedDate = currentPeriodData.expectedDate;

    if (!actualStartDate) {
        throw new Error("Cannot log end date without a start date.");
    }

    const cycleLength = differenceInDays(endDate, actualStartDate);

    // 1. Archive the completed cycle
    await addDoc(periodLogRef, {
        startDate: Timestamp.fromDate(actualStartDate),
        endDate: Timestamp.fromDate(endDate),
        expectedDate: Timestamp.fromDate(expectedDate), // Archive the expected date too
        cycleLength: cycleLength > 0 ? cycleLength : 1, // Ensure cycle length is at least 1
        loggedAt: serverTimestamp()
    });

    // 2. Calculate next expected date (simple logic for now)
    const nextExpectedDate = add(actualStartDate, { days: AVERAGE_CYCLE_LENGTH });

    // 3. Reset the 'current' period document for the next cycle
    await setDoc(periodRef, {
        expectedDate: Timestamp.fromDate(nextExpectedDate),
        actualStartDate: null,
        actualEndDate: null, // Clear old end date
    });
};
