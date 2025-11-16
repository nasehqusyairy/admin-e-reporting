import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyAHND5382Ds5l0lQMeR5gNBmLWDXsQgM7E",
    authDomain: "e-reporting-region-id.firebaseapp.com",
    projectId: "e-reporting-region-id",
    storageBucket: "e-reporting-region-id.firebasestorage.app",
    messagingSenderId: "161566405355",
    appId: "1:161566405355:web:d21b371932399b35ba84ae",
    measurementId: "G-YWW4F36BHY"
};

export type FirebaseInstance = {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
}

export function getFirebaseInstance(): FirebaseInstance {
    let app: FirebaseApp;
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    }
    else {
        app = getApp();
    }
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
}