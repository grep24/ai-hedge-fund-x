import React, { useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Switch, Button, message, Spin } from 'antd';
import { Line } from '@ant-design/plots';
import axios from 'axios';
import dayjs from 'dayjs';

interface BacktestResult {
  backtest_results: {
    portfolio_values: number[];
    dates: string[];
  };
  performance_metrics: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
  };
}

const Home: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/trading/backtest', {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement,
        use_ollama: values.useOllama,
      });
      
      setResult(response.data);
      message.success('回测完成！');
    } catch (error) {
      message.error('回测失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card title="AI对冲基金回测系统" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            tickers: 'AAPL,MSFT,NVDA',
            dateRange: [dayjs().subtract(1, 'month'), dayjs()],
            initialCash: 100000,
            marginRequirement: 0,
            useOllama: false,
          }}
        >
          <Form.Item
            label="股票代码（用逗号分隔）"
            name="tickers"
            rules={[{ required: true, message: '请输入股票代码' }]}
          >
            <Input placeholder="例如：AAPL,MSFT,NVDA" />
          </Form.Item>

          <Form.Item
            label="回测时间范围"
            name="dateRange"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="初始资金"
            name="initialCash"
            rules={[{ required: true, message: '请输入初始资金' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="保证金要求"
            name="marginRequirement"
            rules={[{ required: true, message: '请输入保证金要求' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={1}
              step={0.1}
              formatter={(value) => `${value * 100}%`}
              parser={(value) => value!.replace('%', '') as any / 100}
            />
          </Form.Item>

          <Form.Item
            label="使用本地LLM"
            name="useOllama"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              开始回测
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>正在进行回测分析...</p>
          </div>
        </Card>
      )}

      {result && !loading && (
        <>
          <Card title="回测结果" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <h3>总收益率</h3>
                  <p style={{ 
                    fontSize: '24px',
                    color: result.performance_metrics.total_return >= 0 ? '#52c41a' : '#f5222d'
                  }}>
                    {(result.performance_metrics.total_return * 100).toFixed(2)}%
                  </p>
                </div>
              </Card>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <h3>夏普比率</h3>
                  <p style={{ fontSize: '24px' }}>
                    {result.performance_metrics.sharpe_ratio.toFixed(2)}
                  </p>
                </div>
              </Card>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <h3>最大回撤</h3>
                  <p style={{ fontSize: '24px', color: '#f5222d' }}>
                    {(result.performance_metrics.max_drawdown * 100).toFixed(2)}%
                  </p>
                </div>
              </Card>
            </div>
          </Card>

          <Card title="投资组合价值变化">
            <Line
              data={result.backtest_results.dates.map((date, index) => ({
                date,
                value: result.backtest_results.portfolio_values[index],
              }))}
              xField="date"
              yField="value"
              yAxis={{
                label: {
                  formatter: (v) => `$${Number(v).toLocaleString()}`,
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return {
                    name: '投资组合价值',
                    value: `$${datum.value.toLocaleString()}`,
                  };
                },
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default Home; 