

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Lecture } from './types';

// This file is intended for static or less frequently changed data fetching.
// The main lecture fetching logic is now in /src/lib/lectures.ts to resolve import issues.
