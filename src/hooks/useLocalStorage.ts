import { useEffect, useState } from "react";

/**
 * Custom Hook wajib untuk persistensi state ke localStorage secara aman dan type-safe.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Abaikan error kuota penuh atau private mode browser
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

