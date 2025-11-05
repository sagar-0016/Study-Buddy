

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
    const defaultCertainDate = add(defaultExpectedDate, { days: 2 });
    const defaultData = { 
        expectedDate: Timestamp.fromDate(defaultExpectedDate),
        certainDate: Timestamp.fromDate(defaultCertainDate),
        actualStartDate: null,
        actualEndDate: null,
    };
    await setDoc(periodRef, defaultData);
    docSnap = await getDoc(periodRef); // Re-fetch the newly created doc
  }

  const data = docSnap.data();
  return {
    expectedDate: data?.expectedDate ? (data.expectedDate as Timestamp).toDate() : null,
    certainDate: data?.certainDate ? (data.certainDate as Timestamp).toDate() : null,
    actualStartDate: data?.actualStartDate ? (data.actualStartDate as Timestamp).toDate() : null,
    actualEndDate: data?.actualEndDate ? (data.actualEndDate as Timestamp).toDate() : null,
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
 * Logs the end date of a period, archives the cycle, and then resets the current period data.
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
    const actualStartDate = currentPeriodData.actualStartDate ? (currentPeriodData.actualStartDate as Timestamp).toDate() : null;
    const expectedDate = currentPeriodData.expectedDate ? (currentPeriodData.expectedDate as Timestamp).toDate() : null;
    const certainDate = currentPeriodData.certainDate ? (currentPeriodData.certainDate as Timestamp).toDate() : null;

    if (!actualStartDate) {
        throw new Error("Cannot log end date without a start date.");
    }

    const cycleLength = differenceInDays(endDate, actualStartDate);

    // 1. Archive the completed cycle
    await addDoc(periodLogRef, {
        startDate: Timestamp.fromDate(actualStartDate),
        endDate: Timestamp.fromDate(endDate),
        expectedDate: expectedDate ? Timestamp.fromDate(expectedDate) : null,
        certainDate: certainDate ? Timestamp.fromDate(certainDate) : null,
        cycleLength: cycleLength > 0 ? cycleLength : 1,
        loggedAt: serverTimestamp()
    });

    // 2. Calculate the next expected date based on the start date of the cycle that just ended
    const nextExpectedDate = add(actualStartDate, { days: AVERAGE_CYCLE_LENGTH });
    const nextCertainDate = add(nextExpectedDate, { days: 2 });

    // 3. Reset the 'current' period document for the next cycle
    await setDoc(periodRef, {
        expectedDate: Timestamp.fromDate(nextExpectedDate),
        certainDate: Timestamp.fromDate(nextCertainDate),
        actualStartDate: null,
        actualEndDate: null,
    });
};
