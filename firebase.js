// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvtoGeDP2ixpPi2e-Nipats4PMSu__x8c",
  authDomain: "chatbot-e7639.firebaseapp.com",
  projectId: "chatbot-e7639",
  storageBucket: "chatbot-e7639.firebasestorage.app",
  messagingSenderId: "340439686138",
  appId: "1:340439686138:web:1bf3431c905669e0382243"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };