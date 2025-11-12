import { formatCurrency, formatDate, formatNumber, calculateCarbonSavings, calculateSavings } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(29.99)).toBe('$29.99');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with correct decimals', () => {
      expect(formatNumber(3.14159, 2)).toBe('3.14');
      expect(formatNumber(100, 0)).toBe('100');
    });
  });

  describe('calculateCarbonSavings', () => {
    it('should calculate carbon savings correctly', () => {
      const savings = calculateCarbonSavings(100);
      expect(savings).toBeCloseTo(41.7, 1);
    });
  });

  describe('calculateSavings', () => {
    it('should calculate monetary savings correctly', () => {
      const savings = calculateSavings(100, 0.13);
      expect(savings).toBe(13);
    });
  });
});
