import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Checkbox,
  Badge,
} from '@tarva/ui';
import { AlertCircle, Home } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import {
  StoryType,
  FlakingSeverity,
  ExteriorScope,
} from '../../types/exterior';
import type {
  ExteriorJobInput,
  SideDifficulty,
  GarageDoorInput,
} from '../../types/exterior';
import { RATES } from '../../lib/calc/rates';

interface ExteriorFormProps {
  job: ExteriorJobInput;
  onHouseSqftChange: (sqft: number) => void;
  onStoryTypeChange: (storyType: StoryType) => void;
  onSideDifficultyChange: (
    side: 'front' | 'back' | 'left' | 'right',
    updates: Partial<Omit<SideDifficulty, 'side'>>
  ) => void;
  onFlakingSeverityChange: (severity: FlakingSeverity) => void;
  onHeavyFlakingAdjustmentChange: (adjustment: number) => void;
  onScopeChange: (scope: ExteriorScope) => void;
  onShutterCountChange: (count: number) => void;
  onPaintFrontDoorChange: (paint: boolean) => void;
  onGarageDoorsChange: (doors: GarageDoorInput) => void;
  onNotesChange: (notes: string) => void;
  total: number;
}

const STORY_TYPES = [
  {
    value: StoryType.ONE_STORY,
    label: '1 Story',
    multiplier: RATES.EXTERIOR.HEIGHT_MULT.ONE_STORY,
    description: 'Single level, ground work',
  },
  {
    value: StoryType.ONE_HALF_STORY,
    label: '1.5 Story',
    multiplier: RATES.EXTERIOR.HEIGHT_MULT.ONE_HALF_STORY,
    description: 'Split level with peaks',
  },
  {
    value: StoryType.TWO_STORY,
    label: '2 Story',
    multiplier: RATES.EXTERIOR.HEIGHT_MULT.TWO_STORY,
    description: 'Standard two-story',
  },
  {
    value: StoryType.THREE_STORY,
    label: '3 Story',
    multiplier: RATES.EXTERIOR.HEIGHT_MULT.THREE_STORY,
    description: 'Three-story, ladder/lift work',
  },
] as const;

const FLAKING_SEVERITIES = [
  {
    value: FlakingSeverity.LIGHT,
    label: 'Light',
    adjustment: RATES.EXTERIOR.FLAKING.LIGHT,
    description: 'Minimal prep, ~5-8 SF included',
  },
  {
    value: FlakingSeverity.MEDIUM,
    label: 'Medium',
    adjustment: RATES.EXTERIOR.FLAKING.MEDIUM,
    description: 'Moderate scraping/sanding',
  },
  {
    value: FlakingSeverity.HEAVY,
    label: 'Heavy',
    adjustment: 'Variable',
    description: 'Extensive prep, 0.5-1.0 adjustment',
  },
] as const;

const SCOPE_OPTIONS = [
  {
    value: ExteriorScope.FULL,
    label: 'Full Exterior',
    multiplier: 1.0,
    description: 'Siding and trim',
  },
  {
    value: ExteriorScope.TRIM_ONLY,
    label: 'Trim Only',
    multiplier: RATES.EXTERIOR.PARTIAL_JOB_MULTIPLIER,
    description: '60% of full price',
  },
  {
    value: ExteriorScope.SIDING_ONLY,
    label: 'Siding Only',
    multiplier: RATES.EXTERIOR.PARTIAL_JOB_MULTIPLIER,
    description: '60% of full price',
  },
] as const;

const SIDE_LABELS: Record<'front' | 'back' | 'left' | 'right', string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
};

export function ExteriorForm({
  job,
  onHouseSqftChange,
  onStoryTypeChange,
  onSideDifficultyChange,
  onFlakingSeverityChange,
  onHeavyFlakingAdjustmentChange,
  onScopeChange,
  onShutterCountChange,
  onPaintFrontDoorChange,
  onGarageDoorsChange,
  onNotesChange,
  total,
}: ExteriorFormProps) {
  const selectedStory = STORY_TYPES.find((t) => t.value === job.storyType);
  const hasZeroSqft = job.houseSqft === 0;

  // Count difficulty adjustments
  const nonFlatCount = job.sideDifficulties.filter(
    (s) => s.nonFlatGround
  ).length;
  const roofAccessCount = job.sideDifficulties.filter(
    (s) => s.roofAccess
  ).length;
  const difficultyAdjustment =
    nonFlatCount * RATES.EXTERIOR.DIFFICULTY.NON_FLAT_GROUND +
    roofAccessCount * RATES.EXTERIOR.DIFFICULTY.ROOF_ACCESS;

  return (
    <Card className="px-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Home className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Exterior Estimate</CardTitle>
          <Badge variant="secondary">
            {selectedStory?.multiplier ?? 1.25}x
          </Badge>
          {difficultyAdjustment > 0 && (
            <Badge variant="outline">+{difficultyAdjustment} difficulty</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* House Size & Story Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="house-sqft"
              className="text-sm font-medium leading-none"
            >
              House sq.ft
            </label>
            <input
              id="house-sqft"
              type="number"
              value={job.houseSqft}
              onChange={(e) =>
                onHouseSqftChange(parseInt(e.target.value, 10) || 0)
              }
              min={0}
              max={20000}
              className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                hasZeroSqft ? 'border-warning' : 'border-input'
              }`}
            />
            {hasZeroSqft ? (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Enter sq.ft for estimate
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Total house square footage
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="story-type"
              className="text-sm font-medium leading-none"
            >
              Story Type
            </label>
            <select
              id="story-type"
              value={job.storyType}
              onChange={(e) => onStoryTypeChange(e.target.value as StoryType)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {STORY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.multiplier}x)
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {selectedStory?.description}
            </p>
          </div>
        </div>

        {/* Job Scope */}
        <div className="space-y-2">
          <label
            htmlFor="scope"
            className="text-sm font-medium leading-none block"
          >
            Job Scope
          </label>
          <select
            id="scope"
            value={job.scope}
            onChange={(e) => onScopeChange(e.target.value as ExteriorScope)}
            className="flex h-11 w-full sm:w-auto sm:min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.multiplier === 1 ? 'full' : '60%'})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {SCOPE_OPTIONS.find((o) => o.value === job.scope)?.description}
          </p>
        </div>

        {/* Difficulty Adjustments per Side */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Difficulty Adjustments (+0.25 each)
          </label>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {job.sideDifficulties.map((side) => (
              <div key={side.side} className="space-y-2">
                <p className="text-sm font-medium">{SIDE_LABELS[side.side]}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${side.side}-nonflat`}
                      checked={side.nonFlatGround}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        onSideDifficultyChange(side.side, {
                          nonFlatGround: checked === true,
                        })
                      }
                    />
                    <label
                      htmlFor={`${side.side}-nonflat`}
                      className="text-sm"
                    >
                      Non-flat
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${side.side}-roof`}
                      checked={side.roofAccess}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        onSideDifficultyChange(side.side, {
                          roofAccess: checked === true,
                        })
                      }
                    />
                    <label htmlFor={`${side.side}-roof`} className="text-sm">
                      Roof access
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paint Condition / Flaking */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="flaking"
              className="text-sm font-medium leading-none"
            >
              Paint Condition
            </label>
            <select
              id="flaking"
              value={job.flakingSeverity}
              onChange={(e) =>
                onFlakingSeverityChange(e.target.value as FlakingSeverity)
              }
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {FLAKING_SEVERITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (+
                  {option.value === FlakingSeverity.HEAVY
                    ? '0.5-1.0'
                    : option.adjustment}
                  )
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {
                FLAKING_SEVERITIES.find(
                  (o) => o.value === job.flakingSeverity
                )?.description
              }
            </p>
          </div>

          {job.flakingSeverity === FlakingSeverity.HEAVY && (
            <div className="space-y-2">
              <label
                htmlFor="heavy-adjustment"
                className="text-sm font-medium leading-none"
              >
                Heavy Flaking Adjustment
              </label>
              <input
                id="heavy-adjustment"
                type="number"
                value={job.heavyFlakingAdjustment ?? 0.5}
                onChange={(e) =>
                  onHeavyFlakingAdjustmentChange(parseFloat(e.target.value) || 0.5)
                }
                min={0.5}
                max={1.0}
                step={0.1}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Estimator judgment: 0.5 (moderate) to 1.0 (extreme)
              </p>
            </div>
          )}
        </div>

        {/* Add-ons */}
        <div>
          <label className="text-sm font-medium mb-3 block">Add-ons</label>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <NumberStepper
              id="shutters"
              label="Shutters"
              value={job.shutterCount}
              onChange={onShutterCountChange}
              unitPrice={RATES.EXTERIOR.ADD_ONS.SHUTTER}
              unitLabel="each"
              max={50}
            />

            <NumberStepper
              id="garage-1car"
              label="1-Car Garage Doors"
              value={job.garageDoors.oneCarDoors}
              onChange={(count) =>
                onGarageDoorsChange({
                  ...job.garageDoors,
                  oneCarDoors: count,
                })
              }
              unitPrice={RATES.EXTERIOR.ADD_ONS.GARAGE_1_CAR}
              unitLabel="door"
              max={5}
            />

            <NumberStepper
              id="garage-2car"
              label="2-Car Garage Doors"
              value={job.garageDoors.twoCarDoors}
              onChange={(count) =>
                onGarageDoorsChange({
                  ...job.garageDoors,
                  twoCarDoors: count,
                })
              }
              unitPrice={RATES.EXTERIOR.ADD_ONS.GARAGE_2_CAR}
              unitLabel="door"
              max={5}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Front Door
              </label>
              <div className="flex items-center space-x-2 h-11">
                <Checkbox
                  id="front-door"
                  checked={job.paintFrontDoor}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    onPaintFrontDoorChange(checked === true)
                  }
                />
                <label htmlFor="front-door" className="text-sm">
                  Paint front door
                </label>
              </div>
              {job.paintFrontDoor && (
                <p className="text-sm text-muted-foreground">
                  ${RATES.EXTERIOR.ADD_ONS.FRONT_DOOR} (3 coats)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium leading-none"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={job.notes ?? ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Special conditions, access issues, etc."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </CardContent>

      {/* Footer with total */}
      <div className="border-t px-6 py-4 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Estimate Total</p>
          <p className="text-2xl font-bold font-mono">
            ${total.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
