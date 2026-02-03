import { Button } from '@tarva/ui';
import { FileDown, RotateCcw } from 'lucide-react';

interface EstimateSummaryFooterProps {
  subtotal: number;
  setupFee: number;
  jobTotal: number;
  roomCount: number;
  onReset: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function EstimateSummaryFooter({
  subtotal,
  setupFee,
  jobTotal,
  roomCount,
  onReset,
  onExport,
  isExporting,
}: EstimateSummaryFooterProps) {
  return (
    <footer className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Summary */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Rooms
              </p>
              <p className="text-lg font-semibold">{roomCount}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Subtotal
              </p>
              <p className="text-lg font-semibold font-mono">
                ${subtotal.toLocaleString()}
              </p>
            </div>

            {setupFee > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Setup Fee
                </p>
                <p className="text-lg font-semibold font-mono">
                  +${setupFee.toLocaleString()}
                </p>
              </div>
            )}

            <div className="border-l pl-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Job Total
              </p>
              <p className="text-2xl font-bold font-mono text-primary">
                ${jobTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={onReset}
              disabled={roomCount === 0}
              className="inline-flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            {onExport && (
              <Button
                onClick={onExport}
                disabled={roomCount === 0 || isExporting}
                className="inline-flex items-center"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
