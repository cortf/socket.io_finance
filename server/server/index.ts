import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const FINNHUB_API_KEY = 'cpspin9r01qpk40rhfkgcpspin9r01qpk40rhfl0';
const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;


const connectToFinnhub = () => {
   let ws = new WebSocket(FINNHUB_WS_URL);

    ws.on('open', () => {
        console.log('Connected to Finnhub');
        ws?.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
    });

    ws.on('message', (data) => {
        console.log('Received data from Finnhub:', data.toString());
        io.emit('data', JSON.parse(data.toString()));
    });

    ws.on('unexpected-response', (req, res) => {
        console.error('Unexpected response from Finnhub:', res.statusCode);
      });
    

    ws.on('close', () => {
        console.log('Finnhub WebSocket closed, retrying in 5 seconds...');
        setTimeout(connectToFinnhub, 5000); // Retry connection after 5 seconds
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws?.close();
    });
};

io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server listening on port 5000');
    connectToFinnhub(); // Initial connection
});
