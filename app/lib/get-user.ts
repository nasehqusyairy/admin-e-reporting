import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseInstance } from "./get-firebase";

export function getUser(): Promise<User | undefined> {
    const { auth } = getFirebaseInstance();

    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user ?? undefined);
        });
    });
}
