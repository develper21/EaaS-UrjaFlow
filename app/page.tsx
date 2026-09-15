'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time energy production, storage management, and intelligent system telemetry
            </p>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-gray-200/80 bg-white px-3.5 py-1.5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {isConnected ? 'Telemetry Live' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Live Generation"
            value={formatNumber(liveGeneration, 1)}
            unit="kW"
            icon="sun"
            iconColor="text-amber-500"
            trend={{ value: Math.abs(trends.generation), isPositive: trends.generation >= 0 }}
          />
          <StatCard
            title="Live Consumption"
            value={formatNumber(liveConsumption, 1)}
            unit="kW"
            icon="zap"
            iconColor="text-blue-500"
            trend={{ value: Math.abs(trends.consumption), isPositive: trends.consumption >= 0 }}
            inverse={true}
          />
          <StatCard
            title="Battery Storage"
            value={formatNumber(batteryLevel, 0)}
            unit="%"
            icon="battery"
            iconColor="text-emerald-500"
          />
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(monthlySavings)}
            icon="dollarSign"
            iconColor="text-emerald-600"
            trend={{ value: Math.abs(trends.savings), isPositive: trends.savings >= 0 }}
          />
        </div>

        {/* Main Content Area: 2 Columns on Widescreen */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Chart, Devices, and Efficiency */}
          <div className="xl:col-span-8 space-y-6">
            {/* Generation History Chart */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Weekly Generation History
                  </h2>
                  <p className="text-xs text-gray-500">Daily solar energy yield (kW) recorded over the past 7 days</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-block h-3 w-3 rounded-xs bg-gradient-to-r from-emerald-600 to-green-400" />
                  <span className="text-xs font-semibold text-gray-600">Solar Yield (kW)</span>
                </div>
              </div>
              <ChartBars data={chartData} height={250} unit="kW" />
            </div>

            {/* Additional Stats Row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Icon name="leaf" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Carbon Offset</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatNumber(carbonSaved, 0)} kg
                    </h3>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">CO₂ offset estimated this month</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon name="trendingUp" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Conversion Efficiency</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatNumber(efficiency, 1)}%</h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Optimal solar conversion peak</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Devices */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Connected Devices</h2>
                  <p className="text-xs text-gray-500">Live IoT telemetry sensors and hardware units</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {devices.length} Units Online
                </span>
              </div>

              <div className="space-y-3">
                {devices.map((device: Device) => (
                  <div
                    key={device.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50/60 gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon
                          name={device.type === 'SOLAR_PANEL' ? 'sun' : device.type === 'BATTERY' ? 'battery' : 'zap'}
                          size={22}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{device.name}</h3>
                        <p className="text-xs text-gray-500">{device.model || 'Standard Smart Unit'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] font-medium text-gray-400">Rated Capacity</p>
                        <p className="text-sm font-bold text-gray-900">
                          {device.capacity || 5.0} kW
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Insights Rail & Live Power Balance */}
          <div className="xl:col-span-4 space-y-6">
            {/* Live Energy Flow Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="zap" size={18} className="text-amber-500" />
                  Live Power Flow
                </h2>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                {/* Solar Flow */}
                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <Icon name="sun" size={16} className="text-amber-500" />
                      Solar Generation
                    </span>
                    <span className="font-bold text-gray-900">{formatNumber(liveGeneration, 1)} kW</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, (liveGeneration / 5.5) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Battery Flow */}
                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <Icon name="battery" size={16} className="text-emerald-500" />
                      Battery Storage
                    </span>
                    <span className="font-bold text-gray-900">{formatNumber(batteryLevel, 0)}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, batteryLevel)}%` }}
                    />
                  </div>
                </div>

                {/* Home Demand */}
                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <Icon name="home" size={16} className="text-blue-500" />
                      Home Demand
                    </span>
                    <span className="font-bold text-gray-900">{formatNumber(liveConsumption, 1)} kW</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, (liveConsumption / 5.0) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Self-Sufficiency Index</span>
                <span className="font-bold text-emerald-600">92% Clean Energy</span>
              </div>
            </div>

            {/* Eco Impact & Carbon Reduction Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Sustainability</span>
                <span className="rounded-md bg-emerald-700/60 px-2 py-0.5 text-[11px] font-bold text-emerald-100">
                  Grade A+
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Environmental Impact</h3>
              <p className="mt-1 text-xs text-emerald-100 leading-relaxed">
                Your renewable energy setup has prevented approximately <span className="font-bold text-white">{formatNumber(carbonSaved, 0)} kg</span> of CO₂ emissions this cycle.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-emerald-700/60">
                <div>
                  <p className="text-[11px] text-emerald-200">Trees Equivalent</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">
                    {Math.max(2, Math.round(carbonSaved / 1.5))} Trees 🌲
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-emerald-200">Grid Independence</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">88.4%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Navigation</h3>
              <div className="space-y-2">
                <Link
                  href="/analytics"
                  className="flex items-center justify-between rounded-xl p-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name="trendingUp" size={16} className="text-emerald-600" />
                    <span>View 24h ML Forecast</span>
                  </span>
                  <Icon name="arrowRight" size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                </Link>

                <Link
                  href="/reports"
                  className="flex items-center justify-between rounded-xl p-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name="fileText" size={16} className="text-blue-600" />
                    <span>Download Energy Reports</span>
                  </span>
                  <Icon name="arrowRight" size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                </Link>

                <Link
                  href="/account"
                  className="flex items-center justify-between rounded-xl p-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name="settings" size={16} className="text-purple-600" />
                    <span>Manage Device Settings</span>
                  </span>
                  <Icon name="arrowRight" size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
