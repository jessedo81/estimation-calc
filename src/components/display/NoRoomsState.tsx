import { Button } from '@tarva/ui';
import { Home, Plus } from 'lucide-react';

interface NoRoomsStateProps {
  onAddRoom: () => void;
}

export function NoRoomsState({ onAddRoom }: NoRoomsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Home className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">No rooms added yet</h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        Start your estimate by adding the first room. You can add bedrooms,
        bathrooms, kitchens, and more.
      </p>

      <Button onClick={onAddRoom} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        Add First Room
      </Button>
    </div>
  );
}
