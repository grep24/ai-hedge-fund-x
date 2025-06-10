import React from 'react';
import { Form, Input, DatePicker, InputNumber, Button, message } from 'antd';
import { tradingApi, EventSourceCallback } from '../services/api';
import type { BacktestConfig } from '../types';

const { RangePicker } = DatePicker;

interface BacktestFormProps {
  onSuccess: (eventSource: EventSource) => void;
}

export const BacktestForm: React.FC<BacktestFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const config: BacktestConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        initial_capital: values.initialCash,
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement / 100,
        show_reasoning: true,
      };
      
      const onEvent: EventSourceCallback = (event) => {
        console.log('Backtest event:', event);
      };
      
      const eventSource = await tradingApi.runBacktest(config, onEvent);
      onSuccess(eventSource);
      message.success('回测已开始');
    } catch (error) {
      console.error('Error starting backtest:', error);
      message.error('启动回测失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
    >
      <Form.Item
        label="股票代码"
        name="tickers"
        rules={[{ required: true, message: '请输入股票代码' }]}
        help="多个股票代码请用逗号分隔，例如：AAPL,GOOGL,MSFT"
      >
        <Input placeholder="AAPL,GOOGL,MSFT" />
      </Form.Item>

      <Form.Item
        label="回测时间范围"
        name="dateRange"
        rules={[{ required: true, message: '请选择回测时间范围' }]}
      >
        <RangePicker />
      </Form.Item>

      <Form.Item
        label="初始资金"
        name="initialCash"
        rules={[{ required: true, message: '请输入初始资金' }]}
        initialValue={100000}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={1000}
          prefix="$"
        />
      </Form.Item>

      <Form.Item
        label="保证金要求"
        name="marginRequirement"
        rules={[{ required: true, message: '请输入保证金要求' }]}
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
          开始回测
        </Button>
      </Form.Item>
    </Form>
  );
}; 