import { DeviceReading, Device, Organization } from '@prisma/client';

export interface IndustryBenchmark {
  category: string;
  metric: string;
  unit: string;
  excellent: number;
  good: number;
  average: number;
  poor: number;
  description: string;
}

export interface BenchmarkComparison {
  deviceId: string;
  deviceName: string;
  category: string;
  metrics: {
    efficiency: {
      current: number;
      benchmark: IndustryBenchmark;
      percentile: number;
      rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    };
    generation: {
      current: number;
      benchmark: IndustryBenchmark;
      percentile: number;
      rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    };
    uptime: {
      current: number;
      benchmark: IndustryBenchmark;
      percentile: number;
      rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    };
  };
}

export interface IndustryReport {
  organizationId: string;
  period: string;
  overallScore: number;
  industryRanking: {
    efficiency: number; // Percentile ranking
    generation: number;
    reliability: number;
    costEffectiveness: number;
  };
  recommendations: Array<{
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    potentialImprovement: number;
  }>;
  peerComparison: {
    similarOrganizations: number;
    averageEfficiency: number;
    averageGeneration: number;
    averageCostPerkWh: number;
  };
}

export class BenchmarkService {
  private static readonly INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
    // Solar Panel Benchmarks
    {
      category: 'SOLAR_PANEL',
      metric: 'efficiency',
      unit: '%',
      excellent: 22,
      good: 18,
      average: 15,
      poor: 12,
      description: 'Solar panel conversion efficiency (DC to AC)'
    },
    {
      category: 'SOLAR_PANEL',
      metric: 'capacity_factor',
      unit: '%',
      excellent: 25,
      good: 20,
      average: 15,
      poor: 10,
      description: 'Actual output vs rated capacity over time'
    },
    {
      category: 'SOLAR_PANEL',
      metric: 'performance_ratio',
      unit: '%',
      excellent: 95,
      good: 85,
      average: 75,
      poor: 65,
      description: 'Actual performance vs expected performance'
    },

    // Battery Storage Benchmarks
    {
      category: 'BATTERY',
      metric: 'round_trip_efficiency',
      unit: '%',
      excellent: 95,
      good: 90,
      average: 85,
      poor: 80,
      description: 'Battery charge/discharge efficiency'
    },
    {
      category: 'BATTERY',
      metric: 'depth_of_discharge',
      unit: '%',
      excellent: 50,
      good: 60,
      average: 70,
      poor: 80,
      description: 'Average battery discharge depth (lower is better)'
    },
    {
      category: 'BATTERY',
      metric: 'availability',
      unit: '%',
      excellent: 99,
      good: 97,
      average: 95,
      poor: 90,
      description: 'Battery system availability'
    },

    // Wind Turbine Benchmarks
    {
      category: 'WIND_TURBINE',
      metric: 'capacity_factor',
      unit: '%',
      excellent: 40,
      good: 30,
      average: 25,
      poor: 15,
      description: 'Actual output vs rated capacity'
    },
    {
      category: 'WIND_TURBINE',
      metric: 'availability',
      unit: '%',
      excellent: 98,
      good: 95,
      average: 90,
      poor: 85,
      description: 'Turbine operational availability'
    },

    // Inverter Benchmarks
    {
      category: 'INVERTER',
      metric: 'efficiency',
      unit: '%',
      excellent: 98,
      good: 96,
      average: 94,
      poor: 90,
      description: 'Inverter conversion efficiency'
    },
    {
      category: 'INVERTER',
      metric: 'power_quality',
      unit: 'THD%',
      excellent: 3,
      good: 5,
      average: 7,
      poor: 10,
      description: 'Total harmonic distortion (lower is better)'
    },

    // Overall System Benchmarks
    {
      category: 'SYSTEM',
      metric: 'overall_efficiency',
      unit: '%',
      excellent: 85,
      good: 75,
      average: 65,
      poor: 50,
      description: 'End-to-end system efficiency'
    },
    {
      category: 'SYSTEM',
      metric: 'cost_per_kwh',
      unit: '$/kWh',
      excellent: 0.08,
      good: 0.10,
      average: 0.12,
      poor: 0.15,
      description: 'Levelized cost of energy (lower is better)'
    },
    {
      category: 'SYSTEM',
      metric: 'uptime',
      unit: '%',
      excellent: 99.5,
      good: 98,
      average: 95,
      poor: 90,
      description: 'System operational uptime'
    }
  ];

  /**
   * Get benchmark for specific category and metric
   */
  static getBenchmark(category: string, metric: string): IndustryBenchmark | null {
    return this.INDUSTRY_BENCHMARKS.find(
      b => b.category === category && b.metric === metric
    ) || null;
  }

  /**
   * Calculate percentile ranking against industry benchmarks
   */
  static calculatePercentile(value: number, benchmark: IndustryBenchmark): number {
    const { excellent, good, average, poor } = benchmark;

    if (value >= excellent) return 95;
    if (value >= good) return 80;
    if (value >= average) return 50;
    if (value >= poor) return 20;
    return 5;
  }

  /**
   * Get performance rating based on value vs benchmark
   */
  static getRating(value: number, benchmark: IndustryBenchmark): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' {
    const percentile = this.calculatePercentile(value, benchmark);

    if (percentile >= 90) return 'EXCELLENT';
    if (percentile >= 70) return 'GOOD';
    if (percentile >= 30) return 'AVERAGE';
    return 'POOR';
  }

  /**
   * Analyze device performance against industry benchmarks
   */
  static async analyzeDevicePerformance(
    device: Device,
    readings: DeviceReading[]
  ): Promise<BenchmarkComparison> {
    if (readings.length === 0) {
      throw new Error('No readings available for analysis');
    }

    // Calculate current metrics
    const efficiency = this.calculateEfficiency(readings);
    const generation = this.calculateGeneration(readings);
    const uptime = this.calculateUptime(readings);

    // Get benchmarks
    const efficiencyBenchmark = this.getBenchmark(device.type, 'efficiency') ||
      this.getBenchmark('SYSTEM', 'overall_efficiency')!;
    const generationBenchmark = this.getBenchmark(device.type, 'capacity_factor') ||
      this.getBenchmark(device.type, 'performance_ratio')!;
    const uptimeBenchmark = this.getBenchmark(device.type, 'availability') ||
      this.getBenchmark('SYSTEM', 'uptime')!;

    return {
      deviceId: device.id,
      deviceName: device.name,
      category: device.type,
      metrics: {
        efficiency: {
          current: efficiency,
          benchmark: efficiencyBenchmark,
          percentile: this.calculatePercentile(efficiency, efficiencyBenchmark),
          rating: this.getRating(efficiency, efficiencyBenchmark)
        },
        generation: {
          current: generation,
          benchmark: generationBenchmark,
          percentile: this.calculatePercentile(generation, generationBenchmark),
          rating: this.getRating(generation, generationBenchmark)
        },
        uptime: {
          current: uptime,
          benchmark: uptimeBenchmark,
          percentile: this.calculatePercentile(uptime, uptimeBenchmark),
          rating: this.getRating(uptime, uptimeBenchmark)
        }
      }
    };
  }

  /**
   * Generate industry comparison report for organization
   */
  static async generateIndustryReport(
    organization: Organization,
    devices: Device[],
    readings: DeviceReading[]
  ): Promise<IndustryReport> {
    // Analyze all devices
    const deviceAnalyses = await Promise.all(
      devices.map(device => {
        const deviceReadings = readings.filter(r => r.deviceId === device.id);
        return this.analyzeDevicePerformance(device, deviceReadings);
      })
    );

    // Calculate overall metrics
    const avgEfficiency = deviceAnalyses.reduce((sum, analysis) =>
      sum + analysis.metrics.efficiency.current, 0) / deviceAnalyses.length;
    const avgGeneration = deviceAnalyses.reduce((sum, analysis) =>
      sum + analysis.metrics.generation.current, 0) / deviceAnalyses.length;
    const avgUptime = deviceAnalyses.reduce((sum, analysis) =>
      sum + analysis.metrics.uptime.current, 0) / deviceAnalyses.length;

    // Calculate industry rankings
    const efficiencyRanking = this.calculatePercentile(avgEfficiency,
      this.getBenchmark('SYSTEM', 'overall_efficiency')!);
    const generationRanking = this.calculatePercentile(avgGeneration,
      this.getBenchmark('SYSTEM', 'overall_efficiency')!);
    const reliabilityRanking = this.calculatePercentile(avgUptime,
      this.getBenchmark('SYSTEM', 'uptime')!);
    const costEffectivenessRanking = this.calculatePercentile(0.12,
      this.getBenchmark('SYSTEM', 'cost_per_kwh')!); // Assuming $0.12/kWh

    // Generate recommendations
    const recommendations = this.generateRecommendations(deviceAnalyses);

    // Calculate overall score
    const overallScore = (efficiencyRanking + generationRanking + reliabilityRanking + costEffectivenessRanking) / 4;

    return {
      organizationId: organization.id,
      period: 'Last 30 days',
      overallScore: Math.round(overallScore),
      industryRanking: {
        efficiency: efficiencyRanking,
        generation: generationRanking,
        reliability: reliabilityRanking,
        costEffectiveness: costEffectivenessRanking
      },
      recommendations,
      peerComparison: {
        similarOrganizations: 150, // Simulated peer group size
        averageEfficiency: 65, // Industry averages
        averageGeneration: 18,
        averageCostPerkWh: 0.12
      }
    };
  }

  /**
   * Calculate efficiency from readings
   */
  private static calculateEfficiency(readings: DeviceReading[]): number {
    const validReadings = readings.filter(r => r.efficiency !== null && r.efficiency !== undefined);
    if (validReadings.length === 0) return 0;

    return validReadings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / validReadings.length;
  }

  /**
   * Calculate generation performance
   */
  private static calculateGeneration(readings: DeviceReading[]): number {
    const validReadings = readings.filter(r => r.generationKW !== null && r.generationKW !== undefined);
    if (validReadings.length === 0) return 0;

    // Calculate capacity factor (actual vs potential)
    const maxGeneration = Math.max(...validReadings.map(r => r.generationKW || 0));
    const avgGeneration = validReadings.reduce((sum, r) => sum + (r.generationKW || 0), 0) / validReadings.length;

    return maxGeneration > 0 ? (avgGeneration / maxGeneration) * 100 : 0;
  }

  /**
   * Calculate uptime from readings
   */
  private static calculateUptime(readings: DeviceReading[]): number {
    if (readings.length === 0) return 0;

    // Count readings with non-zero values (indicating active operation)
    const activeReadings = readings.filter(r =>
      (r.generationKW && r.generationKW > 0) ||
      (r.consumptionKW && r.consumptionKW > 0)
    );

    return (activeReadings.length / readings.length) * 100;
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(analyses: BenchmarkComparison[]): Array<{
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    potentialImprovement: number;
  }> {
    const recommendations: Array<{
      category: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      title: string;
      description: string;
      potentialImprovement: number;
    }> = [];

    // Analyze efficiency issues
    const poorEfficiencyDevices = analyses.filter(a =>
      a.metrics.efficiency.rating === 'POOR' || a.metrics.efficiency.rating === 'AVERAGE'
    );

    if (poorEfficiencyDevices.length > 0) {
      recommendations.push({
        category: 'EFFICIENCY',
        priority: 'HIGH',
        title: 'Improve Energy Efficiency',
        description: `${poorEfficiencyDevices.length} devices are performing below industry average efficiency.`,
        potentialImprovement: 15
      });
    }

    // Analyze generation issues
    const poorGenerationDevices = analyses.filter(a =>
      a.metrics.generation.rating === 'POOR' || a.metrics.generation.rating === 'AVERAGE'
    );

    if (poorGenerationDevices.length > 0) {
      recommendations.push({
        category: 'GENERATION',
        priority: 'MEDIUM',
        title: 'Optimize Energy Generation',
        description: `${poorGenerationDevices.length} devices have below-average generation performance.`,
        potentialImprovement: 20
      });
    }

    // Analyze reliability issues
    const poorReliabilityDevices = analyses.filter(a =>
      a.metrics.uptime.rating === 'POOR' || a.metrics.uptime.rating === 'AVERAGE'
    );

    if (poorReliabilityDevices.length > 0) {
      recommendations.push({
        category: 'RELIABILITY',
        priority: 'HIGH',
        title: 'Improve System Reliability',
        description: `${poorReliabilityDevices.length} devices have availability issues.`,
        potentialImprovement: 10
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get all available benchmarks
   */
  static getAllBenchmarks(): IndustryBenchmark[] {
    return this.INDUSTRY_BENCHMARKS;
  }

  /**
   * Get benchmarks by category
   */
  static getBenchmarksByCategory(category: string): IndustryBenchmark[] {
    return this.INDUSTRY_BENCHMARKS.filter(b => b.category === category);
  }
}
