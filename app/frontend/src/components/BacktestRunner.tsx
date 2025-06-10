import React, { useState } from 'react';
import { Card, Form, Input, Button, DatePicker, InputNumber, Space, Alert, Spin } from 'antd';
import { tradingApi } from '@/services/api';
import { useNodeContext } from '@/contexts/node-context';
import dayjs from 'dayjs';

interface BacktestRunnerProps {
  onComplete?: (result: any) => void;
}

export const BacktestRunner: React.FC<BacktestRunnerProps> = ({ onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAgentNode } = useNodeContext();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const tickers = values.tickers.split(',').map((t: string) => t.trim());
      
      // 创建EventSource进行流式连接
      const eventSource = await tradingApi.runBacktest({
        tickers,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement,
        use_ollama: false,
      }, (event) => {
        // 更新代理状态
        if (event.agent && event.status) {
          updateAgentNode(event.agent, {
            status: event.status,
            message: event.message || '',
            ticker: event.ticker || null,
            analysis: event.analysis || null,
            timestamp: event.timestamp,
          });
        }
      });

      // 监听完成事件
      eventSource.addEventListener('complete', (event: any) => {
        const result = JSON.parse(event.data);
        if (onComplete) {
          onComplete(result);
        }
        setLoading(false);
        eventSource.close();
      });

      // 监听错误
      eventSource.addEventListener('error', (event: any) => {
        setError('回测过程中发生错误');
        setLoading(false);
        eventSource.close();
      });

    } catch (err) {
      setError('启动回测失败');
      setLoading(false);
    }
  };

  return (
    <Card title="策略回测" className="w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          tickers: 'AAPL,MSFT,GOOGL',
          dateRange: [dayjs().subtract(3, 'month'), dayjs()],
          initialCash: 100000,
          marginRequirement: 0,
        }}
      >
        <Form.Item
          label="股票代码"
          name="tickers"
          rules={[{ required: true, message: '请输入股票代码' }]}
        >
          <Input placeholder="输入股票代码,用逗号分隔 (例如: AAPL,MSFT,GOOGL)" />
        </Form.Item>

        <Form.Item
          label="回测时间范围"
          name="dateRange"
          rules={[{ required: true, message: '请选择回测时间范围' }]}
        >
          <DatePicker.RangePicker />
        </Form.Item>

        <Form.Item
          label="初始资金"
          name="initialCash"
          rules={[{ required: true, message: '请输入初始资金' }]}
        >
          <InputNumber
            min={1000}
            max={10000000}
            step={1000}
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="保证金要求"
          name="marginRequirement"
          rules={[{ required: true, message: '请输入保证金要求' }]}
        >
          <InputNumber
            min={0}
            max={1}
            step={0.1}
            style={{ width: '100%' }}
            formatter={value => `${value * 100}%`}
            parser={value => value!.replace('%', '') / 100}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              开始回测
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>

        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {loading && (
          <div className="text-center mt-4">
            <Spin tip="回测进行中..." />
          </div>
        )}
      </Form>
    </Card>
  );
}; 