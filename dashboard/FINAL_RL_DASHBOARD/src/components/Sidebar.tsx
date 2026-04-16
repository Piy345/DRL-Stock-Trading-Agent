import React from 'react';
import type { Algo, Indicator } from '../lib/mockData';
import { Info, Settings } from 'lucide-react';

interface SidebarProps {
  algo: Algo;
  setAlgo: (v: Algo) => void;
  indicator: Indicator;
  setIndicator: (v: Indicator) => void;
  commission: boolean;
  setCommission: (v: boolean) => void;
  showBH: boolean;
  setShowBH: (v: boolean) => void;
}

export function Sidebar({ algo, setAlgo, indicator, setIndicator, commission, setCommission, showBH, setShowBH }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card text-card-foreground flex flex-col h-screen fixed left-0 top-0 overflow-y-auto hidden md:flex">
      <div className="p-4 border-b flex items-center space-x-2">
        <div className="bg-primary/20 p-2 rounded text-primary">
          <Settings size={20} />
        </div>
        <h2 className="font-bold text-lg">DRL Settings</h2>
      </div>
      
      <div className="p-4 flex-1 space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Algorithm Model</h3>
          <div className="space-y-2">
            {(['PPO', 'DQN', 'A2C'] as Algo[]).map((m) => (
              <label key={m} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <input 
                  type="radio" 
                  name="algo" 
                  value={m} 
                  checked={algo === m} 
                  onChange={() => setAlgo(m)}
                  className="w-4 h-4 text-primary bg-background border-input focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium">{m}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Indicator Suite</h3>
          <div className="space-y-2">
            {(['Ensemble', 'MACD', 'RSI'] as Indicator[]).map((i) => (
              <label key={i} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <input 
                  type="radio" 
                  name="indicator" 
                  value={i} 
                  checked={indicator === i} 
                  onChange={() => setIndicator(i)}
                  className="w-4 h-4 text-primary bg-background border-input focus:ring-primary focus:ring-2 cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground">{i}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Parameters</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={commission} 
              onChange={(e) => setCommission(e.target.checked)}
              className="w-4 h-4 rounded text-primary bg-background border-input focus:ring-primary"
            />
            <span className="text-sm">Apply Commission (1%)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showBH} 
              onChange={(e) => setShowBH(e.target.checked)}
              className="w-4 h-4 rounded text-primary bg-background border-input focus:ring-primary"
            />
            <span className="text-sm">Show Buy & Hold</span>
          </label>
        </div>
      </div>
      
      <div className="p-4 border-t bg-muted/30">
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md flex items-start space-x-2">
          <Info className="flex-shrink-0 text-primary mt-0.5" size={16} />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground block mb-1">{algo} + {indicator}</strong>
            Based on 753 trading days vs Buy & Hold strategy (2021-2023).
          </div>
        </div>
      </div>
    </aside>
  );
}
