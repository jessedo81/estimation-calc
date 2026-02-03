import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  ExteriorJobInput,
  ExteriorEstimateResult,
  SideDifficulty,
  GarageDoorInput,
} from '../types/exterior';
import {
  StoryType,
  FlakingSeverity,
  ExteriorScope,
  createDefaultExteriorJob,
} from '../types/exterior';
import { calculateExteriorEstimate } from '../lib/calc/exterior';
import { useLocalStorage } from './useLocalStorage';

interface UseExteriorEstimateReturn {
  // State
  job: ExteriorJobInput;
  estimate: ExteriorEstimateResult;
  lastSaved: number | null;
  hasPendingDraft: boolean;

  // Property actions
  setHouseSqft: (sqft: number) => void;
  setStoryType: (storyType: StoryType) => void;
  updateSideDifficulty: (
    side: 'front' | 'back' | 'left' | 'right',
    updates: Partial<Omit<SideDifficulty, 'side'>>
  ) => void;
  setFlakingSeverity: (severity: FlakingSeverity) => void;
  setHeavyFlakingAdjustment: (adjustment: number) => void;
  setScope: (scope: ExteriorScope) => void;

  // Add-on actions
  setShutterCount: (count: number) => void;
  setPaintFrontDoor: (paint: boolean) => void;
  setGarageDoors: (doors: GarageDoorInput) => void;
  setNotes: (notes: string) => void;

  // General actions
  reset: () => void;

  // Draft actions
  loadFromDraft: () => void;
  dismissDraft: () => void;
}

// Check for existing draft (runs once before component mounts)
function checkForExistingDraft(key: string): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const draft = JSON.parse(stored);
      return draft?.data?.houseSqft > 0 || draft?.data?.shutterCount > 0;
    }
  } catch {
    // Ignore errors
  }
  return false;
}

export function useExteriorEstimate(): UseExteriorEstimateReturn {
  const [job, setJob] = useState<ExteriorJobInput>(createDefaultExteriorJob);
  const [hasPendingDraft, setHasPendingDraft] = useState(() =>
    checkForExistingDraft('estimation-calc-exterior-draft')
  );

  const { loadDraft, saveDraft, clearDraft, lastSaved } =
    useLocalStorage<ExteriorJobInput>('estimation-calc-exterior-draft');

  // Auto-save whenever job changes (skip if there's a pending draft to recover)
  useEffect(() => {
    if (!hasPendingDraft) {
      saveDraft(job);
    }
  }, [job, hasPendingDraft, saveDraft]);

  // Calculate estimate whenever job changes
  const estimate = useMemo(() => calculateExteriorEstimate(job), [job]);

  // Property setters
  const setHouseSqft = useCallback((sqft: number) => {
    setJob((prev) => ({
      ...prev,
      houseSqft: Math.max(0, sqft),
    }));
  }, []);

  const setStoryType = useCallback((storyType: StoryType) => {
    setJob((prev) => ({
      ...prev,
      storyType,
    }));
  }, []);

  const updateSideDifficulty = useCallback(
    (
      side: 'front' | 'back' | 'left' | 'right',
      updates: Partial<Omit<SideDifficulty, 'side'>>
    ) => {
      setJob((prev) => ({
        ...prev,
        sideDifficulties: prev.sideDifficulties.map((s) =>
          s.side === side ? { ...s, ...updates } : s
        ),
      }));
    },
    []
  );

  const setFlakingSeverity = useCallback((severity: FlakingSeverity) => {
    setJob((prev) => ({
      ...prev,
      flakingSeverity: severity,
      // Reset heavy adjustment when switching away from heavy
      heavyFlakingAdjustment:
        severity === FlakingSeverity.HEAVY
          ? prev.heavyFlakingAdjustment ?? 0.5
          : undefined,
    }));
  }, []);

  const setHeavyFlakingAdjustment = useCallback((adjustment: number) => {
    setJob((prev) => ({
      ...prev,
      heavyFlakingAdjustment: Math.min(1.0, Math.max(0.5, adjustment)),
    }));
  }, []);

  const setScope = useCallback((scope: ExteriorScope) => {
    setJob((prev) => ({
      ...prev,
      scope,
    }));
  }, []);

  // Add-on setters
  const setShutterCount = useCallback((count: number) => {
    setJob((prev) => ({
      ...prev,
      shutterCount: Math.max(0, count),
    }));
  }, []);

  const setPaintFrontDoor = useCallback((paint: boolean) => {
    setJob((prev) => ({
      ...prev,
      paintFrontDoor: paint,
    }));
  }, []);

  const setGarageDoors = useCallback((doors: GarageDoorInput) => {
    setJob((prev) => ({
      ...prev,
      garageDoors: {
        oneCarDoors: Math.max(0, doors.oneCarDoors),
        twoCarDoors: Math.max(0, doors.twoCarDoors),
      },
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setJob((prev) => ({
      ...prev,
      notes,
    }));
  }, []);

  // General actions
  const reset = useCallback(() => {
    setJob(createDefaultExteriorJob());
    clearDraft();
  }, [clearDraft]);

  const loadFromDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setJob(draft.data);
    }
    setHasPendingDraft(false);
  }, [loadDraft]);

  const dismissDraft = useCallback(() => {
    clearDraft();
    setHasPendingDraft(false);
  }, [clearDraft]);

  return {
    job,
    estimate,
    lastSaved,
    hasPendingDraft,
    setHouseSqft,
    setStoryType,
    updateSideDifficulty,
    setFlakingSeverity,
    setHeavyFlakingAdjustment,
    setScope,
    setShutterCount,
    setPaintFrontDoor,
    setGarageDoors,
    setNotes,
    reset,
    loadFromDraft,
    dismissDraft,
  };
}
