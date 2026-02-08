'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon, IconName } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import { Layout } from '@/components/Layout';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'PDF' | 'EXCEL';
  sections: string[];
  includeCharts: boolean;
  includeRecommendations: boolean;
}

interface GeneratedReport {
  id: string;
  title: string;
  format: 'PDF' | 'EXCEL';
  generatedAt: string;
  size: number;
  downloadUrl: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'schedule'>('templates');

  useEffect(() => {
    if (session) {
      fetchReportTemplates();
      fetchGeneratedReports();
    }
  }, [session]);

  const fetchReportTemplates = async () => {
    try {
      const response = await fetch('/api/reports/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
    }
  };

  const fetchGeneratedReports = async () => {
    try {
      const response = await fetch('/api/reports/generated');
      if (response.ok) {
        const data = await response.json();
        setGeneratedReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch generated reports:', error);
    }
  };

  const generateReport = async (template: ReportTemplate, config: Record<string, unknown>) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          format: template.format,
          ...config,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.${template.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Refresh generated reports
        fetchGeneratedReports();
        setShowGenerateModal(false);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (report: GeneratedReport) => {
    try {
      const response = await fetch(report.downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const defaultTemplates: ReportTemplate[] = [
    {
      id: 'energy-summary',
      name: 'Energy Summary Report',
      description: 'Comprehensive overview of energy generation, consumption, and efficiency metrics',
      format: 'PDF',
      sections: ['overview', 'generation', 'consumption', 'efficiency'],
      includeCharts: true,
      includeRecommendations: true,
    },
    {
      id: 'performance-analysis',
      name: 'Performance Analysis',
      description: 'Detailed analysis of device performance and optimization opportunities',
      format: 'EXCEL',
      sections: ['devices', 'readings', 'anomalies', 'predictions'],
      includeCharts: true,
      includeRecommendations: false,
    },
    {
      id: 'billing-report',
      name: 'Billing & Cost Analysis',
      description: 'Financial report including costs, savings, and ROI calculations',
      format: 'PDF',
      sections: ['billing', 'savings', 'roi', 'forecast'],
      includeCharts: true,
      includeRecommendations: true,
    },
    {
      id: 'compliance-report',
      name: 'Compliance & Audit Report',
      description: 'Regulatory compliance and audit trail documentation',
      format: 'PDF',
      sections: ['compliance', 'audit', 'security', 'documentation'],
      includeCharts: false,
      includeRecommendations: false,
    },
  ];

  const reportTemplates = templates.length > 0 ? templates : defaultTemplates;

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Generate and manage custom reports for your energy data</p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <Icon name="fileText" size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Templates</p>
              <p className="text-2xl font-semibold text-gray-900">{reportTemplates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Icon name="download" size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Generated Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{generatedReports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <Icon name="calendar" size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Reports</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <Icon name="clock" size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Generated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {generatedReports.length > 0
                  ? new Date(generatedReports[0].generatedAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates' as const, label: 'Report Templates', icon: 'fileText' as IconName },
            { id: 'generated' as const, label: 'Generated Reports', icon: 'download' as IconName },
            { id: 'schedule' as const, label: 'Scheduled Reports', icon: 'calendar' as IconName },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon name={tab.icon} size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportTemplates.map((template) => (
            <div key={template.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-lg p-3 ${template.format === 'PDF' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                    <Icon
                      name={template.format === 'PDF' ? 'fileText' : 'barChart'}
                      size={20}
                      className={template.format === 'PDF' ? 'text-red-600' : 'text-green-600'}
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${template.format === 'PDF'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {template.format}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{template.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="check" size={16} className="text-green-500 mr-2" />
                  {template.sections.length} sections
                </div>
                {template.includeCharts && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Icon name="check" size={16} className="text-green-500 mr-2" />
                    Includes charts
                  </div>
                )}
                {template.includeRecommendations && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Icon name="check" size={16} className="text-green-500 mr-2" />
                    AI recommendations
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowGenerateModal(true);
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Icon name="download" size={16} className="mr-2" />
                Generate Report
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'generated' && (
        <div className="space-y-6">
          {generatedReports.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="fileText" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
              <p className="text-gray-600 mb-6">Generate your first report using one of the available templates</p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 rounded-lg p-2 ${report.format === 'PDF' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                            <Icon
                              name={report.format === 'PDF' ? 'fileText' : 'barChart'}
                              size={16}
                              className={report.format === 'PDF' ? 'text-red-600' : 'text-green-600'}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${report.format === 'PDF'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.generatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(report.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => downloadReport(report)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Download
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Energy Summary</h4>
                  <p className="text-sm text-gray-600">Generated on the 1st of every month</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Icon name="settings" size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Performance Report</h4>
                  <p className="text-sm text-gray-600">Generated every Monday at 9:00 AM</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Icon name="settings" size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Quarterly Compliance Report</h4>
                  <p className="text-sm text-gray-600">Generated on the last day of each quarter</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Paused
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Icon name="settings" size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Add Scheduled Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && selectedTemplate && (
        <Modal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title={`Generate ${selectedTemplate.name}`}
        >
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="date"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                  <option value={selectedTemplate.format}>{selectedTemplate.format}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked={selectedTemplate.includeCharts} className="mr-2" />
                  <span className="text-sm text-gray-700">Include Charts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked={selectedTemplate.includeRecommendations} className="mr-2" />
                  <span className="text-sm text-gray-700">Include AI Recommendations</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => generateReport(selectedTemplate, {})}
                  disabled={isGenerating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="loader" size={16} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Icon name="download" size={16} className="mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </Layout>
  );
}
