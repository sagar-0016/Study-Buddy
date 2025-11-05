

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
          { name: 'Physics and Measurement', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Physical quantities, fundamental and derived units.\nSystems of units (CGS, MKS, SI).\nMeasurement of length, mass, and time; least count; significant figures; errors and their propagation.\nDimensional analysis and its applications in checking equations and deriving relationships." },
          { name: 'Kinematics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Scalars and vectors; addition and subtraction of vectors; relative velocity.\nMotion in a straight line: position–time graph, velocity–time graph, uniform and non-uniform motion, equations of motion.\nMotion in a plane: projectile motion, uniform circular motion." },
          { name: 'Laws of Motion', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Newton’s laws, inertial and non-inertial frames.\nForce and inertia, momentum, and impulse; conservation of linear momentum.\nFriction: static, kinetic, and rolling; laws of friction.\nDynamics of circular motion." },
        ],
      },
      {
        title: 'Mechanics II',
        topics: [
            { name: 'Work, Energy and Power', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Work done by a constant or variable force.\nKinetic and potential energy, work–energy theorem, conservation of mechanical energy.\nPower, collisions (elastic and inelastic) in one and two dimensions." },
            { name: 'Rotational Motion', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Centre of mass and motion of centre of mass.\nTorque and angular momentum, conservation of angular momentum.\nRotational kinematics; moment of inertia, radius of gyration; parallel and perpendicular axes theorems.\nRigid body equilibrium and rotational dynamics." },
            { name: 'Gravitation', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Universal law of gravitation; acceleration due to gravity (variation with altitude and depth).\nKepler’s laws; gravitational potential energy and potential.\nOrbital motion, velocity and energy of satellite, escape velocity, and geostationary orbit." },
            { name: 'Properties of Solids and Liquids', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Elastic behaviour: stress–strain curve, Hooke’s law, Young’s modulus, bulk and shear modulus.\nPressure in fluids; Pascal’s law; hydraulic lift and press.\nViscosity (Stokes’ law, terminal velocity); streamline and turbulent flow.\nBernoulli’s theorem and its applications.\nSurface tension, capillary rise, and angle of contact." },
        ]
      },
      {
        title: 'Thermodynamics',
        topics: [
          { name: 'Thermodynamics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Thermal equilibrium, zeroth law.\nHeat, work, and internal energy; first law of thermodynamics.\nIsothermal and adiabatic processes.\nSecond law: entropy, reversible and irreversible processes, Carnot engine." },
          { name: 'Kinetic Theory of Gases', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Equation of state for ideal gases; pressure due to molecular motion.\nKinetic interpretation of temperature, RMS and mean speeds.\nDegrees of freedom and equipartition theorem.\nMean free path, Avogadro’s number." },
        ],
      },
      {
        title: 'Oscillations & Waves',
        topics: [{ name: 'Oscillations and Waves', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Periodic motion, simple harmonic motion (SHM) and its equations.\nEnergy in SHM, phase and phase difference, simple pendulum.\nWave motion: speed, frequency, wavelength; principle of superposition; reflection and transmission.\nStanding waves and normal modes; beats and resonance; Doppler effect." }],
      },
      {
        title: 'Electrostatics & Magnetism I',
        topics: [
            { name: 'Electrostatics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Coulomb’s law; electric field and field lines.\nElectric dipole, torque, flux; Gauss’s law and its applications.\nElectric potential and potential energy; equipotential surfaces.\nConductors, insulators, capacitance and capacitors in series/parallel; energy stored in capacitor." },
            { name: 'Current Electricity', jeeMainWeightage: 1, jeeAdvancedWeightage: 2, details: "Electric current, drift velocity, mobility, relation with current.\nOhm’s law, resistivity, temperature dependence of resistance.\nElectrical energy and power; I–V characteristics of devices.\nSeries and parallel resistors, EMF, internal resistance, Kirchhoff’s laws, Wheatstone bridge, metre bridge, potentiometer." },
            { name: 'Capacitors', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true, details: "Conductors, insulators, capacitance and capacitors in series/parallel; energy stored in capacitor." },
        ]
      },
       {
        title: 'Electrostatics & Magnetism II',
        topics: [
            { name: 'Magnetic Effect of Current', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Biot–Savart law, magnetic field due to current-carrying wire and loop.\nForce on moving charge, force between currents, torque on current loop.\nAmpere’s circuital law, solenoid and toroid fields.\nMoving coil galvanometer, conversion to ammeter/voltmeter." },
            { name: 'Magnetism', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Magnetic dipole, earth’s magnetism; para-, dia-, and ferromagnetic materials." },
            { name: 'Electromagnetic Induction', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Faraday’s laws, Lenz’s law, eddy currents.\nSelf and mutual inductance." },
            { name: 'Alternating Current', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "AC generation, RMS values of AC, reactance, impedance, and phase relationships in RLC circuits.\nResonance, power in AC circuits, transformers." },
        ]
      },
      {
        title: 'Optics & Modern Physics',
        topics: [
            { name: 'Geometrical Optics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Reflection and refraction at plane and spherical surfaces, mirror and lens formulae.\nTotal internal reflection and its applications.\nOptical instruments: microscope and astronomical telescope." },
            { name: 'Electromagnetic Waves', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Displacement current, Maxwell’s equations (qualitative).\nElectromagnetic spectrum and applications of different regions (radio to gamma)." },
            { name: 'Waves Optics', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Wave optics: Huygens’ principle, interference, Young’s double-slit experiment, diffraction, polarization, Brewster’s law." },
            { name: 'Modern Physics', jeeMainWeightage: 1, jeeAdvancedWeightage: 1, details: "Photoelectric effect, Einstein’s equation.\nMatter waves, de Broglie hypothesis, Davisson–Germer experiment.\nRutherford scattering and Bohr model of hydrogen atom.\nEnergy levels, emission and absorption spectra.\nNucleus: composition, size, mass defect, binding energy, radioactivity, fission and fusion." },
            { name: 'Errors and Instruments', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true, details: "Vernier caliper, screw gauge: measurement of small lengths and diameters.\nSimple pendulum: time period vs amplitude (energy dissipation).\nMetre scale: use of moments to measure mass." },
            { name: 'Semiconductors', jeeMainWeightage: 2, jeeAdvancedWeightage: 4, details: "Semiconductors: intrinsic and extrinsic types, p–n junction.\nCharacteristics of diodes; diode as rectifier.\nZener diode, LED, photodiode, solar cell, transistor action (basic idea).\nLogic gates (AND, OR, NOT, NAND, NOR)." }
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
          { name: 'Some Basic Concepts in Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Laws of chemical combination; Dalton’s atomic theory.\nAtomic and molecular masses; mole concept; molar volume.\nEmpirical and molecular formulae; stoichiometric calculations." },
          { name: 'States of Matter', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "" },
          { name: 'Atomic Structure', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Nature of electromagnetic radiation, photoelectric effect.\nSpectrum of hydrogen atom; Bohr model and its limitations.\nQuantum mechanical model: quantum numbers, shapes of orbitals, Pauli exclusion, Hund’s rule, Aufbau principle.\nElectronic configuration of elements." },
          { name: 'Chemical Bonding and Molecular Structure', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Ionic and covalent bonding; Fajan’s rule, lattice enthalpy.\nLewis structures, resonance, VSEPR theory.\nValence bond theory, hybridization, shapes of molecules.\nMolecular orbital theory (LCAO); bond order; hydrogen bonding." },
          { name: 'Chemical Thermodynamics', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "System, surroundings, extensive/intensive properties.\nFirst law: work, heat, internal energy, enthalpy; Hess’s law.\nEnthalpies of formation, combustion, atomization, bond dissociation.\nSecond law: entropy, spontaneity, Gibbs energy and equilibrium constant." },
        ],
      },
       {
        title: 'Physical Chemistry II',
        topics: [
          { name: 'Solutions', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Concentration units: molarity, molality, mole fraction, % composition.\nRaoult’s law, ideal and non-ideal solutions, azeotropes.\nColligative properties: lowering of vapour pressure, elevation of boiling point, depression of freezing point, osmotic pressure.\nDetermination of molar mass, van’t Hoff factor." },
          { name: 'Equilibrium', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Physical and chemical equilibria; dynamic nature.\nLaw of mass action, equilibrium constant, Le Chatelier’s principle.\nIonic equilibrium: acids, bases, pH, buffer solutions, solubility product, hydrolysis." },
          { name: 'Redox Reactions and Electrochemistry', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Oxidation and reduction, redox reactions by oxidation number method.\nElectrolytic and metallic conductance, specific and molar conductivity.\nVariation with concentration, Kohlrausch’s law.\nElectrochemical cells, electrode potential, Nernst equation, standard electrode potentials.\nEMF, relation between Gibbs energy and cell potential.\nCorrosion, batteries, and fuel cells." },
          { name: 'Chemical Kinetics', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Rate of reaction, rate law, order and molecularity.\nIntegrated rate equations for zero and first order.\nHalf-life, temperature dependence (Arrhenius equation).\nActivation energy, collision theory (elementary idea)." },
          { name: 'Liquid Solution', jeeMainWeightage: 3, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'Electrochemistry', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Electrolytic and metallic conductance, specific and molar conductivity.\nVariation with concentration, Kohlrausch’s law.\nElectrochemical cells, electrode potential, Nernst equation, standard electrode potentials.\nEMF, relation between Gibbs energy and cell potential.\nCorrosion, batteries, and fuel cells." },
          { name: 'Solid State', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
          { name: 'Surface Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
        ],
      },
      {
        title: 'Inorganic Chemistry',
        topics: [
          { name: 'Classification of Elements and Periodicity in Properties', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Modern periodic law and periodic table.\nPeriodic trends in atomic radius, ionization enthalpy, electron gain enthalpy, electronegativity, valency, oxidation states." },
          { name: 'Hydrogen', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 's-Block Elements', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'p-Block Elements', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "General trends and properties.\nPreparation and properties of important compounds of B, C, N, O, and halogens.\nAllotropes and uses of elements; anomalous behaviour of first elements." },
          { name: 'd and f-Block Elements', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Transition elements: general properties, variable oxidation states, formation of complexes, colour, catalysis, magnetic properties.\nPreparation and uses of KMnO₄ and K₂Cr₂O₇.\nLanthanoids and actinoids: electronic configuration, oxidation states, and lanthanoid contraction." },
          { name: 'Coordination Compounds', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Werner’s theory; ligands, coordination number, denticity, chelation.\nIUPAC nomenclature, isomerism.\nValence bond theory, crystal field theory (qualitative).\nColour and magnetic properties; importance in extraction and biological systems." },
          { name: 'Environmental Chemistry', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'Metallurgy', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'Salt Analysis', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, details: "Qualitative salt analysis:\nCations: Pb²⁺, Cu²⁺, Al³⁺, Fe³⁺, Zn²⁺, Ni²⁺, Ca²⁺, Ba²⁺, Mg²⁺, NH₄⁺\nAnions: CO₃²⁻, S²⁻, SO₄²⁻, NO₃⁻, NO₂⁻, Cl⁻, Br⁻, I⁻ (insoluble salts excluded)" },
        ],
      },
      {
        title: 'Organic Chemistry',
        topics: [
          { name: 'Purification & Characterization of Organic Compounds', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Methods of purification: crystallization, sublimation, distillation, chromatography.\nDetection of N, S, P, and halogens.\nEmpirical and molecular formula determination." },
          { name: 'Some Basic Principles of Organic Chemistry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Tetravalency of carbon, hybridization, classification of compounds.\nStructural and stereoisomerism.\nElectronic displacements: inductive, resonance, electromeric, and hyperconjugation effects.\nReaction intermediates: carbocations, carbanions, and free radicals.\nCommon reaction mechanisms: substitution, addition, elimination, rearrangement." },
          { name: 'Hydrocarbons', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Alkanes: nomenclature, isomerism, halogenation mechanism.\nAlkenes: electrophilic addition, Markovnikov’s and peroxide effects, ozonolysis, polymerization.\nAlkynes: preparation, properties, acidic character, addition reactions.\nAromatic hydrocarbons: structure of benzene, aromaticity, electrophilic substitution (halogenation, nitration, sulphonation, Friedel–Crafts)." },
          { name: 'Organic Compounds Containing Halogens', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Haloalkanes and haloarenes: preparation, properties, and uses.\nMechanisms of nucleophilic substitution (SN1, SN2).\nEnvironmental effects of halogenated compounds (DDT, freons)." },
          { name: 'Organic Compounds Containing Oxygen', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Alcohols, phenols, ethers: classification, nomenclature, preparation, and reactions.\nAldehydes and ketones: preparation, properties, nucleophilic addition, oxidation and reduction.\nCarboxylic acids: acidity, reactions, and derivatives." },
          { name: 'Organic Compounds Containing Nitrogen', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Amines: classification, structure, nomenclature, preparation, properties, and reactions.\nDiazonium salts: importance in synthesis." },
          { name: 'Biomolecules', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Carbohydrates: classification, monosaccharides, oligosaccharides, polysaccharides.\nProteins: amino acids, peptide bond, structure, denaturation, enzymes.\nVitamins and nucleic acids: composition, functions.\nHormones (general idea)." },
          { name: 'Polymers', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
          { name: 'Chemistry in Everyday Life', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'Principles Related to Practical Chemistry (POC)', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, details: "Detection of extra elements (N, S, halogens) in organic compounds.\nDetection of functional groups: –OH, carbonyl, carboxyl, amino.\nPreparation of compounds: Inorganic (Mohr’s salt, potash alum), Organic (Acetanilide, p-nitro acetanilide, aniline yellow, iodoform).\nTitrimetric exercises: acid–base and redox titrations, indicators, KMnO₄-based reactions." },
          { name: 'Reaction Mechanism', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
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
          { name: 'Sets, Relations and Functions', jeeMainWeightage: 3, jeeAdvancedWeightage: 5, details: "Sets: Representation of sets, subsets, power set, universal set.\nOperations on sets: union, intersection, complement, difference; algebraic properties of sets.\nVenn diagrams, applications of sets in simple problems.\nRelations: definition, domain, range, codomain, types (reflexive, symmetric, transitive, equivalence).\nFunctions: definition, domain, range, one-one, onto, into; composition and inverse of functions." },
          { name: 'Complex Numbers and Quadratic Equations', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Complex Numbers: Definition and representation on Argand plane. Algebra of complex numbers. Modulus, argument, conjugate; polar and exponential forms.\nQuadratic Equations: Solution of quadratic equations over reals and complex numbers. Nature of roots, relations between roots and coefficients. Formation of quadratic equation with given roots." },
          { name: 'Matrices and Determinants', jeeMainWeightage: 2, jeeAdvancedWeightage: 2, details: "Matrices: Definition, notation, and types. Algebra of matrices. Transpose, determinant of order 2 and 3.\nDeterminants: Evaluation of determinant; area of triangle using determinants. Adjoint and inverse of matrix; consistency and solution of linear equations using matrix method (up to 3 unknowns)." },
          { name: 'Permutations and Combinations', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Fundamental principle of counting.\nFactorial notation and simple identities.\nPermutations and combinations, simple applications including probability and arrangement problems." },
          { name: 'Mathematical Induction', jeeMainWeightage: 5, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "" },
          { name: 'Binomial Theorem and its Simple Applications', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Statement and proof for positive integral index.\nGeneral term, middle term, binomial coefficients, and their properties.\nSimple applications including approximation and expansion-related questions." },
          { name: 'Sequences and Series', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Definition of sequence and series, arithmetic and geometric progressions.\nInsertion of means, relation between A.M. and G.M.\nSum of n terms of arithmetic and geometric series.\nSpecial series: Σn, Σn², Σn³." },
        ],
      },
       {
        title: 'Calculus',
        topics: [
          { name: 'Limits, Continuity and Differentiability', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Concept of real-valued functions: polynomial, rational, trigonometric, exponential, logarithmic, and inverse functions.\nLimit and continuity, algebra of limits, one-sided limits.\nDifferentiability and derivative as rate of change.\nDerivatives of standard functions, product, quotient, and chain rules.\nApplications: increasing/decreasing functions, tangents and normals, maxima and minima." },
          { name: 'Integral Calculus', jeeMainWeightage: 2, jeeAdvancedWeightage: 1, details: "Integration as inverse process of differentiation.\nStandard integrals involving algebraic, trigonometric, exponential, and logarithmic functions.\nMethods: substitution, partial fractions, and integration by parts.\nDefinite integrals and their properties.\nApplication: finding area under curves." },
          { name: 'Differential Equations', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Order and degree of differential equations.\nFormation of differential equations.\nSolution of first-order and first-degree equations — separable, homogeneous, and linear types." },
          { name: 'Methods of Differentiation', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true, details: "" },
          { name: 'Tangent and Normal', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
          { name: 'Monotonicity', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, isOutOfSyllabus: true, details: "" },
          { name: 'Maxima and Minima', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, isOutOfSyllabus: true, details: "" },
          { name: 'Area Under The Curve', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Application: finding area under curves." },
        ],
      },
       {
        title: 'Coordinate Geometry',
        topics: [
          { name: 'Straight Lines', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Cartesian coordinate system in two dimensions.\nDistance formula, section formula, area of triangle, locus, slope of line.\nStraight lines: equation in various forms, angle between lines, condition for concurrency, distance from point to line." },
          { name: 'Circles', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Circles: standard form, tangent and normal, chord of contact, family of circles." },
          { name: 'Conic Sections', jeeMainWeightage: 2, jeeAdvancedWeightage: 3, details: "Parabola, ellipse, hyperbola: standard equations, eccentricity, foci, directrix, equations of tangent and normal, simple applications." },
          { name: 'Three Dimensional Geometry', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Coordinate system in 3D space, distance between points.\nDirection cosines and direction ratios.\nEquation of a line in space (point-direction form, two-point form).\nEquation of a plane in various forms.\nAngle between two lines, two planes, and a line and a plane.\nShortest distance between skew lines." },
          { name: 'Vector Algebra', jeeMainWeightage: 1, jeeAdvancedWeightage: 2, details: "Vectors and scalars, magnitude and direction of vector.\nAddition, subtraction, and multiplication by scalar.\nPosition vector, unit vector, and components.\nDot and cross product, projection of vector on a line.\nScalar triple product and its geometrical interpretation." },
        ],
      },
      {
        title: 'Trigonometry & Probability',
        topics: [
          { name: 'Trigonometrical Ratios and Identities', jeeMainWeightage: 3, jeeAdvancedWeightage: 4, details: "Trigonometric functions and their graphs.\nIdentities, transformations, and product-to-sum formulae." },
          { name: 'Trigonometric Equations', jeeMainWeightage: 4, jeeAdvancedWeightage: 4, details: "Trigonometric equations and general solutions." },
          { name: 'Inverse Trigonometric Functions', jeeMainWeightage: 3, jeeAdvancedWeightage: 3, details: "Inverse trigonometric functions, domain, range, and properties." },
          { name: 'Heights and Distances', jeeMainWeightage: 4, jeeAdvancedWeightage: 5, details: "" },
          { name: 'Statistics and Probability', jeeMainWeightage: 2, jeeAdvancedWeightage: 1, details: "Mean, median, mode for grouped and ungrouped data.\nMeasures of dispersion: range, mean deviation, variance, and standard deviation.\nProbability: classical and conditional definitions, multiplication and addition theorems.\nIndependent and dependent events, total probability, and Bayes’ theorem.\nRandom variable, probability distribution, mean and variance of a random variable." },
          { name: 'Mathematical Reasoning', jeeMainWeightage: 4, jeeAdvancedWeightage: 5, isOutOfSyllabus: true, details: "Statements, logical connectives, truth tables, tautology and contradiction.\nImplication, converse, contrapositive, and inverse.\nValidity of statements through truth tables." },
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
