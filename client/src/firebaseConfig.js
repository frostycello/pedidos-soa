import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMi8KZSl2ZohNufRPo8r0JBtH0sOZnXlM",
  authDomain: "social-ead91.firebaseapp.com",
  projectId: "social-ead91",
  storageBucket: "social-ead91.firebasestorage.app",
  messagingSenderId: "851952687261",
  appId: "1:851952687261:web:f430256a68334a2df91c74"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();