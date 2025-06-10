import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Space, Alert, Spin } from 'antd';
import { tradingApi } from '@/services/api';
import { useNodeContext } from '@/contexts/node-context';

interface TradingSimulatorProps {
  onComplete?: (result: any) => void;
}

export const TradingSimulator: React.FC<TradingSimulatorProps> = ({ onComplete }) => {
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
      const eventSource = await tradingApi.simulateTrading({
        tickers,
        show_reasoning: values.showReasoning,
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
        setError('模拟交易过程中发生错误');
        setLoading(false);
        eventSource.close();
      });

    } catch (err) {
      setError('启动模拟交易失败');
      setLoading(false);
    }
  };

  return (
    <Card title="模拟交易" className="w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          tickers: 'AAPL,MSFT,GOOGL',
          showReasoning: true,
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
          label="显示推理过程"
          name="showReasoning"
        >
          <Select>
            <Select.Option value={true}>是</Select.Option>
            <Select.Option value={false}>否</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              开始模拟交易
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
            <Spin tip="模拟交易进行中..." />
          </div>
        )}
      </Form>
    </Card>
  );
}; 