export type Algo = "PPO" | "DQN" | "A2C";
export type Indicator = "Ensemble" | "MACD" | "RSI";

export function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const BASE_METRICS = {
  PPO: { cr: 68.4, sr: 1.34, psr: 0.91, mdd: -12.3 },
  DQN: { cr: 55.6, sr: 1.08, psr: 0.79, mdd: -15.9 },
  A2C: { cr: 46.8, sr: 0.95, psr: 0.71, mdd: -18.1 },
};

const BH_METRICS = { cr: 41.2, sr: 0.82, psr: 0.61, mdd: -28.7 };

const indicatorMultipliers = {
  Ensemble: 1.0,
  MACD: 0.85,
  RSI: 0.75,
};

export function getMetrics(algo: Algo, indicator: Indicator) {
  const base = BASE_METRICS[algo];
  const mult = indicatorMultipliers[indicator];
  return {
    cr: Number((base.cr * mult).toFixed(1)),
    sr: Number((base.sr * mult).toFixed(2)),
    psr: Number((base.psr * mult).toFixed(2)),
    mdd: Number((base.mdd * (2 - mult)).toFixed(1)), // drawdowns get worse if less than 1.0
  };
}

export const bhMetrics = BH_METRICS;

export function getPortfolio(algo: Algo, indicator: Indicator, n = 753) {
  const data = [];
  let agentValue = 1.0;
  let bhValue = 1.0;
  let seed = algo.length * 100 + indicator.length * 10;
  
  const targetMetrics = getMetrics(algo, indicator);
  // We want to end up roughly at (1 + cr/100)
  const agentDailyDrift = (targetMetrics.cr / 100) / n;
  const bhDailyDrift = (BH_METRICS.cr / 100) / n;

  let currentDate = new Date(2021, 0, 1);
  
  for (let i = 0; i < n; i++) {
    // Generate dates (Business days)
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Noise
    const agentNoise = (seededRandom(seed++) - 0.5) * 0.02;
    const bhNoise = (seededRandom(seed++) - 0.5) * 0.025;
    
    agentValue = agentValue * (1 + agentDailyDrift + agentNoise);
    bhValue = bhValue * (1 + bhDailyDrift + bhNoise);
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      agent: Number(agentValue.toFixed(4)),
      bh: Number(bhValue.toFixed(4)),
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
}

export function getTradeSignals(algo: Algo, indicator: Indicator, n = 753) {
  const signals = [];
  let seed = algo.length * 200 + indicator.length * 20;
  let currentDate = new Date(2021, 0, 1);
  let rsi = 50;
  let price = 100;
  let macd = 0;
  
  for (let i = 0; i < n; i++) {
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    price = price * (1 + (seededRandom(seed++) - 0.5) * 0.03);
    rsi = Math.max(10, Math.min(90, rsi + (seededRandom(seed++) - 0.5) * 20));
    macd = macd + (seededRandom(seed++) - 0.5) * 2;
    const signalLine = macd - (seededRandom(seed++) - 0.5);
    const histogram = macd - signalLine;
    
    let action = "HOLD";
    const actionRand = seededRandom(seed++);
    if (actionRand > 0.8) action = "BUY";
    else if (actionRand < 0.2) action = "SELL";
    
    let pnl = 0;
    if (action !== "HOLD") {
      pnl = Number(((seededRandom(seed++) - 0.4) * 5).toFixed(2));
    }
    
    signals.push({
      date: currentDate.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      rsi: Number(rsi.toFixed(1)),
      macd: Number(macd.toFixed(2)),
      signal: Number(signalLine.toFixed(2)),
      histogram: Number(histogram.toFixed(2)),
      action,
      pnl,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return signals;
}

export function getMonthlyReturns(algo: Algo) {
  const years = [2021, 2022, 2023];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let seed = algo.length * 50;
  const metrics = BASE_METRICS[algo];
  
  return years.map(year => {
    const monthData: Record<string, any> = { year: year.toString() };
    months.forEach(month => {
      // Create returns that roughly average to the base metric
      monthData[month] = Number(((seededRandom(seed++) - 0.45) * 10).toFixed(1));
    });
    return monthData;
  });
}

export const allStrategies = [
  { rank: 1, algo: "PPO", indicator: "Ensemble", cr: 68.4, sharpe: 1.34, psr: 0.91, mdd: -12.3, vsBH: "+27.2%", winner: "🏆 BEST" },
  { rank: 2, algo: "DQN", indicator: "Ensemble", cr: 55.6, sharpe: 1.08, psr: 0.79, mdd: -15.9, vsBH: "+14.4%", winner: "✓" },
  { rank: 3, algo: "PPO", indicator: "MACD", cr: 58.1, sharpe: 1.14, psr: 0.85, mdd: -14.1, vsBH: "+16.9%", winner: "✓" },
  { rank: 4, algo: "PPO", indicator: "RSI", cr: 51.3, sharpe: 1.01, psr: 0.78, mdd: -16.8, vsBH: "+10.1%", winner: "✓" },
  { rank: 5, algo: "A2C", indicator: "Ensemble", cr: 46.8, sharpe: 0.95, psr: 0.71, mdd: -18.1, vsBH: "+5.6%", winner: "✓" },
  { rank: 6, algo: "DQN", indicator: "MACD", cr: 47.3, sharpe: 0.92, psr: 0.70, mdd: -19.5, vsBH: "+6.1%", winner: "✓" },
  { rank: 7, algo: "DQN", indicator: "RSI", cr: 41.7, sharpe: 0.81, psr: 0.62, mdd: -21.4, vsBH: "+0.5%", winner: "✗" },
  { rank: 8, algo: "A2C", indicator: "MACD", cr: 39.8, sharpe: 0.78, psr: 0.60, mdd: -22.3, vsBH: "-1.4%", winner: "✗" },
  { rank: 9, algo: "A2C", indicator: "RSI", cr: 35.1, sharpe: 0.69, psr: 0.52, mdd: -25.6, vsBH: "-6.1%", winner: "✗" },
];

export const riskReturnStrategies = allStrategies.map(s => {
  return {
    name: `${s.algo}+${s.indicator}`,
    risk: Number((Math.abs(s.mdd) / 100).toFixed(3)),
    return: s.cr,
    algo: s.algo
  };
});
