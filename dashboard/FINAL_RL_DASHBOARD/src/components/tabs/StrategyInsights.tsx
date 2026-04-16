import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { allStrategies } from '../../lib/mockData';
import { Trophy, Check, X } from 'lucide-react';

export function StrategyInsights() {
  const winRateData = [
    { name: 'PPO Best', value: 58, fill: 'hsl(var(--chart-green))' },
    { name: 'DQN Best', value: 22, fill: 'hsl(var(--chart-blue))' },
    { name: 'A2C Best', value: 11, fill: 'hsl(var(--chart-orange))' },
    { name: 'Tie', value: 9, fill: 'hsl(var(--muted-foreground))' },
  ];

  const sortedByCr = [...allStrategies].sort((a,b) => b.cr - a.cr).map(s => ({...s, name: `${s.algo}+${s.indicator.substring(0,3)}`}));
  const sortedBySr = [...allStrategies].sort((a,b) => b.sharpe - a.sharpe).map(s => ({...s, name: `${s.algo}+${s.indicator.substring(0,3)}`}));

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Comprehensive Strategy Ranking</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Algorithm</th>
                <th className="px-4 py-2">Indicator</th>
                <th className="px-4 py-2 text-right">Cum. Return</th>
                <th className="px-4 py-2 text-right">Sharpe</th>
                <th className="px-4 py-2 text-right">PSR</th>
                <th className="px-4 py-2 text-right">MDD</th>
                <th className="px-4 py-2 text-right">Vs B&H</th>
                <th className="px-4 py-2 text-center">Winner</th>
              </tr>
            </thead>
            <tbody>
              {allStrategies.map((s, idx) => (
                <tr key={idx} className={`border-b border-border hover:bg-muted/30 ${s.rank === 1 ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <td className="px-4 py-3 font-bold flex items-center">
                    {s.rank === 1 && <Trophy size={16} className="text-chart-orange mr-2" />}
                    #{s.rank}
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.algo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.indicator}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-chart-green">{s.cr}%</td>
                  <td className="px-4 py-3 text-right font-mono">{s.sharpe}</td>
                  <td className="px-4 py-3 text-right font-mono">{s.psr}</td>
                  <td className="px-4 py-3 text-right font-mono text-chart-red">{s.mdd}%</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${s.vsBH.startsWith('+') ? 'text-chart-green' : 'text-chart-red'}`}>
                    {s.vsBH}
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center">
                    {s.winner.includes('BEST') ? (
                      <span className="text-xs font-bold text-chart-orange bg-chart-orange/20 px-2 py-0.5 rounded flex items-center">
                        <Trophy size={12} className="mr-1" /> BEST
                      </span>
                    ) : s.winner === '✓' ? (
                      <Check size={16} className="text-chart-green" />
                    ) : (
                      <X size={16} className="text-chart-red" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Cumulative Return Comparison</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByCr} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Bar dataKey="cr">
                  {sortedByCr.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--chart-green))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Sharpe Ratio Comparison</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedBySr} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Bar dataKey="sharpe">
                  {sortedBySr.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.sharpe >= 1.0 ? "hsl(var(--chart-green))" : "hsl(var(--muted-foreground))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Win Rate Analysis</h3>
          <div className="h-[250px] w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {winRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
