import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'estimation-calc-draft';
const DEBOUNCE_MS = 500;

export interface StoredDraft<T> {
  data: T;
  savedAt: number;
}

export function useLocalStorage<T>(
  key: string = STORAGE_KEY,
  debounceMs: number = DEBOUNCE_MS
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Load draft from localStorage
  const loadDraft = useCallback((): StoredDraft<T> | null => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as StoredDraft<T>;
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
    return null;
  }, [key]);

  // Save draft to localStorage (debounced)
  const saveDraft = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          const draft: StoredDraft<T> = {
            data,
            savedAt: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(draft));
          setLastSaved(draft.savedAt);
        } catch (error) {
          console.error('Failed to save draft to localStorage:', error);
        }
      }, debounceMs);
    },
    [key, debounceMs]
  );

  // Save immediately (no debounce)
  const saveNow = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        const draft: StoredDraft<T> = {
          data,
          savedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(draft));
        setLastSaved(draft.savedAt);
      } catch (error) {
        console.error('Failed to save draft to localStorage:', error);
      }
    },
    [key]
  );

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error);
    }
  }, [key]);

  // Check if draft exists
  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    saveNow,
    clearDraft,
    hasDraft,
    lastSaved,
  };
}
