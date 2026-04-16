// src/components/StockTable.tsx
import React, { useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import './StockTable.css';

export interface StockEntry {
  s: string;   // Symbol
  p: number;   // Price
  t: number;   // Timestamp (ms)
  v: number;   // Volume
  _flash?: 'up' | 'down';
  _id: string;
}

interface StockTableProps {
  data: StockEntry[];
}

const ROW_HEIGHT = 40;
const VISIBLE_HEIGHT = 520;
const COL_COUNT = 4;

const StockTable: React.FC<StockTableProps> = ({ data }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = React.useMemo<ColumnDef<StockEntry>[]>(
    () => [
      {
        header: 'Symbol',
        accessorKey: 's',
        size: 100,
      },
      {
        header: 'Price',
        accessorKey: 'p',
        size: 130,
        cell: ({ getValue }) => `$${(getValue<number>()).toFixed(2)}`,
      },
      {
        header: 'Time',
        accessorKey: 't',
        size: 160,
        cell: ({ getValue }) => new Date(getValue<number>()).toLocaleTimeString(),
      },
      {
        header: 'Volume',
        accessorKey: 'v',
        size: 110,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Stable row identity so CSS flash animations re-trigger on new rows
    getRowId: (row) => row._id,
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - (virtualItems[virtualItems.length - 1].end ?? 0)
      : 0;

  return (
    <div className="table-wrapper">
      <p className="row-count" aria-live="polite" aria-atomic="true">
        {data.length.toLocaleString()} trades &mdash; showing {virtualItems.length} in viewport
      </p>
      <div
        ref={parentRef}
        className="virtual-scroll-container"
        style={{ height: VISIBLE_HEIGHT }}
        role="region"
        aria-label="Scrollable stock trades"
      >
        <table
          className="stock-table"
          aria-label="Live stock trades"
          aria-rowcount={data.length}
        >
          <colgroup>
            {columns.map((col, i) => (
              <col key={i} style={{ width: col.size }} />
            ))}
          </colgroup>
          <thead className="stock-table-head">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} scope="col">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="stock-table-body">
            {paddingTop > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={COL_COUNT}
                  style={{ height: paddingTop, padding: 0, border: 'none' }}
                />
              </tr>
            )}
            {virtualItems.map(vi => {
              const row = rows[vi.index];
              const flashClass = row.original._flash
                ? `flash-${row.original._flash}`
                : '';
              return (
                <tr
                  key={row.id}
                  className={`stock-row ${flashClass}`}
                  style={{ height: ROW_HEIGHT }}
                  aria-rowindex={vi.index + 1}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={COL_COUNT}
                  style={{ height: paddingBottom, padding: 0, border: 'none' }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
