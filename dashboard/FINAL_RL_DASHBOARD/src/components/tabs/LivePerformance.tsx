import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getMonthlyReturns } from '../../lib/mockData';
import type { Algo, Indicator } from '../../lib/mockData';
import { KPICard } from '../KPICard';
import { TrendingUp, Activity, ShieldAlert, Zap } from 'lucide-react';

interface LivePerformanceProps {
  algo: Algo;
  indicator: Indicator;
  portfolio: any[];
  metrics: any;
  bh: any;
  showBH: boolean;
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Orange

export function LivePerformance({ algo, indicator, portfolio, metrics, bh, showBH }: LivePerformanceProps) {
  const pieData = [
    { name: 'BUY', value: 28 },
    { name: 'SELL', value: 24 },
    { name: 'HOLD', value: 48 },
  ];

  const monthlyReturns = useMemo(() => getMonthlyReturns(algo), [algo]);

  // Simplify portfolio data to not freeze Recharts (take every 5th point)
  const chartData = portfolio.filter((_, i) => i % 5 === 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Cumulative Return" value={`+${metrics.cr}%`} subValue={`vs B&H: ${(metrics.cr - bh.cr).toFixed(1)}%`} subValueColor={metrics.cr > bh.cr ? "green" : "red"} icon={<TrendingUp size={16} />} />
        <KPICard title="Sharpe Ratio" value={metrics.sr} subValue="Risk-adjusted" icon={<Activity size={16} />} />
        <KPICard title="Probabilistic SR" value={metrics.psr} subValue="Confidence > 0.90" icon={<Zap size={16} />} />
        <KPICard title="Max Drawdown" value={`${metrics.mdd}%`} subValueColor="red" icon={<ShieldAlert size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Portfolio Performance</h3>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-green))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-green))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(t) => t.substring(0, 7)} minTickGap={30} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v).toFixed(1)}x`} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                {showBH && (
                  <Area type="monotone" dataKey="bh" name="Buy & Hold" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fill="none" />
                )}
                <Area type="monotone" dataKey="agent" name={`${algo}+${indicator}`} stroke="hsl(var(--chart-green))" strokeWidth={2} fillOpacity={1} fill="url(#colorAgent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Action Distribution</h3>
          <div className="h-[300px] w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 overflow-x-auto">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Monthly Returns Heatmap</h3>
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[80px_repeat(12,1fr)] gap-1 mb-2 font-mono text-xs text-center text-muted-foreground">
            <div className="font-bold text-left px-2">Year</div>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
              <div key={m}>{m}</div>
            ))}
          </div>
          {monthlyReturns.map((row) => (
            <div key={row.year} className="grid grid-cols-[80px_repeat(12,1fr)] gap-1 mb-1 font-mono text-xs text-center">
              <div className="flex items-center font-bold px-2 text-left">{row.year}</div>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => {
                const val = row[m] as number;
                const isPos = val > 0;
                // opacity based on magnitude up to 10%
                const op = Math.min(Math.abs(val) / 10, 1) * 0.8 + 0.2;
                return (
                  <div 
                    key={m} 
                    className="p-2 rounded text-white flex items-center justify-center font-medium"
                    style={{ backgroundColor: isPos ? `rgba(16, 185, 129, ${op})` : `rgba(239, 68, 68, ${op})` }}
                  >
                    {val > 0 ? '+' : ''}{val}%
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
