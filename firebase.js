// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBehRDAw1_p1cOtJVr61Hl1BrHqJUIuUjA",
  authDomain: "form-buider.firebaseapp.com",
  projectId: "form-buider",
  storageBucket: "form-buider.firebasestorage.app",
  messagingSenderId: "982687004574",
  appId: "1:982687004574:web:4d8ceb5a87128e77ddc88f",
  measurementId: "G-XJVQ9BCB5X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
export { app };
