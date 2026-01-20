import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const WS_PORT = parseInt(process.env.WS_PORT || '3001');

let wss: WebSocketServer | null = null;

export function startWebSocketServer() {
  if (wss) {
    console.log('WebSocket server already running');
    return wss;
  }

  const server = createServer();
  wss = new WebSocketServer({ server });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('✅ New WebSocket client connected from', req.socket.remoteAddress);
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'status',
      data: { message: 'Connected to UrjaFlow WebSocket server' }
    }));

    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📨 Received:', data.type);

        // Broadcast to all connected clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('❌ Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`❌ Client disconnected (code: ${code}, reason: ${reason})`);
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      clients.delete(ws);
    });

    // Handle pong for keep-alive
    ws.on('pong', () => {
      // Keep connection alive
    });
  });

  server.listen(WS_PORT, () => {
    console.log(`🚀 WebSocket server running on ws://localhost:${WS_PORT}`);
  });

  return wss;
}

export function getWebSocketServer() {
  return wss;
}

// Start server if this file is run directly
if (require.main === module) {
  startWebSocketServer();
}
