import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx_2kHJ4GhOhlMNelZc4qMdP-LG-B7w3M",
  authDomain: "busflow-a5f4d.firebaseapp.com",
  databaseURL: "https://busflow-a5f4d-default-rtdb.firebaseio.com/",
  projectId: "busflow-a5f4d",
  storageBucket: "busflow-a5f4d.firebasestorage.app",
  messagingSenderId: "861354430841",
  appId: "1:861354430841:web:f59e16614ff39b80179fa8",
  measurementId: "G-HQEL15TJBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);

