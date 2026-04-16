// src/components/SkeletonTable.tsx
import React from 'react';
import './StockTable.css';

const COLUMNS = ['Symbol', 'Price', 'Time', 'Volume'];
const COL_WIDTHS = ['100px', '130px', '160px', '110px'];
const SKELETON_ROWS = 8;

// Vary widths so skeleton looks natural, not like a grid of identical bars
const CELL_WIDTHS: string[][] = [
  ['55%', '65%', '75%', '60%'],
  ['70%', '80%', '85%', '50%'],
  ['60%', '70%', '80%', '65%'],
  ['75%', '60%', '70%', '55%'],
  ['50%', '75%', '65%', '70%'],
  ['65%', '55%', '75%', '80%'],
  ['80%', '65%', '60%', '55%'],
  ['55%', '80%', '70%', '65%'],
];

const SkeletonTable: React.FC = () => (
  <div
    role="status"
    aria-label="Loading stock data"
    aria-busy="true"
    className="table-wrapper"
  >
    <p className="row-count" aria-hidden="true" style={{ visibility: 'hidden' }}>
      &nbsp;
    </p>
    <div className="skeleton-table-container">
      <table className="skeleton-table" aria-hidden="true">
        <colgroup>
          {COL_WIDTHS.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
            <tr key={rowIdx} className="skeleton-row">
              {COLUMNS.map((_, colIdx) => (
                <td key={colIdx}>
                  <div
                    className="skeleton-cell"
                    style={{ width: CELL_WIDTHS[rowIdx][colIdx] }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <span className="sr-only">Loading live stock data&hellip;</span>
  </div>
);

export default SkeletonTable;
