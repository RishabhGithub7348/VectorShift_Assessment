"use client"; 

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

interface StoredItem<T> {
  value: T;
  timestamp: number; // Unix timestamp in milliseconds
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Read value safely, checking expiration
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = parseJSON<StoredItem<T>>(item);
      if (!parsedItem) return initialValue;

      const { value, timestamp } = parsedItem;
      const now = Date.now();
      const oneHour = 3600000; // 1 hour in milliseconds

      // Delete if older than 1 hour
      if (now - timestamp > oneHour) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // Initialize state with initialValue, sync with localStorage on client
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const value = readValue();
    if (JSON.stringify(value) !== JSON.stringify(storedValue)) {
      setStoredValue(value);
    }
  }, [readValue, storedValue]);

  // Update state and localStorage with timestamp
  const setValue: SetValue<T> = useCallback((valueOrFn) => {
    if (typeof window === "undefined") {
      console.warn(`Tried setting localStorage key "${key}" on server`);
      return;
    }
    try {
      const newValue = valueOrFn instanceof Function
        ? valueOrFn(storedValue)
        : valueOrFn;
      const storedItem: StoredItem<T> = {
        value: newValue,
        timestamp: Date.now(),
      };
      const stringifiedValue = JSON.stringify(storedItem);
      if (stringifiedValue !== JSON.stringify({ value: storedValue, timestamp: Date.now() })) {
        window.localStorage.setItem(key, stringifiedValue);
        setStoredValue(newValue);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Helper to parse JSON safely
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    return undefined;
  }
}