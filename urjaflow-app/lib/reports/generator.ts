import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { DeviceReading, Device, Organization } from '@prisma/client';

export interface ReportData {
  organization: Organization;
  devices: Device[];
  readings: DeviceReading[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ReportConfig {
  title: string;
  format: 'PDF' | 'EXCEL';
  includeCharts: boolean;
  includeRecommendations: boolean;
  sections: string[];
}

export class ReportGenerator {
  static async generateReport(data: ReportData, config: ReportConfig): Promise<Buffer> {
    if (config.format === 'PDF') {
      return this.generatePDFReport(data, config);
    } else {
      return this.generateExcelReport(data, config);
    }
  }

  private static async generatePDFReport(data: ReportData, config: ReportConfig): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Title
    doc.setFontSize(20);
    doc.text(config.title, pageWidth / 2, 20, { align: 'center' });
    
    // Organization info
    doc.setFontSize(12);
    doc.text(`Organization: ${data.organization.name}`, 20, 40);
    doc.text(`Period: ${data.period.startDate.toDateString()} - ${data.period.endDate.toDateString()}`, 20, 50);
    
    // Summary section
    let yPosition = 70;
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    const totalGeneration = data.readings.reduce((sum, r) => sum + (r.generationKW || 0), 0);
    const totalConsumption = data.readings.reduce((sum, r) => sum + (r.consumptionKW || 0), 0);
    const avgEfficiency = data.readings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / data.readings.length;
    
    doc.setFontSize(10);
    doc.text(`Total Generation: ${totalGeneration.toFixed(2)} kWh`, 30, yPosition);
    yPosition += 8;
    doc.text(`Total Consumption: ${totalConsumption.toFixed(2)} kWh`, 30, yPosition);
    yPosition += 8;
    doc.text(`Average Efficiency: ${avgEfficiency.toFixed(1)}%`, 30, yPosition);
    yPosition += 8;
    doc.text(`Number of Devices: ${data.devices.length}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Total Readings: ${data.readings.length}`, 30, yPosition);
    
    // Device details
    yPosition += 15;
    doc.setFontSize(14);
    doc.text('Device Details', 20, yPosition);
    yPosition += 10;
    
    data.devices.forEach((device, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${device.name} (${device.type})`, 30, yPosition);
      yPosition += 8;
      
      const deviceReadings = data.readings.filter(r => r.deviceId === device.id);
      const deviceGeneration = deviceReadings.reduce((sum, r) => sum + (r.generationKW || 0), 0);
      const deviceEfficiency = deviceReadings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / deviceReadings.length;
      
      doc.setFontSize(10);
      doc.text(`   Generation: ${deviceGeneration.toFixed(2)} kWh | Efficiency: ${deviceEfficiency.toFixed(1)}%`, 40, yPosition);
      yPosition += 10;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  private static async generateExcelReport(data: ReportData, config: ReportConfig): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Report Title', config.title],
      ['Organization', data.organization.name],
      ['Period', `${data.period.startDate.toDateString()} - ${data.period.endDate.toDateString()}`],
      ['Total Generation (kWh)', data.readings.reduce((sum, r) => sum + (r.generationKW || 0), 0).toFixed(2)],
      ['Total Consumption (kWh)', data.readings.reduce((sum, r) => sum + (r.consumptionKW || 0), 0).toFixed(2)],
      ['Average Efficiency (%)', (data.readings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / data.readings.length).toFixed(1)],
      ['Number of Devices', data.devices.length],
      ['Total Readings', data.readings.length]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Devices sheet
    const devicesData = [
      ['Device Name', 'Type', 'Generation (kWh)', 'Consumption (kWh)', 'Efficiency (%)', 'Status']
    ];
    
    data.devices.forEach(device => {
      const deviceReadings = data.readings.filter(r => r.deviceId === device.id);
      const generation = deviceReadings.reduce((sum, r) => sum + (r.generationKW || 0), 0);
      const consumption = deviceReadings.reduce((sum, r) => sum + (r.consumptionKW || 0), 0);
      const efficiency = deviceReadings.length > 0 ? deviceReadings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / deviceReadings.length : 0;
      
      devicesData.push([
        device.name,
        device.type,
        generation.toFixed(2),
        consumption.toFixed(2),
        efficiency.toFixed(1),
        device.status
      ]);
    });
    
    const devicesSheet = XLSX.utils.aoa_to_sheet(devicesData);
    XLSX.utils.book_append_sheet(workbook, devicesSheet, 'Devices');
    
    // Readings sheet
    const readingsData = [
      ['Timestamp', 'Device Name', 'Generation (kWh)', 'Consumption (kWh)', 'Efficiency (%)', 'Battery (%)']
    ];
    
    data.readings.forEach(reading => {
      const device = data.devices.find(d => d.id === reading.deviceId);
      readingsData.push([
        reading.timestamp.toISOString(),
        device?.name || 'Unknown',
        (reading.generationKW || 0).toFixed(2),
        (reading.consumptionKW || 0).toFixed(2),
        (reading.efficiency || 0).toFixed(1),
        (reading.batteryPercent || 0).toFixed(1)
      ]);
    });
    
    const readingsSheet = XLSX.utils.aoa_to_sheet(readingsData);
    XLSX.utils.book_append_sheet(workbook, readingsSheet, 'Readings');
    
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(excelBuffer);
  }
}
