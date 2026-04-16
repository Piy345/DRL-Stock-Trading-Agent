import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface TradeSignalsProps {
  signals: any[];
}

export function TradeSignals({ signals }: TradeSignalsProps) {
  // sample out data for line chart
  const chartData = useMemo(() => {
    return signals.filter((_, i) => i % 5 === 0);
  }, [signals]);

  const recentTradeSignals = useMemo(() => {
    return [...signals].reverse().filter(s => s.action !== "HOLD").slice(0, 30);
  }, [signals]);

  const monthlyCounts = useMemo(() => {
    const counts = [];
    if(signals.length === 0) return [];
    
    const latestDate = new Date(signals[signals.length - 1].date);
    for(let i=11; i>=0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const mStr = d.toISOString().substring(0, 7);
      
      const monthSignals = signals.filter(s => s.date.startsWith(mStr) && s.action !== "HOLD");
      counts.push({
        month: d.toLocaleString('default', { month: 'short' }),
        BUY: monthSignals.filter(s => s.action === "BUY").length,
        SELL: monthSignals.filter(s => s.action === "SELL").length,
      });
    }
    return counts;
  }, [signals]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Relative Strength Index (RSI)</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(t) => t.substring(0, 7)} minTickGap={30} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} ticks={[0, 30, 50, 70, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <ReferenceLine y={70} stroke="hsl(var(--chart-red))" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="hsl(var(--chart-green))" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rsi" stroke="hsl(var(--chart-orange))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">MACD Line & Histogram</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(t) => t.substring(0, 7)} minTickGap={30} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar yAxisId="left" dataKey="histogram" name="Histogram" fill="hsl(var(--chart-blue))" opacity={0.5} />
                <Line yAxisId="left" type="monotone" dataKey="macd" name="MACD" stroke="hsl(var(--chart-purple))" dot={false} strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="signal" name="Signal Area" stroke="hsl(var(--chart-orange))" dot={false} strokeWidth={1} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Monthly Signal Count</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} cursor={{fill: 'transparent'}} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="BUY" fill="hsl(var(--chart-green))" />
                <Bar dataKey="SELL" fill="hsl(var(--chart-red))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border rounded-lg p-4 flex flex-col h-[320px]">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Recent Trade Signals Log (Last 30)</h3>
          <div className="flex-1 overflow-auto rounded border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Price ($)</th>
                  <th className="px-4 py-2">Signal</th>
                  <th className="px-4 py-2">RSI</th>
                  <th className="px-4 py-2">MACD</th>
                  <th className="px-4 py-2 text-right">T. P&L</th>
                </tr>
              </thead>
              <tbody>
                {recentTradeSignals.map((s, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono">{s.date}</td>
                    <td className="px-4 py-2 font-mono">${s.price.toFixed(2)}</td>
                    <td className="px-4 py-2 font-bold">
                      <span className={s.action === 'BUY' ? 'text-chart-green' : 'text-chart-red'}>{s.action}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{s.rsi}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{s.macd}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      <span className={s.pnl > 0 ? 'text-chart-green' : s.pnl < 0 ? 'text-chart-red' : 'text-muted-foreground'}>
                        {s.pnl > 0 ? '+' : ''}{s.pnl}%
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTradeSignals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No recent signals found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
