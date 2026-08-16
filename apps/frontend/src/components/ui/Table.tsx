/**
 * PURPOSE: Generic typed data table (e.g. workspace list, container list,
 * activity log) with column-driven rendering instead of every page hand-
 * rolling <table> markup. Renders EmptyState/Skeleton for empty/loading
 * states rather than a bare empty <tbody>.
 * DEPENDENCIES: react, ../../utils/cn, ./EmptyState, ./Skeleton
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

const alignClasses: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center'
};

export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle = 'No data yet',
  emptyDescription,
  onRowClick
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      <table className="w-full text-sm">
        <thead className="bg-surface-overlay">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-muted',
                  alignClasses[column.align ?? 'left']
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle bg-surface-raised">
          {isLoading &&
            Array.from({ length: 4 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors duration-micro',
                  onRowClick && 'cursor-pointer hover:bg-surface-overlay'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-text-primary', alignClasses[column.align ?? 'left'], column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!isLoading && data.length === 0 && (
        <div className="p-2">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}
    </div>
  );
}
