// test-finnhub.ts
import WebSocket from 'ws';

const FINNHUB_API_KEY = 'cpqtc59r01qifjjv7n0gcpqtc59r01qifjjv7n10';
const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

const ws = new WebSocket(FINNHUB_WS_URL);

ws.on('open', () => {
    console.log('Connected to Finnhub');
    ws.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
});

ws.on('message', (data) => {
    console.log('Received data from Finnhub:', data.toString());
});

ws.on('close', () => {
    console.log('Finnhub WebSocket closed');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
