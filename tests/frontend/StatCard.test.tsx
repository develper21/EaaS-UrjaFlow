import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatCard } from '@/components/StatCard';

describe('StatCard', () => {
  it('renders its title, value, unit, and icon label', () => {
    render(<StatCard title="Energy generated" value={1250} unit="kWh" icon="zap" />);

    expect(screen.getByText('Energy generated')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1250' })).toBeInTheDocument();
    expect(screen.getByText('kWh')).toBeInTheDocument();
    expect(screen.getByText('Real-time Telemetry')).toBeInTheDocument();
  });

  it('marks an ordinary positive trend as favorable', () => {
    render(
      <StatCard
        title="Energy generated"
        value="1,250"
        icon="zap"
        trend={{ value: 12, isPositive: true }}
      />
    );

    expect(screen.getByText('12%').parentElement).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('marks a negative trend as unfavorable by default', () => {
    render(
      <StatCard
        title="Energy usage"
        value="800"
        icon="zap"
        trend={{ value: -8, isPositive: false }}
      />
    );

    expect(screen.getByText('8%').parentElement).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('reverses trend favorability for inverse metrics', () => {
    render(
      <StatCard
        title="Energy usage"
        value="800"
        icon="zap"
        inverse
        trend={{ value: -8, isPositive: false }}
      />
    );

    expect(screen.getByText('8%').parentElement).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });
});
