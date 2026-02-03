import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Checkbox,
} from '@tarva/ui';
import { MoreHorizontal, Copy, Edit, Trash } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import type { RoomInput } from '../../types/estimate';
import { RoomType, TrimMode, WindowSize } from '../../types/estimate';
import { RATES } from '../../lib/calc/rates';

interface RoomCardProps {
  room: RoomInput;
  index: number;
  onUpdate: (room: RoomInput) => void;
  onDuplicate: () => void;
  onRename: () => void;
  onRemove: () => void;
  roomTotal: number;
}

const ROOM_TYPES = [
  {
    value: RoomType.GENERAL,
    label: 'General Room',
    multiplier: RATES.WALL_MULT.GENERAL,
    description: 'Bedrooms, living rooms, offices',
  },
  {
    value: RoomType.KITCHEN,
    label: 'Kitchen',
    multiplier: RATES.WALL_MULT.KITCHEN,
    description: 'Prep-intensive, more cut-in work',
  },
  {
    value: RoomType.BATHROOM,
    label: 'Bathroom',
    multiplier: RATES.WALL_MULT.BATHROOM,
    description: 'Tight spaces, fixtures, moisture prep',
  },
] as const;

export function RoomCard({
  room,
  index,
  onUpdate,
  onDuplicate,
  onRename,
  onRemove,
  roomTotal,
}: RoomCardProps) {
  const roomType = ROOM_TYPES.find((t) => t.value === room.roomType);

  const updateField = <K extends keyof RoomInput>(
    field: K,
    value: RoomInput[K]
  ) => {
    onUpdate({ ...room, [field]: value });
  };

  const effectiveMultiplier = room.vaulted
    ? (roomType?.multiplier || RATES.WALL_MULT.GENERAL) + RATES.VAULTED_ADD
    : roomType?.multiplier || RATES.WALL_MULT.GENERAL;

  return (
    <Card className="px-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">
            Room {index + 1}: {room.name}
          </CardTitle>
          <Badge variant="secondary">{effectiveMultiplier.toFixed(1)}x</Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Room actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRename}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Room Type & Square Footage */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`${room.id}-type`}
              className="text-sm font-medium leading-none"
            >
              Room Type
            </label>
            <select
              id={`${room.id}-type`}
              value={room.roomType}
              onChange={(e) =>
                updateField('roomType', e.target.value as RoomType)
              }
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.multiplier}x)
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {roomType?.description}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${room.id}-sqft`}
              className="text-sm font-medium leading-none"
            >
              Room sq.ft
            </label>
            <input
              id={`${room.id}-sqft`}
              type="number"
              value={room.floorSqft}
              onChange={(e) =>
                updateField('floorSqft', parseInt(e.target.value, 10) || 0)
              }
              min={0}
              max={10000}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">Floor area</p>
          </div>
        </div>

        {/* Paint Scope */}
        <div>
          <label className="text-sm font-medium mb-3 block">Paint Scope</label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${room.id}-walls`}
                checked={room.paintWalls}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('paintWalls', checked === true)
                }
              />
              <label htmlFor={`${room.id}-walls`} className="text-sm">
                Walls
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${room.id}-ceiling`}
                checked={room.paintCeiling}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('paintCeiling', checked === true)
                }
              />
              <label htmlFor={`${room.id}-ceiling`} className="text-sm">
                Ceiling
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${room.id}-vaulted`}
                checked={room.vaulted}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('vaulted', checked === true)
                }
              />
              <label htmlFor={`${room.id}-vaulted`} className="text-sm">
                Vaulted (+0.5x)
              </label>
            </div>
          </div>
        </div>

        {/* Trim Options */}
        <div>
          <label className="text-sm font-medium mb-3 block">Trim</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <select
                id={`${room.id}-trim`}
                value={room.trimMode}
                onChange={(e) =>
                  updateField('trimMode', e.target.value as TrimMode)
                }
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value={TrimMode.NONE}>No trim</option>
                <option value={TrimMode.TRIM_PACKAGE_SF}>
                  Trim package (SF x $0.50)
                </option>
                <option value={TrimMode.BASEBOARDS_LF}>
                  Baseboards (LF x rate)
                </option>
              </select>
            </div>

            {room.trimMode === TrimMode.BASEBOARDS_LF && (
              <div className="space-y-2">
                <input
                  id={`${room.id}-baseboard-lf`}
                  type="number"
                  value={room.baseboardLF}
                  onChange={(e) =>
                    updateField('baseboardLF', parseInt(e.target.value, 10) || 0)
                  }
                  min={0}
                  placeholder="Linear feet"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  {room.paintWalls
                    ? `$${RATES.BASEBOARD_LF_WITH_WALLS}/LF with walls`
                    : `$${RATES.BASEBOARD_LF_ONLY}/LF (baseboards only)`}
                </p>
              </div>
            )}
          </div>

          {room.trimMode !== TrimMode.NONE && (
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id={`${room.id}-stained`}
                checked={room.stainedTrimConversion}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('stainedTrimConversion', checked === true)
                }
              />
              <label htmlFor={`${room.id}-stained`} className="text-sm">
                Stained wood conversion (3x)
              </label>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div>
          <label className="text-sm font-medium mb-3 block">Line Items</label>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <NumberStepper
              id={`${room.id}-doors`}
              label="Door sides"
              value={room.doorSides}
              onChange={(value) => updateField('doorSides', value)}
              unitPrice={RATES.DOOR_PER_SIDE}
              unitLabel="side"
            />

            <NumberStepper
              id={`${room.id}-closets-std`}
              label="Standard closets"
              value={room.closetsStandard}
              onChange={(value) => updateField('closetsStandard', value)}
              unitPrice={RATES.CLOSET_STANDARD}
              unitLabel="closet"
            />

            <NumberStepper
              id={`${room.id}-closets-walkin`}
              label="Walk-in closets"
              value={room.closetsWalkIn}
              onChange={(value) => updateField('closetsWalkIn', value)}
              unitPrice={RATES.CLOSET_WALKIN}
              unitLabel="closet"
            />

            <NumberStepper
              id={`${room.id}-windows`}
              label="Windows"
              value={room.windows.length}
              onChange={(value) => {
                const currentLength = room.windows.length;
                if (value > currentLength) {
                  // Add standard windows
                  const newWindows = [
                    ...room.windows,
                    ...Array(value - currentLength).fill({
                      sizeFactor: WindowSize.STANDARD,
                    }),
                  ];
                  updateField('windows', newWindows);
                } else {
                  // Remove windows from the end
                  updateField('windows', room.windows.slice(0, value));
                }
              }}
              unitPrice={RATES.WINDOW_BASE}
              unitLabel="window"
            />
          </div>
        </div>

        {/* Special Options */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Special Options
          </label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${room.id}-scaffolding`}
                checked={room.needsScaffolding}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('needsScaffolding', checked === true)
                }
              />
              <label htmlFor={`${room.id}-scaffolding`} className="text-sm">
                Scaffolding (+${RATES.SCAFFOLDING_FEE})
              </label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end border-t pt-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Room Total</p>
          <p className="text-2xl font-bold font-mono">
            ${roomTotal.toLocaleString()}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
