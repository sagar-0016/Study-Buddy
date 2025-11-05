
// To run this script:
// 1. Make sure you have tsx installed: npm install -g tsx
// 2. Run from the root of your project: tsx ./scripts/populateSyllabus.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';

// IMPORTANT: Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBv26GpTGNi56cOHY23H4JWk_Q0iu7WRbg",
  authDomain: "study-buddy-7357a.firebaseapp.com",
  projectId: "study-buddy-7357a",
  storageBucket: "study-buddy-7357a.appspot.com",
  messagingSenderId: "286721031921",
  appId: "1:286721031921:web:bdebedc76dd6081dbfb350"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase initialized for script.");

const syllabusToPopulate = {
  physics: {
    label: 'Physics',
    chapters: [
      {
        title: 'Mechanics I',
        topics: [
          { name: 'Physics and Measurement', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Kinematics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Laws of Motion', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
        ],
      },
      {
        title: 'Mechanics II',
        topics: [
            { name: 'Work, Energy and Power', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
            { name: 'Rotational Motion', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
            { name: 'Gravitation', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
            { name: 'Properties of Solids and Liquids', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
        ]
      },
      {
        title: 'Thermodynamics',
        topics: [
          { name: 'Thermodynamics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
          { name: 'Kinetic Theory of Gases', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
        ],
      },
      {
        title: 'Oscillations & Waves',
        topics: [{ name: 'Oscillations and Waves', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 }],
      },
      {
        title: 'Electrostatics & Magnetism I',
        topics: [
            { name: 'Electrostatics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
            { name: 'Current Electricity', jeeMainWeightage: 1, jeeAdvancedWeightage: 2 },
            { name: 'Capacitors', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true },
        ]
      },
       {
        title: 'Electrostatics & Magnetism II',
        topics: [
            { name: 'Magnetic Effect of Current', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
            { name: 'Magnetism', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
            { name: 'Electromagnetic Induction', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
            { name: 'Alternating Current', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
        ]
      },
      {
        title: 'Optics & Modern Physics',
        topics: [
            { name: 'Geometrical Optics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
            { name: 'Electromagnetic Waves', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
            { name: 'Waves Optics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
            { name: 'Modern Physics', jeeMainWeightage: 1, jeeAdvancedWeightage: 1 },
            { name: 'Errors and Instruments', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true },
            { name: 'Semiconductors', jeeMainWeightage: 2, jeeAdvancedWeightage: 4 }
        ]
      }
    ],
  },
  chemistry: {
    label: 'Chemistry',
    chapters: [
      {
        title: 'Physical Chemistry I',
        topics: [
          { name: 'Some Basic Concepts in Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'States of Matter', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Atomic Structure', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Chemical Bonding and Molecular Structure', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
          { name: 'Chemical Thermodynamics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
        ],
      },
       {
        title: 'Physical Chemistry II',
        topics: [
          { name: 'Solutions', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Equilibrium', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Redox Reactions and Electrochemistry', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Chemical Kinetics', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Liquid Solution', jeeMainWeightage: 3, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'Electrochemistry', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Solid State', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Surface Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
        ],
      },
      {
        title: 'Inorganic Chemistry',
        topics: [
          { name: 'Classification of Elements and Periodicity in Properties', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Hydrogen', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 's-Block Elements', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'p-Block Elements', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'd and f-Block Elements', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Coordination Compounds', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
          { name: 'Environmental Chemistry', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'Metallurgy', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'Salt Analysis', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true },
        ],
      },
      {
        title: 'Organic Chemistry',
        topics: [
          { name: 'Purification & Characterization of Organic Compounds', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Some Basic Principles of Organic Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Hydrocarbons', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Organic Compounds Containing Halogens', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Organic Compounds Containing Oxygen', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Organic Compounds Containing Nitrogen', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Biomolecules', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Polymers', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, isOutOfSyllabus: true },
          { name: 'Chemistry in Everyday Life', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'Principles Related to Practical Chemistry (POC)', jeeMainWeightage: 4, jeeAdvancedWeightage: 4 },
          { name: 'Reaction Mechanism', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true },
        ],
      },
    ],
  },
  maths: {
    label: 'Maths',
    chapters: [
      {
        title: 'Algebra',
        topics: [
          { name: 'Sets, Relations and Functions', jeeMainWeightage: 3, jeeAdvancedWeightage: 5 },
          { name: 'Complex Numbers and Quadratic Equations', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Matrices and Determinants', jeeMainWeightage: 2, jeeAdvancedWeightage: 2 },
          { name: 'Permutations and Combinations', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Mathematical Induction', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
          { name: 'Binomial Theorem and its Simple Applications', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Sequences and Series', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
        ],
      },
       {
        title: 'Calculus',
        topics: [
          { name: 'Limits, Continuity and Differentiability', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Integral Calculus', jeeMainWeightage: 2, jeeAdvancedWeightage: 1 },
          { name: 'Differential Equations', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Methods of Differentiation', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true },
          { name: 'Tangent and Normal', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true },
          { name: 'Monotonicity', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true },
          { name: 'Maxima and Minima', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true },
          { name: 'Area Under The Curve', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
        ],
      },
       {
        title: 'Coordinate Geometry',
        topics: [
          { name: 'Straight Lines', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Circles', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Conic Sections', jeeMainWeightage: 2, jeeAdvancedWeightage: 3 },
          { name: 'Three Dimensional Geometry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Vector Algebra', jeeMainWeightage: 1, jeeAdvancedWeightage: 2 },
        ],
      },
      {
        title: 'Trigonometry & Probability',
        topics: [
          { name: 'Trigonometrical Ratios and Identities', jeeMainWeightage: 3, jeeAdvancedWeightage: 4 },
          { name: 'Trigonometric Equations', jeeMainWeightage: 4, jeeAdvancedWeightage: 4 },
          { name: 'Inverse Trigonometric Functions', jeeMainWeightage: 3, jeeAdvancedWeightage: 3 },
          { name: 'Heights and Distances', jeeMainWeightage: 4, jeeAdvancedWeightage: 5 },
          { name: 'Statistics and Probability', jeeMainWeightage: 2, jeeAdvancedWeightage: 1 },
          { name: 'Mathematical Reasoning', jeeMainWeightage: 4, jeeAdvancedWeightage: 5, isOutOfSyllabus: true },
        ],
      },
    ],
  },
};

const main = async () => {
    try {
        console.log("Starting to populate 'syllabus' collection...");
        const batch = writeBatch(db);

        for (const [subjectId, subjectData] of Object.entries(syllabusToPopulate)) {
            const subjectDocRef = doc(db, 'syllabus', subjectId);
            batch.set(subjectDocRef, {
                label: subjectData.label,
                chapters: subjectData.chapters,
            });
        }
        
        await batch.commit();

        console.log(`\n✅ Successfully populated 'syllabus' collection with all subjects in Firestore!`);
        console.log("\nYou can now close this script (Ctrl+C).");

    } catch (error) {
        console.error("\n❌ Error populating Firestore:", error);
        process.exit(1);
    }
}

main();
