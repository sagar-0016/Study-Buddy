# Maintenance Mode Code Modifications Note

This file keeps track of all codebase files where client-side operations (specifically `localStorage` calls and Firebase Auth initialization) have been conditionally enclosed under the global `IS_MAINTENANCE` flag check to ensure server-side safety and maintenance-mode isolation.

---

## Central Config File
*   **File**: [config.ts](file:///home/sagar/Projects/Study-Buddy/src/lib/config.ts)
    *   **Action**: Created a single source of truth for the global maintenance state:
        ```typescript
        export const IS_MAINTENANCE = false; // Toggle to true to put the site on maintenance
        ```

---

## 🛠️ Modified Code Blocks

### 1. Root Layout Routing
*   **File**: [layout.tsx](file:///home/sagar/Projects/Study-Buddy/src/app/layout.tsx)
    *   **Modification**: Enclosed the entire `<Providers>` initialization block under the maintenance condition to completely isolate normal boot processes:
        ```tsx
        {IS_MAINTENANCE ? (
          <MaintenanceOverlay />
        ) : (
          <Providers>{children}</Providers>
        )}
        ```

### 2. Firebase App Initialization
*   **File**: [firebase.ts](file:///home/sagar/Projects/Study-Buddy/src/lib/firebase.ts)
    *   **Modification**: Enclosed the `getAuth(app)` block to prevent initializing Firebase Auth persistence during SSR (especially on Node v25+) and when maintenance is active:
        ```typescript
        const auth = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? getAuth(app) : null;
        ```

### 3. Local Storage React Hook
*   **File**: [use-local-storage.ts](file:///home/sagar/Projects/Study-Buddy/src/hooks/use-local-storage.ts)
    *   **Modification**: Bypassed local storage reading and writing completely when maintenance mode is active:
        ```typescript
        const [storedValue, setStoredValue] = useState<T>(() => {
          if (IS_MAINTENANCE || typeof window === 'undefined' || typeof document === 'undefined') {
            return initialValue;
          }
          // ...
        });

        useEffect(() => {
          if (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') {
            // ...
          }
        }, [key, storedValue]);
        ```

### 4. Spaced Repetition settings check
*   **File**: [settings.ts](file:///home/sagar/Projects/Study-Buddy/src/lib/settings.ts)
    *   **Modification**: Prevented reading direct edit settings from local storage under maintenance:
        ```typescript
        export const isDirectEditEnabled = (): boolean => {
            if (IS_MAINTENANCE || typeof window === "undefined" || typeof document === "undefined") {
                return false; 
            }
            // ...
        };
        ```

### 5. Timetable Task Loader
*   **File**: [current-task.tsx](file:///home/sagar/Projects/Study-Buddy/src/components/home/current-task.tsx)
    *   **Modification**: Enclosed the initial token loader check to avoid calling local storage on the server or when maintenance is on:
        ```typescript
        useEffect(() => {
          const level = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? localStorage.getItem('study-buddy-access-level') as AccessLevel | null : null;
          setAccessLevel(level);
        }, []);
        ```

### 6. Flashcard Decks Access Level Check
*   **File**: [deck-selection.tsx](file:///home/sagar/Projects/Study-Buddy/src/components/flashcards/deck-selection.tsx)
    *   **Modification**: Guarded local storage reading inside the badge text renderer:
        ```typescript
        const getBadgeText = () => {
          const accessLevel = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? localStorage.getItem('study-buddy-access-level') as AccessLevel | null : null;
          // ...
        };
        ```

### 7. Revision Centre Initial State Check
*   **File**: [revision-centre.tsx](file:///home/sagar/Projects/Study-Buddy/src/components/revisions/revision-centre.tsx)
    *   **Modification**: Enclosed the local storage fetch during initial check phase:
        ```typescript
        useEffect(() => {
          const level = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? localStorage.getItem('study-buddy-access-level') as AccessLevel | null : null;
          setAccessLevel(level);
          // ...
        }, []);
        ```
