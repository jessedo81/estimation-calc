import { useState, useCallback } from 'react';
import { Button } from '@tarva/ui';
import { RotateCcw, Copy, Check } from 'lucide-react';
import { useExteriorEstimate } from '../hooks/useExteriorEstimate';
import { ExteriorForm, ResetConfirmDialog, DraftRecoveryDialog } from '../components';

export function ExteriorEstimationPage() {
  const {
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
  } = useExteriorEstimate();

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setResetDialogOpen(false);
    reset();
  };

  const generateCopyText = useCallback(() => {
    const lines: string[] = [
      'EXTERIOR PAINTING ESTIMATE',
      '='.repeat(30),
      '',
      `House: ${job.houseSqft.toLocaleString()} sq.ft`,
      `Stories: ${job.storyType.replace(/_/g, ' ')}`,
      `Scope: ${job.scope.replace(/_/g, ' ')}`,
      '',
    ];

    // Add breakdown items
    estimate.lineItems.forEach((item) => {
      lines.push(`${item.name}: $${item.cost.toLocaleString()}`);
    });

    lines.push('');
    lines.push('-'.repeat(30));
    lines.push(`TOTAL: $${estimate.total.toLocaleString()}`);
    lines.push('');
    lines.push(`Generated ${new Date().toLocaleDateString()}`);

    return lines.join('\n');
  }, [job, estimate]);

  const handleCopy = async () => {
    const text = generateCopyText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format last saved time
  const formatSavedTime = (timestamp: number | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Exterior Estimate</h1>
              <p className="text-muted-foreground">
                Calculate exterior painting costs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <ExteriorForm
          job={job}
          onHouseSqftChange={setHouseSqft}
          onStoryTypeChange={setStoryType}
          onSideDifficultyChange={updateSideDifficulty}
          onFlakingSeverityChange={setFlakingSeverity}
          onHeavyFlakingAdjustmentChange={setHeavyFlakingAdjustment}
          onScopeChange={setScope}
          onShutterCountChange={setShutterCount}
          onPaintFrontDoorChange={setPaintFrontDoor}
          onGarageDoorsChange={setGarageDoors}
          onNotesChange={setNotes}
          total={estimate.total}
        />
      </main>

      {/* Print-only summary (hidden on screen) */}
      <div className="hidden print:block border-t-2 border-black mt-8 pt-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              {job.houseSqft.toLocaleString()} sq.ft • {job.storyType.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-muted-foreground">
              Generated {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              Total: ${estimate.total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer (hidden when printing) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 print:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Saved {formatSavedTime(lastSaved)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Estimate</p>
              <p className="text-2xl font-bold font-mono">
                ${estimate.total.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={job.houseSqft === 0}
                aria-label={copied ? 'Copied!' : 'Copy estimate'}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setResetDialogOpen(true)}
                disabled={job.houseSqft === 0 && job.shutterCount === 0}
                aria-label="Reset estimate"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <ResetConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleReset}
        roomCount={0}
        message="This will clear all exterior estimate data."
      />

      <DraftRecoveryDialog
        open={hasPendingDraft}
        onRecover={loadFromDraft}
        onDiscard={dismissDraft}
      />
    </div>
  );
}
