// src/components/LiveFeed.tsx
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import StockTable from './StockTable';

const socket: Socket = io('http://localhost:5000');

interface StockEntry {
    // c: string[];  // Conditions

  s: string;  // Symbol
  p: number;  // Price
  t: number;  // Timestamp
  v: number;  // Volume
}

interface StockData {
  type: string;
  data: StockEntry[];
}

const LiveFeed: React.FC = () => {
  const [data, setData] = useState<StockEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('data', (newData: StockData) => {
      console.log('Received data from server:', newData);
      if (newData && newData.data && Array.isArray(newData.data)) {
        const isValid = newData.data.every(item => (
          typeof item.s === 'string' &&
          typeof item.p === 'number' &&
          typeof item.t === 'number' &&
          typeof item.v === 'number'
        ));
        if (isValid) {
          setData(newData.data);
          setError(null); // Clear previous errors
        } else {
          console.error('Invalid data structure:', newData);
          setError('Invalid data structure received from server.');
        }
      } else {
        console.error('Invalid data structure:', newData);
        setError('Invalid data structure received from server.');
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Connection error occurred.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Live Stock Data Feed</h1>
      {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <StockTable data={data} />
      )}
    </div>
  );
};

export default LiveFeed;
