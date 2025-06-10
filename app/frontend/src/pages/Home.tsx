import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { BacktestForm } from '../components/BacktestForm';
import { BacktestResults } from '../components/BacktestResults';
import { HedgeFundControl, HedgeFundStatusDisplay } from '../components/HedgeFundControl';
import type { BacktestResult, HedgeFundStatus } from '../types';

const { TabPane } = Tabs;

export const Home: React.FC = () => {
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [hedgeFundStatus, setHedgeFundStatus] = useState<HedgeFundStatus | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>AI 对冲基金</h1>
      
      <Tabs defaultActiveKey="backtest">
        <TabPane tab="回测" key="backtest">
          <Card>
            <BacktestForm onSuccess={setBacktestResult} />
          </Card>
          {backtestResult && (
            <div style={{ marginTop: 24 }}>
              <BacktestResults result={backtestResult} />
            </div>
          )}
        </TabPane>
        
        <TabPane tab="实时交易" key="live">
          <Card>
            <HedgeFundControl onStatusUpdate={setHedgeFundStatus} />
          </Card>
          {hedgeFundStatus && (
            <div style={{ marginTop: 24 }}>
              <HedgeFundStatusDisplay status={hedgeFundStatus} />
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}; 