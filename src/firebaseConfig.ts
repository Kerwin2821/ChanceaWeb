import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration extracted from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyBluBZQaekLn_TdskLR0UtIhMy9CGl9Hzg",
    authDomain: "chanceaappp-23758.firebaseapp.com",
    databaseURL: "https://chanceaappp-23758-default-rtdb.firebaseio.com",
    projectId: "chanceaappp-23758",
    storageBucket: "chanceaappp-23758.appspot.com",
    messagingSenderId: "325516731671",
    appId: "1:325516731671:web:placeholder", // Using a placeholder for web app ID as it's not in the JSON, but usually required for analytics only.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
