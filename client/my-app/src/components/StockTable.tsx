// src/components/StockTable.tsx
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import './StockTable.css';

interface StockEntry {
    // c: string[];  // Conditions

  s: string;  // Symbol
  p: number;  // Price
  t: number;  // Timestamp
  v: number;  // Volume
}

interface StockTableProps {
  data: StockEntry[];
}

const StockTable: React.FC<StockTableProps> = ({ data }) => {
  const columns = React.useMemo<ColumnDef<StockEntry>[]>(
    () => [
      {
        header: 'Symbol',
        accessorKey: 's',
      },
      {
        header: 'Price',
        accessorKey: 'p',
      },
      {
        header: 'Timestamp',
        accessorKey: 't',
        cell: ({ getValue }) => new Date(getValue<number>()).toLocaleTimeString(),
      },
      {
        header: 'Volume',
        accessorKey: 'v',
      },
      {
        header: 'Condition',
        accessorKey: 'c',
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="stock-table">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="stock-table-body">
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} title={`${cell.column.columnDef.header}: ${cell.getValue()}`}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StockTable;
