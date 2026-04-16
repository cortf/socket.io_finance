// src/components/LiveFeed.tsx
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import StockTable, { StockEntry } from './StockTable';
import SkeletonTable from './SkeletonTable';

const socket: Socket = io('http://localhost:5001');

interface RawTrade {
  s: string;
  p: number;
  t: number;
  v: number;
}

interface StockData {
  type: string;
  data: RawTrade[];
}

// Cap accumulation to prevent unbounded memory growth
const MAX_ROWS = 10_000;

const LiveFeed: React.FC = () => {
  const [data, setData] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the last known price per symbol to determine flash direction
  const latestPriceRef = useRef<Record<string, number>>({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('data', (newData: StockData) => {
      if (!newData?.data || !Array.isArray(newData.data)) {
        setError('Invalid data structure received from server.');
        return;
      }

      const isValid = newData.data.every(
        item =>
          typeof item.s === 'string' &&
          typeof item.p === 'number' &&
          typeof item.t === 'number' &&
          typeof item.v === 'number'
      );

      if (!isValid) {
        setError('Invalid data structure received from server.');
        return;
      }

      // Tag each incoming trade with flash direction + a stable unique ID
      const tagged: StockEntry[] = newData.data.map(item => {
        const prevP = latestPriceRef.current[item.s];
        const flash: 'up' | 'down' | undefined =
          prevP === undefined ? undefined
          : item.p > prevP ? 'up'
          : item.p < prevP ? 'down'
          : undefined;
        latestPriceRef.current[item.s] = item.p;
        return {
          ...item,
          _flash: flash,
          // Unique key: symbol + timestamp + short random suffix
          _id: `${item.s}-${item.t}-${Math.random().toString(36).slice(2, 7)}`,
        };
      });

      // Prepend new trades (newest at top), keep within MAX_ROWS
      setData(prev => [...tagged, ...prev].slice(0, MAX_ROWS));
      setLoading(false);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Connection error. Reconnecting\u2026');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="live-feed">
      <h1 className="live-feed-title">Live Stock Feed</h1>
      {error && (
        <div role="alert" className="error-banner">
          {error}
        </div>
      )}
      {loading && !error ? <SkeletonTable /> : <StockTable data={data} />}
    </main>
  );
};

export default LiveFeed;
