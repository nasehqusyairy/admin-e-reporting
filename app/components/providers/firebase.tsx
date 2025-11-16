// FirebaseContext.tsx
import { createContext, useContext, type ReactNode } from "react";
import { getFirebaseInstance, type FirebaseInstance } from "~/lib/get-firebase";

const FirebaseContext = createContext<FirebaseInstance | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    return (
        <FirebaseContext.Provider value={getFirebaseInstance()}>
            {children}
        </FirebaseContext.Provider>
    );
}

export function useFirebase() {
    const ctx = useContext(FirebaseContext);
    if (!ctx) throw new Error("useFirebase must be used within <FirebaseProvider>");
    return ctx;
}
