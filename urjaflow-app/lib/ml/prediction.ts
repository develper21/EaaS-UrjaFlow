import { DeviceReading, Device } from '@prisma/client';
import { SimpleLinearRegression } from 'ml-regression';

export interface PredictionResult {
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

export interface TrainingData {
  timestamp: number;
  generationKW: number;
  consumptionKW: number;
  hour: number;
  dayOfWeek: number;
  month: number;
  isWeekend: number;
  temperature?: number;
}

export class EnergyPredictionService {
  private static readonly PREDICTION_HORIZON_HOURS = 24; // Next 24 hours
  private static readonly MIN_DATA_POINTS = 48; // Minimum 2 days of data

  /**
   * Train prediction model for a device
   */
  static async trainModel(deviceId: string, readings: DeviceReading[]): Promise<any> {
    if (readings.length < this.MIN_DATA_POINTS) {
      throw new Error(`Insufficient data for training. Need at least ${this.MIN_DATA_POINTS} readings, got ${readings.length}`);
    }

    // Prepare training data
    const trainingData: TrainingData[] = readings.map(reading => {
      const date = new Date(reading.timestamp);
      return {
        timestamp: date.getTime(),
        generationKW: reading.generationKW || 0,
        consumptionKW: reading.consumptionKW || 0,
        hour: date.getHours(),
        dayOfWeek: date.getDay(),
        month: date.getMonth() + 1,
        isWeekend: date.getDay() === 0 || date.getDay() === 6 ? 1 : 0,
        temperature: reading.temperature || undefined,
      };
    });

    // Train generation model
    const generationFeatures = trainingData.map(d => [
      d.hour,
      d.dayOfWeek,
      d.month,
      d.isWeekend,
      d.temperature || 20, // Default temperature if missing
    ]);
    
    const generationTargets = trainingData.map(d => d.generationKW);
    const generationModel = new SimpleLinearRegression(generationFeatures, generationTargets);

    // Train consumption model
    const consumptionTargets = trainingData.map(d => d.consumptionKW);
    const consumptionModel = new SimpleLinearRegression(generationFeatures, consumptionTargets);

    return {
      generationModel,
      consumptionModel,
      trainedAt: new Date(),
      dataPoints: trainingData.length,
      accuracy: this.calculateModelAccuracy(generationModel, consumptionModel, trainingData),
    };
  }

  /**
   * Generate predictions for next 24 hours
   */
  static async generatePredictions(
    deviceId: string,
    deviceName: string,
    generationModel: any,
    consumptionModel: any,
    lastReading?: DeviceReading
  ): Promise<PredictionResult> {
    const predictions = [];
    const now = new Date();
    let lastTemp = lastReading?.temperature || 20;

    for (let i = 1; i <= this.PREDICTION_HORIZON_HOURS; i++) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      
      // Extract features for prediction
      const features = [
        futureTime.getHours(),
        futureTime.getDay(),
        futureTime.getMonth() + 1,
        futureTime.getDay() === 0 || futureTime.getDay() === 6 ? 1 : 0,
        lastTemp, // Use last known temperature
      ];

      // Generate predictions
      const generationPrediction = Math.max(0, generationModel.predict(features));
      const consumptionPrediction = Math.max(0, consumptionModel.predict(features));

      // Calculate confidence based on time of day and data availability
      const confidence = this.calculateConfidence(futureTime, generationModel, consumptionModel);

      predictions.push({
        timestamp: futureTime,
        generationKW: parseFloat(generationPrediction.toFixed(2)),
        consumptionKW: parseFloat(consumptionPrediction.toFixed(2)),
        confidence: parseFloat(confidence.toFixed(2)),
      });
    }

    return {
      deviceId,
      deviceName,
      predictions,
      accuracy: this.calculateModelAccuracy(generationModel, consumptionModel, []),
      model: 'Linear Regression',
    };
  }

  /**
   * Calculate model accuracy using cross-validation
   */
  private static calculateModelAccuracy(
    generationModel: any,
    consumptionModel: any,
    trainingData: TrainingData[]
  ): number {
    if (trainingData.length === 0) return 0;

    // Simple accuracy calculation using R-squared
    const generationPredictions = trainingData.map(d => {
      const features = [d.hour, d.dayOfWeek, d.month, d.isWeekend, d.temperature || 20];
      return generationModel.predict(features);
    });

    const consumptionPredictions = trainingData.map(d => {
      const features = [d.hour, d.dayOfWeek, d.month, d.isWeekend, d.temperature || 20];
      return consumptionModel.predict(features);
    });

    const generationAccuracy = this.calculateR2(
      trainingData.map(d => d.generationKW),
      generationPredictions
    );

    const consumptionAccuracy = this.calculateR2(
      trainingData.map(d => d.consumptionKW),
      consumptionPredictions
    );

    // Average of both accuracies
    return ((generationAccuracy + consumptionAccuracy) / 2) * 100;
  }

  /**
   * Calculate R-squared (coefficient of determination)
   */
  private static calculateR2(actual: number[], predicted: number[]): number {
    if (actual.length === 0) return 0;

    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    
    const totalSumSquares = actual.reduce((sum, val) => {
      return sum + Math.pow(val - actualMean, 2);
    }, 0);

    const residualSumSquares = actual.reduce((sum, val, index) => {
      return sum + Math.pow(val - predicted[index], 2);
    }, 0);

    if (totalSumSquares === 0) return 1;
    
    return Math.max(0, 1 - (residualSumSquares / totalSumSquares));
  }

  /**
   * Calculate prediction confidence based on various factors
   */
  private static calculateConfidence(
    timestamp: Date,
    generationModel: any,
    consumptionModel: any
  ): number {
    let confidence = 0.8; // Base confidence

    // Higher confidence during typical operating hours
    const hour = timestamp.getHours();
    if (hour >= 6 && hour <= 18) {
      confidence += 0.1;
    }

    // Lower confidence during night hours
    if (hour >= 22 || hour <= 4) {
      confidence -= 0.1;
    }

    // Weekend adjustments
    const dayOfWeek = timestamp.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      confidence -= 0.05; // Slightly lower confidence on weekends
    }

    return Math.max(0.3, Math.min(0.95, confidence));
  }

  /**
   * Detect anomalies in device readings
   */
  static detectAnomalies(readings: DeviceReading[]): {
    anomalies: Array<{
      timestamp: Date;
      type: 'SPIKE' | 'DROP' | 'FLATLINE' | 'OUTLIER';
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      description: string;
      value: number;
      expectedValue: number;
    }>;
    stats: {
      totalReadings: number;
      anomalyCount: number;
      anomalyRate: number;
    };
  } {
    const anomalies = [];
    const values = readings.map(r => r.generationKW || r.consumptionKW || 0);
    
    if (values.length < 10) {
      return {
        anomalies: [],
        stats: {
          totalReadings: readings.length,
          anomalyCount: 0,
          anomalyRate: 0,
        },
      };
    }

    // Calculate statistical measures
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Detect anomalies
    readings.forEach((reading, index) => {
      const value = reading.generationKW || reading.consumptionKW || 0;
      const timestamp = new Date(reading.timestamp);

      // Statistical outlier
      if (value < lowerBound || value > upperBound) {
        anomalies.push({
          timestamp,
          type: 'OUTLIER',
          severity: Math.abs(value - mean) > 2 * iqr ? 'HIGH' : 'MEDIUM',
          description: `Value ${value} is outside normal range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
          value,
          expectedValue: mean,
        });
      }

      // Spike detection (sudden increase)
      if (index > 0) {
        const prevValue = values[index - 1];
        const changeRate = Math.abs((value - prevValue) / prevValue);
        
        if (changeRate > 0.5) { // 50% change
          anomalies.push({
            timestamp,
            type: 'SPIKE',
            severity: changeRate > 1.0 ? 'HIGH' : 'MEDIUM',
            description: `Sudden spike detected: ${prevValue.toFixed(2)} → ${value.toFixed(2)} (${(changeRate * 100).toFixed(1)}% change)`,
            value,
            expectedValue: prevValue,
          });
        }

        // Drop detection (sudden decrease)
        if (changeRate > 0.3 && value < prevValue) {
          anomalies.push({
            timestamp,
            type: 'DROP',
            severity: changeRate > 0.7 ? 'HIGH' : 'MEDIUM',
            description: `Sudden drop detected: ${prevValue.toFixed(2)} → ${value.toFixed(2)} (${(changeRate * 100).toFixed(1)}% change)`,
            value,
            expectedValue: prevValue,
          });
        }
      }

      // Flatline detection (constant values)
      if (index >= 5) {
        const recentValues = values.slice(index - 5, index);
        const isConstant = recentValues.every(val => Math.abs(val - value) < 0.01);
        
        if (isConstant && value > 0) {
          anomalies.push({
            timestamp,
            type: 'FLATLINE',
            severity: 'MEDIUM',
            description: `Constant value detected for 6 consecutive readings: ${value.toFixed(2)}`,
            value,
            expectedValue: mean,
          });
        }
      }
    });

    return {
      anomalies,
      stats: {
        totalReadings: readings.length,
        anomalyCount: anomalies.length,
        anomalyRate: (anomalies.length / readings.length) * 100,
      },
    };
  }

  /**
   * Generate energy efficiency recommendations
   */
  static generateEfficiencyRecommendations(
    device: Device,
    readings: DeviceReading[]
  ): {
    recommendations: Array<{
      type: 'OPTIMIZATION' | 'MAINTENANCE' | 'UPGRADE' | 'USAGE_PATTERN';
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      title: string;
      description: string;
      potentialSavings: number;
      implementation: string;
    }>;
    overallEfficiency: number;
  } {
    const recommendations = [];
    const values = readings.map(r => ({
      generation: r.generationKW || 0,
      consumption: r.consumptionKW || 0,
      efficiency: r.efficiency || 0,
      timestamp: new Date(r.timestamp),
    }));

    if (values.length === 0) {
      return {
        recommendations: [],
        overallEfficiency: 0,
      };
    }

    const avgEfficiency = values.reduce((sum, v) => sum + v.efficiency, 0) / values.length;
    const avgGeneration = values.reduce((sum, v) => sum + v.generation, 0) / values.length;
    const avgConsumption = values.reduce((sum, v) => sum + v.consumption, 0) / values.length;

    // Low efficiency recommendation
    if (avgEfficiency < 70) {
      recommendations.push({
        type: 'OPTIMIZATION',
        priority: 'HIGH',
        title: 'Low Energy Efficiency Detected',
        description: `Your ${device.type} is operating at ${avgEfficiency.toFixed(1)}% efficiency, which is below the recommended 80% threshold.`,
        potentialSavings: (avgGeneration * 0.1 * 24 * 365 * 0.12), // 10% improvement for a year
        implementation: 'Schedule maintenance check and clean the device. Consider upgrading to a more efficient model if the device is older than 5 years.',
      });
    }

    // High consumption recommendation
    if (device.type === 'SOLAR_PANEL' && avgGeneration < device.capacity! * 0.6) {
      recommendations.push({
        type: 'OPTIMIZATION',
        priority: 'MEDIUM',
        title: 'Suboptimal Energy Generation',
        description: `Your solar panels are generating at ${((avgGeneration / device.capacity!) * 100).toFixed(1)}% of capacity.`,
        potentialSavings: (device.capacity! * 0.2 - avgGeneration) * 24 * 365 * 0.12,
        implementation: 'Check for shading, dirt accumulation, or panel orientation issues. Consider cleaning panels or adjusting tilt angle.',
      });
    }

    // Battery optimization
    if (device.type === 'BATTERY') {
      const batteryReadings = readings.filter(r => r.batteryPercent !== null);
      if (batteryReadings.length > 0) {
        const avgBatteryLevel = batteryReadings.reduce((sum, r) => sum + (r.batteryPercent || 0), 0) / batteryReadings.length;
        
        if (avgBatteryLevel < 30) {
          recommendations.push({
            type: 'USAGE_PATTERN',
            priority: 'MEDIUM',
            title: 'Frequent Low Battery Levels',
            description: `Battery average level is ${avgBatteryLevel.toFixed(1)}%, indicating frequent deep discharge cycles.`,
            potentialSavings: 50, // Estimated battery lifespan extension value
            implementation: 'Consider adjusting usage patterns or adding additional battery capacity to reduce deep discharge cycles.',
          });
        }
      }
    }

    // Maintenance recommendations based on age
    if (device.installedAt) {
      const deviceAge = (Date.now() - device.installedAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (deviceAge > 10) {
        recommendations.push({
          type: 'UPGRADE',
          priority: 'LOW',
          title: 'Device Aging',
          description: `Your ${device.type} is approximately ${deviceAge.toFixed(1)} years old.`,
          potentialSavings: avgGeneration * 0.15 * 24 * 365 * 0.12, // 15% improvement from upgrade
          implementation: 'Consider upgrading to newer, more efficient technology. Modern devices typically offer 15-25% better efficiency.',
        });
      }
    }

    return {
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      overallEfficiency: avgEfficiency,
    };
  }
}
