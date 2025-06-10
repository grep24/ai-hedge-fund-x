import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { TradingSimulator } from '@/components/TradingSimulator';
import { BacktestRunner } from '@/components/BacktestRunner';
import { HedgeFundRunner } from '@/components/HedgeFundRunner';
import { AgentStatusMonitor } from '@/components/AgentStatusMonitor';
import type { TradingResult, BacktestResult } from '@/types';

const { TabPane } = Tabs;

export const Home: React.FC = () => {
  const [tradingResult, setTradingResult] = useState<TradingResult | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  const handleTradingComplete = (result: TradingResult) => {
    setTradingResult(result);
  };

  const handleBacktestComplete = (result: BacktestResult) => {
    setBacktestResult(result);
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AI对冲基金</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧面板 - 交易控制 */}
          <div className="lg:col-span-2">
            <Card className="mb-4">
              <Tabs defaultActiveKey="simulate">
                <TabPane tab="模拟交易" key="simulate">
                  <TradingSimulator onComplete={handleTradingComplete} />
                </TabPane>
                <TabPane tab="策略回测" key="backtest">
                  <BacktestRunner onComplete={handleBacktestComplete} />
                </TabPane>
                <TabPane tab="对冲基金" key="hedge-fund">
                  <HedgeFundRunner onComplete={handleTradingComplete} />
                </TabPane>
              </Tabs>
            </Card>

            {/* 结果展示 */}
            {tradingResult && (
              <Card title="交易结果" className="mb-4">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(tradingResult, null, 2)}
                </pre>
              </Card>
            )}

            {backtestResult && (
              <Card title="回测结果" className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">性能指标</h3>
                    <ul>
                      <li>总收益率: {(backtestResult.performance_metrics.total_return * 100).toFixed(2)}%</li>
                      <li>年化收益率: {(backtestResult.performance_metrics.annualized_return * 100).toFixed(2)}%</li>
                      <li>夏普比率: {backtestResult.performance_metrics.sharpe_ratio.toFixed(2)}</li>
                      <li>最大回撤: {(backtestResult.performance_metrics.max_drawdown * 100).toFixed(2)}%</li>
                      <li>胜率: {(backtestResult.performance_metrics.win_rate * 100).toFixed(2)}%</li>
                      <li>盈亏比: {backtestResult.performance_metrics.profit_factor.toFixed(2)}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">最近交易</h3>
                    <ul>
                      {backtestResult.backtest_results.trades.slice(-5).map((trade, index) => (
                        <li key={index}>
                          {trade.date}: {trade.action} {trade.ticker} x{trade.quantity} @${trade.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* 右侧面板 - 代理状态监控 */}
          <div className="lg:col-span-1">
            <Card title="代理状态" className="sticky top-4">
              <AgentStatusMonitor />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 