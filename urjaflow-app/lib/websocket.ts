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

  wss.on('connection', (ws: WebSocket) => {
    console.log('✅ New WebSocket client connected');
    clients.add(ws);

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
      }
    });

    ws.on('close', () => {
      console.log('❌ Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      clients.delete(ws);
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
