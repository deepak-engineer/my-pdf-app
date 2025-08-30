// src/hooks/useLocalStorage.js
"use client"; // This hook will be used in client components

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Use a function to initialize state from localStorage
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue; // Server-side rendering (SSR) ke dauraan initialValue return karo
    }
    try {
      const item = window.localStorage.getItem(key);
      // Agar localStorage mein item hai, to use parse karke return karo, varna initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Error handling agar localStorage access na ho ya parse na ho paye
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // useEffect to update localStorage whenever the state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
      }
    }
  }, [key, value]); // Dependencies: key aur value

  return [value, setValue];
}