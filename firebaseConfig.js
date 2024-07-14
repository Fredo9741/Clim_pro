// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC2MkEdXUNBxzE2Tq8rsYlQ2Biaa1Ivh94",
    authDomain: "clim-pro.firebaseapp.com",
    projectId: "clim-pro",
    storageBucket: "clim-pro.appspot.com",
    messagingSenderId: "744483782402",
    appId: "1:744483782402:web:564f077020442721e08c1b",
    measurementId: "G-X9QDZL6SFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
