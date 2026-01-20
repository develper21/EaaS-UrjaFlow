'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/Icons';
import { StatCard } from '@/components/StatCard';
import { ChartBars } from '@/components/ChartBars';

interface PredictionData {
  deviceId: string;
  deviceName: string;
  predictions: {
    timestamp: Date;
    generationKW: number;
    consumptionKW: number;
    confidence: number;
  }[];
  accuracy: number;
  model: string;
}

interface AnomalyData {
  id: string;
  deviceId: string;
  deviceName: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  detectedAt: Date;
  confidence: number;
}

interface BenchmarkData {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  description: string;
  potentialImprovement: number;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'anomalies' | 'benchmarks'>('predictions');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  useEffect(() => {
    if (session) {
      fetchAnalyticsData();
    }
  }, [session]);

  const fetchAnalyticsData = async () => {
    try {
      const [predictionsRes, anomaliesRes, benchmarksRes] = await Promise.all([
        fetch('/api/ml/predictions'),
        fetch('/api/ml/anomalies'),
        fetch('/api/analytics/benchmarks')
      ]);

      if (predictionsRes.ok) {
        const data = await predictionsRes.json();
        setPredictions(data);
      }

      if (anomaliesRes.ok) {
        const data = await anomaliesRes.json();
        setAnomalies(data);
      }

      if (benchmarksRes.ok) {
        const data = await benchmarksRes.json();
        setBenchmarks(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = selectedDevice === 'all' 
    ? predictions 
    : predictions.filter(p => p.deviceId === selectedDevice);

  const filteredAnomalies = selectedDevice === 'all'
    ? anomalies
    : anomalies.filter(a => a.deviceId === selectedDevice);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="zap" size={48} className="animate-pulse text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="mt-2 text-gray-600">ML-powered insights and predictions for your energy systems</p>
      </div>

      {/* Analytics Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Predictions"
          value={predictions.length.toString()}
          icon="trendingUp"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Detected Anomalies"
          value={anomalies.length.toString()}
          icon="alertTriangle"
          iconColor="text-red-600"
        />
        <StatCard
          title="Benchmark Insights"
          value={benchmarks.length.toString()}
          icon="barChart"
          iconColor="text-green-600"
        />
        <StatCard
          title="Avg Accuracy"
          value={predictions.length > 0 
            ? (predictions.reduce((acc, p) => acc + p.accuracy, 0) / predictions.length).toFixed(1) + '%'
            : 'N/A'
          }
          icon="target"
          iconColor="text-purple-600"
        />
      </div>

      {/* Device Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Device:</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">All Devices</option>
            {predictions.map((pred) => (
              <option key={pred.deviceId} value={pred.deviceId}>
                {pred.deviceName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'predictions', label: 'ML Predictions', icon: 'trendingUp' },
            { id: 'anomalies', label: 'Anomaly Detection', icon: 'alertTriangle' },
            { id: 'benchmarks', label: 'Industry Benchmarks', icon: 'barChart' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name={tab.icon as any} size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {filteredPredictions.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="trendingUp" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Available</h3>
              <p className="text-gray-600">ML predictions will appear here once enough data is collected</p>
            </div>
          ) : (
            filteredPredictions.map((prediction) => (
              <div key={prediction.deviceId} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{prediction.deviceName}</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Model: {prediction.model}</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {prediction.accuracy}% Accuracy
                    </span>
                  </div>
                </div>

                {/* Prediction Chart */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">24-Hour Energy Forecast</h4>
                  <ChartBars 
                    data={prediction.predictions.map(p => ({
                      label: new Date(p.timestamp).getHours() + ':00',
                      value: p.generationKW
                    }))} 
                    height={200} 
                  />
                </div>

                {/* Prediction Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Icon name="sun" size={20} className="text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Predicted Generation</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {prediction.predictions[0]?.generationKW.toFixed(2)} kW
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Icon name="zap" size={20} className="text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Predicted Consumption</p>
                        <p className="text-lg font-semibold text-green-600">
                          {prediction.predictions[0]?.consumptionKW.toFixed(2)} kW
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Icon name="target" size={20} className="text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Confidence Level</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {prediction.predictions[0]?.confidence.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="shield" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Anomalies Detected</h3>
              <p className="text-gray-600">Your systems are operating within normal parameters</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnomalies.map((anomaly) => (
                    <tr key={anomaly.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {anomaly.deviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {anomaly.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          anomaly.severity === 'HIGH' 
                            ? 'bg-red-100 text-red-800'
                            : anomaly.severity === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {anomaly.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {anomaly.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(anomaly.detectedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {anomaly.confidence.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {benchmarks.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="barChart" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Benchmark Data Available</h3>
              <p className="text-gray-600">Industry benchmarks will appear here once sufficient data is collected</p>
            </div>
          ) : (
            benchmarks.map((benchmark, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                        benchmark.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : benchmark.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {benchmark.priority} Priority
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {benchmark.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{benchmark.title}</h3>
                    <p className="text-gray-600 mb-4">{benchmark.description}</p>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Icon name="trendingUp" size={20} className="text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Potential Improvement</p>
                          <p className="text-lg font-semibold text-green-600">
                            {benchmark.potentialImprovement}% efficiency gain
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                      <Icon name="externalLink" size={16} className="mr-1" />
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
