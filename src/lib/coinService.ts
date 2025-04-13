// src/lib/coinService.ts
// This file contains functions for interacting with the coin database

import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  onSnapshot,
  Timestamp,
  DocumentData
} from 'firebase/firestore';

// Example coin interface - you would typically import this from a types file
export interface Coin {
  id: string;
  name: string;
  image: string;
  acquisitionDate: string;
  purchasePrice: number;
  currentValue: number;
  roi: number;
  description?: string;
  grade?: string;
  mint?: string;
  year?: number;
  isSold: boolean;
  soldPrice?: number;
  soldDate?: Date;
}

/**
 * Database Integration Notes:
 * 
 * Using localStorage for persistence. This ensures data persistence
 * between refreshes and deployments on Vercel.
 */

// Collection reference
const coinsCollection = collection(db, 'coins');

// Helper to convert Firestore data to Coin
const convertToCoin = (doc: DocumentData): Coin => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    image: data.image,
    acquisitionDate: data.acquisitionDate,
    purchasePrice: data.purchasePrice,
    currentValue: data.currentValue,
    roi: data.roi,
    description: data.description,
    grade: data.grade,
    mint: data.mint,
    year: data.year,
    isSold: data.isSold || false,
    soldPrice: data.soldPrice,
    soldDate: data.soldDate ? data.soldDate.toDate() : undefined
  };
};

// Get all coins
export const getAllCoins = async (): Promise<Coin[]> => {
  try {
    const querySnapshot = await getDocs(coinsCollection);
    return querySnapshot.docs.map(convertToCoin);
  } catch (error) {
    console.error("Error getting coins: ", error);
    return [];
  }
};

// Add a new coin
export const addCoin = async (coin: Omit<Coin, 'id'>): Promise<Coin> => {
  try {
    const docRef = await addDoc(coinsCollection, {
      ...coin,
      // Handle date fields correctly for Firestore
      soldDate: coin.soldDate ? Timestamp.fromDate(new Date(coin.soldDate)) : null
    });
    
    return {
      ...coin,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error adding coin: ", error);
    throw error;
  }
};

// Update a coin
export const updateCoin = async (coin: Coin): Promise<Coin> => {
  try {
    const coinRef = doc(db, 'coins', coin.id);
    
    // Prepare data for Firestore, handling Date objects
    const coinData = {
      ...coin,
      soldDate: coin.soldDate ? Timestamp.fromDate(new Date(coin.soldDate)) : null
    };
    
    // Remove id from the data to be updated
    const { id, ...dataToUpdate } = coinData;
    
    await updateDoc(coinRef, dataToUpdate);
    return coin;
  } catch (error) {
    console.error("Error updating coin: ", error);
    throw error;
  }
};

// Delete a coin
export const deleteCoin = async (coinId: string): Promise<void> => {
  try {
    const coinRef = doc(db, 'coins', coinId);
    await deleteDoc(coinRef);
  } catch (error) {
    console.error("Error deleting coin: ", error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToCoinsUpdates = (onUpdate: (coins: Coin[]) => void) => {
  return onSnapshot(coinsCollection, (snapshot) => {
    const coins = snapshot.docs.map(convertToCoin);
    onUpdate(coins);
  });
};

// Unsubscribe from real-time updates
export const unsubscribeFromCoinsUpdates = (subscription: any) => {
  if (subscription) {
    subscription();
  }
}; 