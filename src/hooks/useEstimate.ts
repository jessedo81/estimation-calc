import { useState, useCallback, useMemo } from 'react';
import type { RoomInput, InteriorJobInput, EstimateResult } from '../types/estimate';
import { createRoom, DEFAULT_ESTIMATE_STATE } from '../types/estimate';
import {
  calculateRoom,
  calculateInteriorEstimate,
} from '../lib/calculations/interior';

interface UseEstimateReturn {
  // State
  job: InteriorJobInput;
  estimate: EstimateResult;
  roomTotals: Map<string, number>;

  // Room actions
  addRoom: (name?: string) => void;
  updateRoom: (roomId: string, room: RoomInput) => void;
  duplicateRoom: (roomId: string) => void;
  removeRoom: (roomId: string) => void;
  renameRoom: (roomId: string, newName: string) => void;

  // Job-level actions
  setAdditionalColors: (count: number) => void;
  reset: () => void;
}

export function useEstimate(): UseEstimateReturn {
  const [job, setJob] = useState<InteriorJobInput>(DEFAULT_ESTIMATE_STATE);

  // Calculate estimate whenever job changes
  const estimate = useMemo(() => calculateInteriorEstimate(job), [job]);

  // Calculate individual room totals
  const roomTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const room of job.rooms) {
      const result = calculateRoom(room);
      totals.set(room.id, result.roomTotal);
    }
    return totals;
  }, [job.rooms]);

  const addRoom = useCallback((name?: string) => {
    setJob((prev) => {
      const roomNumber = prev.rooms.length + 1;
      const newRoom = createRoom(name || `Room ${roomNumber}`);
      return {
        ...prev,
        rooms: [...prev.rooms, newRoom],
      };
    });
  }, []);

  const updateRoom = useCallback((roomId: string, updatedRoom: RoomInput) => {
    setJob((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? updatedRoom : room
      ),
    }));
  }, []);

  const duplicateRoom = useCallback((roomId: string) => {
    setJob((prev) => {
      const roomToDuplicate = prev.rooms.find((r) => r.id === roomId);
      if (!roomToDuplicate) return prev;

      const newRoom: RoomInput = {
        ...roomToDuplicate,
        id: crypto.randomUUID(),
        name: `${roomToDuplicate.name} (copy)`,
      };

      const roomIndex = prev.rooms.findIndex((r) => r.id === roomId);
      const newRooms = [...prev.rooms];
      newRooms.splice(roomIndex + 1, 0, newRoom);

      return {
        ...prev,
        rooms: newRooms,
      };
    });
  }, []);

  const removeRoom = useCallback((roomId: string) => {
    setJob((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((room) => room.id !== roomId),
    }));
  }, []);

  const renameRoom = useCallback((roomId: string, newName: string) => {
    setJob((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, name: newName } : room
      ),
    }));
  }, []);

  const setAdditionalColors = useCallback((count: number) => {
    setJob((prev) => ({
      ...prev,
      additionalColors: Math.max(0, count),
    }));
  }, []);

  const reset = useCallback(() => {
    setJob(DEFAULT_ESTIMATE_STATE);
  }, []);

  return {
    job,
    estimate,
    roomTotals,
    addRoom,
    updateRoom,
    duplicateRoom,
    removeRoom,
    renameRoom,
    setAdditionalColors,
    reset,
  };
}
