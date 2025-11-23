import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXj9RaEy9l2tGQAhgG0d-2bwZyuaVaLZg",
  authDomain: "granamais-71aee.firebaseapp.com",
  projectId: "granamais-71aee",
  storageBucket: "granamais-71aee.firebasestorage.app",
  messagingSenderId: "536164441222",
  appId: "1:536164441222:web:4ea24d349e92e559f5c507",
  measurementId: "G-SBH4YZ695Y"
};

// Inicializa o Firebase
export const app = initializeApp(firebaseConfig);

// Corrige persistência do Auth no React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore
export const db = getFirestore(app);
