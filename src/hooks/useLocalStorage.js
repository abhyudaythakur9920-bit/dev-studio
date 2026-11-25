import { useState, useEffect } from 'react';

/**
 * Custom React Hook for persistent browser storage.
 * Automatically synchronizes state with window.localStorage.
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The fallback initial state
 * @returns {[any, Function]} - [storedValue, setStoredValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
