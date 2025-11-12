#!/usr/bin/env tsx
/**
 * Mock IoT Device Simulator
 * Simulates multiple energy devices sending real-time readings
 */

import WebSocket from 'ws';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const DEVICE_IDS = ['device-1', 'device-2', 'device-3', 'device-4'];
const UPDATE_INTERVAL = 3000; // 3 seconds

interface DeviceReading {
  deviceId: string;
  timestamp: Date;
  generationKW: number;
  consumptionKW: number;
  batteryPercent: number;
  voltage: number;
  current: number;
  temperature: number;
  efficiency: number;
}

function generateReading(deviceId: string): DeviceReading {
  const hour = new Date().getHours();
  
  // Solar generation varies by time of day (peak at noon)
  const solarMultiplier = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const generation = (3.5 * solarMultiplier + Math.random() * 0.5) * (deviceId === 'device-1' ? 1 : 0);
  
  // Consumption varies (higher in morning and evening)
  const consumptionBase = hour < 6 || hour > 22 ? 0.5 : hour > 8 && hour < 18 ? 2.0 : 3.5;
  const consumption = consumptionBase + Math.random() * 0.5;
  
  // Battery level fluctuates
  const batteryLevel = 60 + Math.random() * 30;
  
  return {
    deviceId,
    timestamp: new Date(),
    generationKW: parseFloat(generation.toFixed(2)),
    consumptionKW: parseFloat(consumption.toFixed(2)),
    batteryPercent: parseFloat(batteryLevel.toFixed(1)),
    voltage: parseFloat((240 + Math.random() * 10).toFixed(2)),
    current: parseFloat((generation * 4.17).toFixed(2)),
    temperature: parseFloat((25 + Math.random() * 10).toFixed(1)),
    efficiency: parseFloat((85 + Math.random() * 10).toFixed(1)),
  };
}

async function connectAndStream() {
  console.log('🔌 Connecting to WebSocket server:', WS_URL);
  
  try {
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('✅ Connected to WebSocket server');
      console.log(`📡 Streaming data from ${DEVICE_IDS.length} devices every ${UPDATE_INTERVAL}ms\n`);
      
      // Send readings at regular intervals
      const interval = setInterval(() => {
        DEVICE_IDS.forEach((deviceId) => {
          const reading = generateReading(deviceId);
          
          const message = JSON.stringify({
            type: 'reading',
            data: reading,
          });
          
          ws.send(message);
          
          console.log(`📊 [${deviceId}] Gen: ${reading.generationKW}kW | Cons: ${reading.consumptionKW}kW | Batt: ${reading.batteryPercent}%`);
        });
        console.log('---');
      }, UPDATE_INTERVAL);
      
      ws.on('close', () => {
        clearInterval(interval);
        console.log('❌ Disconnected from WebSocket server');
        console.log('🔄 Reconnecting in 5 seconds...');
        setTimeout(connectAndStream, 5000);
      });
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(connectAndStream, 5000);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectAndStream, 5000);
  }
}

// Alternative: HTTP POST mode (if WebSocket is not available)
async function httpMode() {
  console.log('📡 Running in HTTP POST mode');
  console.log(`📊 Sending readings to API every ${UPDATE_INTERVAL}ms\n`);
  
  setInterval(async () => {
    for (const deviceId of DEVICE_IDS) {
      const reading = generateReading(deviceId);
      
      try {
        const response = await fetch('http://localhost:3000/api/readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reading),
        });
        
        if (response.ok) {
          console.log(`✅ [${deviceId}] Gen: ${reading.generationKW}kW | Cons: ${reading.consumptionKW}kW`);
        } else {
          console.error(`❌ [${deviceId}] Failed to send reading`);
        }
      } catch (error) {
        console.error(`❌ [${deviceId}] Error:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    console.log('---');
  }, UPDATE_INTERVAL);
}

// Main
console.log('🚀 UrjaFlow IoT Device Simulator');
console.log('================================\n');

const mode = process.argv[2] || 'websocket';

if (mode === 'http') {
  httpMode();
} else {
  connectAndStream();
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down IoT simulator...');
  process.exit(0);
});
