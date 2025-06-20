import { useState } from 'react';
import { Tabs, Card } from 'antd';
import { TradingSimulator } from '@/components/TradingSimulator';
import { BacktestRunner } from '@/components/BacktestRunner';
import { HedgeFundRunner } from '@/components/HedgeFundRunner';
import { AgentStatusMonitor } from '@/components/AgentStatusMonitor';
import type { TradingResult, BacktestResult } from '@/types';

const { TabPane } = Tabs;

export default function Home() {
  const [backtestResult] = useState<BacktestResult | null>(null);
  const [tradingResult, setTradingResult] = useState<any>(null);

  const handleTradingComplete = (result: TradingResult) => {
    setTradingResult(result);
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
                  <BacktestRunner />
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
                    <h3 className="text-lg font-semibold mb-2">绩效指标</h3>
                    <ul className="list-disc list-inside">
                      <li>总收益率: {(backtestResult.metrics.total_return * 100).toFixed(2)}%</li>
                      <li>夏普比率: {backtestResult.metrics.sharpe_ratio.toFixed(2)}</li>
                      <li>最大回撤: {(backtestResult.metrics.max_drawdown * 100).toFixed(2)}%</li>
                      <li>胜率: {(backtestResult.metrics.win_rate * 100).toFixed(2)}%</li>
                      <li>盈亏比: {backtestResult.metrics.profit_factor.toFixed(2)}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">最近交易</h3>
                    <ul className="list-disc list-inside">
                      {backtestResult.trades.slice(-5).map((trade: any, index: any) => (
                        <li key={index}>
                          {trade.date}: {trade.action} {trade.shares} 股 {trade.ticker} @ ${trade.price.toFixed(2)}
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
} 