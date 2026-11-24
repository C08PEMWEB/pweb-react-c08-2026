import { useEffect, useState } from "react";

/**
 * Custom Hook wajib untuk menunda pembaruan nilai (misal input pencarian)
 * agar filtering tidak berjalan di setiap ketukan tombol.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

