// src/lib/coinService.ts
// This file contains functions for interacting with the coin database

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

// Initialize mock database from localStorage
const initializeDatabase = (): Coin[] => {
  if (typeof window !== 'undefined') {
    const storedCoins = localStorage.getItem('apex_coins');
    if (storedCoins) {
      try {
        return JSON.parse(storedCoins);
      } catch (error) {
        console.error('Failed to parse stored coins:', error);
        return [];
      }
    }
  }
  return [];
};

// Save database to localStorage
const saveToLocalStorage = (coins: Coin[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apex_coins', JSON.stringify(coins));
  }
};

// Mock database for development
let mockDatabase: Coin[] = initializeDatabase();

// Get all coins
export const getAllCoins = async (): Promise<Coin[]> => {
  // Refresh from localStorage each time
  mockDatabase = initializeDatabase();
  return mockDatabase;
};

// Add a new coin
export const addCoin = async (coin: Omit<Coin, 'id'>): Promise<Coin> => {
  const newCoin = { ...coin, id: Date.now().toString() };
  mockDatabase.push(newCoin);
  
  // Save to localStorage
  saveToLocalStorage(mockDatabase);
  
  return newCoin;
};

// Update a coin
export const updateCoin = async (coin: Coin): Promise<Coin> => {
  const index = mockDatabase.findIndex(c => c.id === coin.id);
  if (index !== -1) {
    mockDatabase[index] = coin;
    
    // Save to localStorage
    saveToLocalStorage(mockDatabase);
  }
  return coin;
};

// Delete a coin
export const deleteCoin = async (coinId: string): Promise<void> => {
  mockDatabase = mockDatabase.filter(coin => coin.id !== coinId);
  
  // Save to localStorage
  saveToLocalStorage(mockDatabase);
};

// Subscribe to real-time updates
export const subscribeToCoinsUpdates = (onUpdate: (coins: Coin[]) => void) => {
  // Initial update with current data
  onUpdate(mockDatabase);
  
  // Create a simple polling mechanism to check localStorage for changes
  const intervalId = setInterval(() => {
    const storedCoins = initializeDatabase();
    if (JSON.stringify(storedCoins) !== JSON.stringify(mockDatabase)) {
      mockDatabase = storedCoins;
      onUpdate(mockDatabase);
    }
  }, 2000); // Check every 2 seconds
  
  return {
    id: intervalId,
    unsubscribe: () => clearInterval(intervalId)
  };
};

// Unsubscribe from real-time updates
export const unsubscribeFromCoinsUpdates = (subscription: any) => {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  }
}; 