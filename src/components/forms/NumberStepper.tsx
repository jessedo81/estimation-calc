import { Button } from '@tarva/ui';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unitPrice?: number;
  unitLabel?: string;
  disabled?: boolean;
}

export function NumberStepper({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  unitPrice,
  unitLabel,
  disabled,
}: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.min(max, Math.max(min, newValue)));
    }
  };

  const totalCost = unitPrice ? value * unitPrice : null;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          className="h-11 w-11 shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <input
          id={id}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className="flex h-11 w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          className="h-11 w-11 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {totalCost !== null && (
        <p className="text-sm text-muted-foreground">
          ${totalCost.toLocaleString()}
          {unitPrice && unitLabel && (
            <span className="text-xs ml-1">
              (${unitPrice}/{unitLabel})
            </span>
          )}
        </p>
      )}
    </div>
  );
}
