import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@tarva/ui';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => void;
  roomIndex: number;
}

function RenameForm({
  currentName,
  onRename,
  onCancel,
  roomIndex,
}: {
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
  roomIndex: number;
}) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onRename(trimmedName);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Rename Room {roomIndex + 1}</DialogTitle>
        <DialogDescription>
          Give this room a descriptive name to help identify it in the estimate.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <Label htmlFor="room-name">Room Name</Label>
        <Input
          id="room-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="e.g., Master Bedroom, Kitchen"
          className="mt-2"
          autoFocus
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
  roomIndex,
}: RenameDialogProps) {
  const handleRename = (newName: string) => {
    onRename(newName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {open && (
          <RenameForm
            currentName={currentName}
            onRename={handleRename}
            onCancel={() => onOpenChange(false)}
            roomIndex={roomIndex}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
