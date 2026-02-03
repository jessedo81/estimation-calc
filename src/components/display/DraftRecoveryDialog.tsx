import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tarva/ui';
import { FileText } from 'lucide-react';

interface DraftRecoveryDialogProps {
  open: boolean;
  onRecover: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryDialog({
  open,
  onRecover,
  onDiscard,
}: DraftRecoveryDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle>Recover Draft?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You have an unsaved estimate from a previous session. Would you like
            to recover it or start fresh?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>Start Fresh</AlertDialogCancel>
          <AlertDialogAction onClick={onRecover}>
            Recover Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
