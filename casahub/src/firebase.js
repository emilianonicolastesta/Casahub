import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJPrR6KVIjlMsRlTLmElEzPwL3VPBWQHQ",
  authDomain: "casahub-060123.firebaseapp.com",
  projectId: "casahub-060123",
  storageBucket: "casahub-060123.firebasestorage.app",
  messagingSenderId: "17305434986",
  appId: "1:17305434986:web:ce4cd83897852ee5d10313",
  measurementId: "G-K02WQ2FV6N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
