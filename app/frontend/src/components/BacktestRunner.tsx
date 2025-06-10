import React, { useState } from 'react';
import { Card, Form, Input, Button, DatePicker, InputNumber, Space, Alert, Spin } from 'antd';
import { tradingApi } from '@/services/api';
import moment from 'dayjs';
import type { BacktestConfig } from '@/types';

const { RangePicker } = DatePicker;

export const BacktestRunner: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async (values: any) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const config: BacktestConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        initial_capital: values.initialCash,
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement / 100,
        show_reasoning: true,
        use_ollama: false
      };

      const eventSource = await tradingApi.runBacktest(config, (event) => {
        if (event.status === 'complete') {
          setLoading(false);
        }
        setResults(prev => [...prev, `${event.timestamp} - ${event.agent}: ${event.status}`]);
      });

      // Clean up on unmount
      return () => {
        eventSource.close();
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <Card title="Backtest Runner">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleRunBacktest}
      >
        <Form.Item
          name="tickers"
          label="Tickers"
          rules={[{ required: true, message: 'Please enter at least one ticker' }]}
        >
          <Input placeholder="AAPL, GOOGL, TSLA" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Date Range"
          rules={[{ required: true, message: 'Please select date range' }]}
          initialValue={[moment().subtract(1, 'year'), moment()]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="initialCash"
          label="Initial Cash"
          rules={[{ required: true, message: 'Please enter initial cash' }]}
          initialValue={100000}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1000}
            max={10000000}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="marginRequirement"
          label="Margin Requirement (%)"
          rules={[{ required: true, message: 'Please enter margin requirement' }]}
          initialValue={100}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={100}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Run Backtest
          </Button>
        </Form.Item>
      </Form>

      {error && (
        <Alert message={error} type="error" closable style={{ marginTop: 16 }} />
      )}

      {results.length > 0 && (
        <Card title="Results" style={{ marginTop: 16 }}>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {results.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        </Card>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Spin tip="Running backtest..." />
        </div>
      )}
    </Card>
  );
}; 