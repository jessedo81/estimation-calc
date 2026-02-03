import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tarva/ui';
import type { LineItem, LineItemCategory } from '../../types/estimate';
import { LineItemCategory as LIC } from '../../types/estimate';

interface BreakdownTableProps {
  items: LineItem[];
  showCategory?: boolean;
}

const CATEGORY_LABELS: Record<LineItemCategory, string> = {
  [LIC.WALLS]: 'Walls',
  [LIC.CEILING]: 'Ceiling',
  [LIC.TRIM]: 'Trim',
  [LIC.DOORS]: 'Doors',
  [LIC.WINDOWS]: 'Windows',
  [LIC.CLOSETS]: 'Closets',
  [LIC.ACCENT_WALLS]: 'Accent',
  [LIC.CROWN_MOLDING]: 'Crown',
  [LIC.SCAFFOLDING]: 'Scaffold',
  [LIC.ADDITIONAL_COLORS]: 'Colors',
  [LIC.WALLPAPER_REMOVAL]: 'Prep',
  [LIC.PAINT_OPTIONS]: 'Paint',
  [LIC.SETUP_FEE]: 'Fees',
};

export function BreakdownTable({
  items,
  showCategory = true,
}: BreakdownTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No line items
      </p>
    );
  }

  const total = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showCategory && <TableHead className="w-24">Category</TableHead>}
          <TableHead>Description</TableHead>
          <TableHead className="text-right w-28">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={`${item.category}-${item.name}-${index}`}>
            {showCategory && (
              <TableCell className="text-muted-foreground">
                {CATEGORY_LABELS[item.category]}
              </TableCell>
            )}
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right font-mono">
              ${item.cost.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-semibold">
          {showCategory && <TableCell />}
          <TableCell>Total</TableCell>
          <TableCell className="text-right font-mono">
            ${total.toLocaleString()}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
