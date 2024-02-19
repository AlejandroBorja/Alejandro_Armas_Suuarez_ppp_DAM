
import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const vapidKey = "BPb3Dm83u79c-LQikO6Cs_b0JpAq9wvPMXoV8DWuN7z7q2Nt38s7RdofubikpAtkJ2yyn7p1opWsjYli361OSO8"


export const firebaseConfig = {
  apiKey: "AIzaSyAA6lybSWEzkxz1FBdMWEIBcr3prd_-Ax0",
  authDomain: "proyectoreact01-1b36b.firebaseapp.com",
  projectId: "proyectoreact01-1b36b",
  storageBucket: "proyectoreact01-1b36b.appspot.com",
  messagingSenderId: "509905993888",
  appId: "1:509905993888:web:7588a09e6f506641b7c9c5"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const storage = getStorage(app);
//export const auth = getAuth(app);
