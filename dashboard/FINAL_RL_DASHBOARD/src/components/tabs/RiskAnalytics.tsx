import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ReferenceLine } from 'recharts';
import { riskReturnStrategies } from '../../lib/mockData';
import type { Algo, Indicator } from '../../lib/mockData';
import { KPICard } from '../KPICard';
import { ShieldAlert, Clock, Target, DollarSign } from 'lucide-react';

interface RiskAnalyticsProps {
  algo: Algo;
  indicator: Indicator;
  portfolio: any[];
  metrics: any;
  bh: any;
  showBH: boolean;
}

export function RiskAnalytics({ algo, indicator, portfolio, metrics, bh, showBH }: RiskAnalyticsProps) {
  // Compute drawdowns
  const drawdowns = useMemo(() => {
    let agentPeak = 0;
    let bhPeak = 0;
    return portfolio.filter((_, i) => i % 5 === 0).map(p => {
      if (p.agent > agentPeak) agentPeak = p.agent;
      if (p.bh > bhPeak) bhPeak = p.bh;
      
      const agentDd = ((p.agent - agentPeak) / agentPeak) * 100;
      const bhDd = ((p.bh - bhPeak) / bhPeak) * 100;
      return {
        date: p.date,
        agent: agentDd,
        bh: bhDd,
      };
    });
  }, [portfolio]);

  const radarData = [
    { metric: "Cum. Return", PPO: 68.4, DQN: 55.6, A2C: 46.8 },
    { metric: "Sharpe Ratio", PPO: 1.34*40, DQN: 1.08*40, A2C: 0.95*40 }, // Scale for visualization
    { metric: "Prob. SR", PPO: 0.91*60, DQN: 0.79*60, A2C: 0.71*60 },
    { metric: "Inv. Drawdown", PPO: 100-12.3, DQN: 100-15.9, A2C: 100-18.1 }, 
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Max Drawdown" value={`${metrics.mdd}%`} subValueColor="red" icon={<ShieldAlert size={16} />} />
        <KPICard title="Recovery Time" value="45 Days" subValue="Avg. peak-to-peak" icon={<Clock size={16} />} />
        <KPICard title="Win Rate" value={`${algo === 'PPO' ? 58 : 45}%`} subValue="Profitable trades" subValueColor="green" icon={<Target size={16} />} />
        <KPICard title="Profit Factor" value={algo === 'PPO' ? 1.85 : 1.42} subValue="Gross Profit / Gross Loss" icon={<DollarSign size={16} />} />
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Underwater Curve (Drawdown Analysis)</h3>
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdowns} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAgentDd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-red))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-red))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(t) => t.substring(0, 7)} minTickGap={30} />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v).toFixed(0)}%`} domain={['auto', 0]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                formatter={(v: number) => `${v.toFixed(2)}%`}
              />
              <ReferenceLine y={metrics.mdd} stroke="hsl(var(--chart-orange))" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'Agent MDD', fill: 'hsl(var(--chart-orange))' }} />
              {showBH && (
                <Area type="monotone" dataKey="bh" name="Buy & Hold" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fill="none" />
              )}
              <Area type="monotone" dataKey="agent" name={`${algo}+${indicator}`} stroke="hsl(var(--chart-red))" strokeWidth={2} fillOpacity={1} fill="url(#colorAgentDd)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Risk-Return Scatter Plot</h3>
          <div className="h-[320px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="risk" name="Risk (Vol/MDD)" unit="v" stroke="hsl(var(--muted-foreground))" domain={[0, 0.3]} />
                <YAxis type="number" dataKey="return" name="Return (CR%)" unit="%" stroke="hsl(var(--muted-foreground))" domain={[0, 80]} />
                <ZAxis type="category" dataKey="name" name="Strategy" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                
                <Scatter name="PPO Strategies" data={riskReturnStrategies.filter(s => s.algo === 'PPO')} fill="hsl(var(--chart-green))" shape="circle" />
                <Scatter name="DQN Strategies" data={riskReturnStrategies.filter(s => s.algo === 'DQN')} fill="hsl(var(--chart-blue))" shape="triangle" />
                <Scatter name="A2C Strategies" data={riskReturnStrategies.filter(s => s.algo === 'A2C')} fill="hsl(var(--chart-orange))" shape="square" />
                <Scatter name="Buy & Hold" data={[{name: 'B&H', risk: 0.28, return: 41.2}]} fill="hsl(var(--chart-red))" shape="cross" />
                <Legend verticalAlign="bottom" height={36} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Strategy Comparison (Radar)</h3>
          <div className="h-[320px] w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="PPO" dataKey="PPO" stroke="hsl(var(--chart-green))" fill="hsl(var(--chart-green))" fillOpacity={0.4} />
                <Radar name="DQN" dataKey="DQN" stroke="hsl(var(--chart-blue))" fill="hsl(var(--chart-blue))" fillOpacity={0.2} />
                <Radar name="A2C" dataKey="A2C" stroke="hsl(var(--chart-orange))" fill="hsl(var(--chart-orange))" fillOpacity={0.2} />
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
