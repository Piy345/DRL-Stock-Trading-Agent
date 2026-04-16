import React, { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { LivePerformance } from '../components/tabs/LivePerformance';
import { TradeSignals } from '../components/tabs/TradeSignals';
import { RiskAnalytics } from '../components/tabs/RiskAnalytics';
import { StrategyInsights } from '../components/tabs/StrategyInsights';
import { getPortfolio, getMetrics, getTradeSignals, bhMetrics } from '../lib/mockData';
import type { Algo, Indicator } from '../lib/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Activity, Radio, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Index() {
  const [algo, setAlgo] = useState<Algo>("PPO");
  const [indicator, setIndicator] = useState<Indicator>("Ensemble");
  const [commission, setCommission] = useState(true);
  const [showBH, setShowBH] = useState(true);
  const [activeTab, setActiveTab] = useState("performance");

  const portfolio = useMemo(() => getPortfolio(algo, indicator), [algo, indicator]);
  const metrics = useMemo(() => getMetrics(algo, indicator), [algo, indicator]);
  const signals = useMemo(() => getTradeSignals(algo, indicator), [algo, indicator]);

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans">
      <Sidebar algo={algo} setAlgo={setAlgo} indicator={indicator} setIndicator={setIndicator} commission={commission} setCommission={setCommission} showBH={showBH} setShowBH={setShowBH} />
      
      <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
        <header className="mb-6 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🤖 DRL Stock Agent</h1>
            <p className="text-muted-foreground mt-1 text-sm">Automated trading using {algo} with {indicator} indicator suite</p>
          </div>
          <div className="text-right text-xs text-muted-foreground hidden lg:block">
            <span className="bg-muted px-2 py-1 rounded border">Live Environment (Simulated)</span>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex space-x-2 border-b border-border mb-6">
            <TabsTrigger value="performance" className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 hover:text-foreground flex items-center space-x-2 ${activeTab === 'performance' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
              <Activity size={16} /> <span>Live Performance</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 hover:text-foreground flex items-center space-x-2 ${activeTab === 'signals' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
              <Radio size={16} /> <span>Trade Signals</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 hover:text-foreground flex items-center space-x-2 ${activeTab === 'risk' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
              <AlertTriangle size={16} /> <span>Risk & Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 hover:text-foreground flex items-center space-x-2 ${activeTab === 'insights' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
              <TrendingUp size={16} /> <span>Strategy Insights</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="performance" className="focus:outline-none">
              <LivePerformance algo={algo} indicator={indicator} portfolio={portfolio} metrics={metrics} bh={bhMetrics} showBH={showBH} />
            </TabsContent>
            <TabsContent value="signals" className="focus:outline-none">
              <TradeSignals signals={signals} />
            </TabsContent>
            <TabsContent value="risk" className="focus:outline-none">
              <RiskAnalytics algo={algo} indicator={indicator} portfolio={portfolio} metrics={metrics} bh={bhMetrics} showBH={showBH} />
            </TabsContent>
            <TabsContent value="insights" className="focus:outline-none">
              <StrategyInsights />
            </TabsContent>
          </div>
        </Tabs>

        <footer className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground grid grid-cols-3 gap-4">
          <div>
            <strong className="text-foreground">Models Details:</strong> Proximal Policy Optimization (PPO), Deep Q-Network (DQN), Advantage Actor-Critic (A2C)
          </div>
          <div className="text-center">
            <strong className="text-foreground">Data Period:</strong> Jan 2021 - Dec 2023 (753 business days)
          </div>
          <div className="text-right">
            <strong className="text-foreground">Benchmark:</strong> Buy & Hold S&P 500 equivalent 
          </div>
        </footer>
      </main>
    </div>
  );
}
