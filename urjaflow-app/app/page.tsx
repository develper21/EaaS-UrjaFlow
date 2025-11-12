'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { ChartBars } from '@/components/ChartBars';
import { Icon } from '@/components/Icons';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Device, DeviceReading } from '@/types';

// Mock data - will be replaced with real API calls
const MOCK_STATS = {
  liveGeneration: 4.2,
  liveConsumption: 2.8,
  batteryLevel: 75,
  monthlySavings: 156.50,
  carbonSaved: 245,
};

const MOCK_HISTORY = [
  { label: 'Mon', value: 28.5 },
  { label: 'Tue', value: 32.1 },
  { label: 'Wed', value: 29.8 },
  { label: 'Thu', value: 35.2 },
  { label: 'Fri', value: 31.7 },
  { label: 'Sat', value: 27.3 },
  { label: 'Sun', value: 30.9 },
];

const MOCK_DEVICES: Device[] = [
  {
    id: '1',
    userId: '1',
    name: 'Rooftop Solar Array',
    type: 'SOLAR_PANEL',
    model: 'SunPower X22-370',
    serialNumber: 'SP-2024-001',
    capacity: 5.5,
    status: 'ACTIVE',
    location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
    installedAt: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: '1',
    name: 'Home Battery Storage',
    type: 'BATTERY',
    model: 'Tesla Powerwall 2',
    serialNumber: 'BAT-2024-001',
    capacity: 13.5,
    status: 'ACTIVE',
    location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
    installedAt: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [devices, setDevices] = useState(MOCK_DEVICES);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        liveGeneration: prev.liveGeneration + (Math.random() - 0.5) * 0.5,
        liveConsumption: prev.liveConsumption + (Math.random() - 0.5) * 0.3,
        batteryLevel: Math.max(0, Math.min(100, prev.batteryLevel + (Math.random() - 0.5) * 2)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your energy production and consumption in real-time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Live Generation"
            value={formatNumber(stats.liveGeneration, 1)}
            unit="kW"
            icon="sun"
            iconColor="text-yellow-600"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Live Consumption"
            value={formatNumber(stats.liveConsumption, 1)}
            unit="kW"
            icon="zap"
            iconColor="text-blue-600"
            trend={{ value: 5.2, isPositive: false }}
          />
          <StatCard
            title="Battery Level"
            value={formatNumber(stats.batteryLevel, 0)}
            unit="%"
            icon="battery"
            iconColor="text-green-600"
          />
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(stats.monthlySavings)}
            icon="dollarSign"
            iconColor="text-emerald-600"
            trend={{ value: 8.3, isPositive: true }}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 p-3">
                <Icon name="leaf" size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Carbon Offset</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.carbonSaved, 0)} kg
                </h3>
                <p className="text-sm text-gray-500">CO₂ saved this month</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3">
                <Icon name="trendingUp" size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <h3 className="text-2xl font-bold text-gray-900">92.5%</h3>
                <p className="text-sm text-gray-500">System performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generation History Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Weekly Generation History
          </h2>
          <ChartBars data={MOCK_HISTORY} height={250} />
        </div>

        {/* Devices List */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Connected Devices</h2>
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <Icon
                      name={device.type === 'SOLAR_PANEL' ? 'sun' : 'battery'}
                      size={24}
                      className="text-green-600"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Capacity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {device.capacity} kW
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1">
                    <span className="text-sm font-medium text-green-700">
                      {device.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
