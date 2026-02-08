'use client';

import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { ChartBars } from '@/components/ChartBars';
import { Icon } from '@/components/Icons';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Device } from '@/types';
import useSWR from 'swr';
import { useWebSocket, DeviceReading } from '@/hooks/useWebSocket';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardData {
  liveGeneration: number;
  liveConsumption: number;
  batteryLevel: number;
  monthlySavings: number;
  carbonSaved: number;
  efficiency: number;
  trends: {
    generation: number;
    consumption: number;
    savings: number;
  };
  generationHistory: { date: string; generation: number }[];
  devices: Device[];
}

export default function Dashboard() {
  const { data: dashboardData, error, isLoading, mutate } = useSWR<{ success: boolean; data: DashboardData }>('/api/dashboard', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds as fallback
  });

  // WebSocket for real-time updates
  const { isConnected, lastMessage, error: wsError } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  );

  // Update dashboard data when WebSocket message received
  useEffect(() => {
    if (lastMessage?.type === 'reading' && dashboardData?.data) {
      // Update live stats with new reading
      const reading = lastMessage.data as DeviceReading;

      // Mutate the SWR cache with updated data
      mutate((currentData) => {
        if (!currentData?.data) return currentData;

        return {
          ...currentData,
          data: {
            ...currentData.data,
            liveGeneration: reading.generationKW,
            liveConsumption: reading.consumptionKW,
            batteryLevel: reading.batteryPercent,
          },
        };
      }, false);
    }
  }, [lastMessage, dashboardData, mutate]);

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Icon name="alertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load dashboard</h2>
          <p className="text-gray-600 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    </Layout>
  );

  // Show WebSocket error but don't block the UI
  if (wsError && !isLoading) {
    console.warn('WebSocket connection issue:', wsError);
  }

  if (isLoading || !dashboardData?.data) return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your energy production and consumption in real-time</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );

  const { liveGeneration, liveConsumption, batteryLevel, monthlySavings, carbonSaved, efficiency, trends, generationHistory, devices } = dashboardData.data;

  // Transform generation history for chart
  const chartData = generationHistory.map((day) => ({
    label: day.date,
    value: day.generation,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Monitor your energy production and consumption in real-time
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Live Generation"
            value={formatNumber(liveGeneration, 1)}
            unit="kW"
            icon="sun"
            iconColor="text-yellow-600"
            trend={{ value: Math.abs(trends.generation), isPositive: trends.generation >= 0 }}
          />
          <StatCard
            title="Live Consumption"
            value={formatNumber(liveConsumption, 1)}
            unit="kW"
            icon="zap"
            iconColor="text-blue-600"
            trend={{ value: Math.abs(trends.consumption), isPositive: trends.consumption >= 0 }}
            inverse={true}
          />
          <StatCard
            title="Battery Level"
            value={formatNumber(batteryLevel, 0)}
            unit="%"
            icon="battery"
            iconColor="text-green-600"
          />
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(monthlySavings)}
            icon="dollarSign"
            iconColor="text-emerald-600"
            trend={{ value: Math.abs(trends.savings), isPositive: trends.savings >= 0 }}
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
                  {formatNumber(carbonSaved, 0)} kg
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
                <h3 className="text-2xl font-bold text-gray-900">{formatNumber(efficiency, 1)}%</h3>
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
          <ChartBars data={chartData} height={250} />
        </div>

        {/* Devices List */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Connected Devices</h2>
          <div className="space-y-4">
            {devices.map((device: Device) => (
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
