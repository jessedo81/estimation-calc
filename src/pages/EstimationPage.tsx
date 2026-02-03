import { useState } from 'react';
import { Button } from '@tarva/ui';
import { Plus } from 'lucide-react';
import { useEstimate } from '../hooks/useEstimate';
import {
  RoomCard,
  RenameDialog,
  EstimateSummaryFooter,
  ResetConfirmDialog,
  NoRoomsState,
} from '../components';

export function EstimationPage() {
  const {
    job,
    estimate,
    roomTotals,
    addRoom,
    updateRoom,
    duplicateRoom,
    removeRoom,
    renameRoom,
    reset,
  } = useEstimate();

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [renameDialogState, setRenameDialogState] = useState<{
    open: boolean;
    roomId: string;
    roomIndex: number;
    currentName: string;
  }>({
    open: false,
    roomId: '',
    roomIndex: 0,
    currentName: '',
  });

  const handleReset = () => {
    setResetDialogOpen(false);
    reset();
  };

  const openRenameDialog = (
    roomId: string,
    roomIndex: number,
    currentName: string
  ) => {
    setRenameDialogState({
      open: true,
      roomId,
      roomIndex,
      currentName,
    });
  };

  const handleRename = (newName: string) => {
    renameRoom(renameDialogState.roomId, newName);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Interior Estimate</h1>
              <p className="text-muted-foreground">
                Calculate painting costs room by room
              </p>
            </div>

            {job.rooms.length > 0 && (
              <Button onClick={() => addRoom()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {job.rooms.length === 0 ? (
          <NoRoomsState onAddRoom={() => addRoom()} />
        ) : (
          <div className="space-y-6">
            {job.rooms.map((room, index) => (
              <RoomCard
                key={room.id}
                room={room}
                index={index}
                onUpdate={(updatedRoom) => updateRoom(room.id, updatedRoom)}
                onDuplicate={() => duplicateRoom(room.id)}
                onRename={() => openRenameDialog(room.id, index, room.name)}
                onRemove={() => removeRoom(room.id)}
                roomTotal={roomTotals.get(room.id) || 0}
              />
            ))}

            {/* Add another room button at bottom */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="lg" onClick={() => addRoom()}>
                <Plus className="mr-2 h-5 w-5" />
                Add Another Room
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <EstimateSummaryFooter
        subtotal={estimate.subtotal}
        setupFee={estimate.setupFee}
        jobTotal={estimate.total}
        roomCount={job.rooms.length}
        onReset={() => setResetDialogOpen(true)}
      />

      {/* Dialogs */}
      <ResetConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleReset}
        roomCount={job.rooms.length}
      />

      <RenameDialog
        open={renameDialogState.open}
        onOpenChange={(open) =>
          setRenameDialogState((prev) => ({ ...prev, open }))
        }
        currentName={renameDialogState.currentName}
        onRename={handleRename}
        roomIndex={renameDialogState.roomIndex}
      />
    </div>
  );
}
