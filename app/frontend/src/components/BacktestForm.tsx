import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, message } from 'antd';
import { ModelSelector } from './ModelSelector';
import type { BacktestConfig, BacktestResult, ModelConfig } from '../types';
import { tradingApi } from '../services/api';

const { RangePicker } = DatePicker;

interface BacktestFormProps {
  onSuccess: (result: BacktestResult) => void;
}

export const BacktestForm: React.FC<BacktestFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const [startDate, endDate] = values.dateRange;
      
      const config: BacktestConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        initial_cash: values.initialCash,
        model_config: values.model,
      };

      const result = await tradingApi.runBacktest(config);
      onSuccess(result);
      message.success('回测完成！');
    } catch (error) {
      console.error('回测失败:', error);
      message.error('回测失败，请重试');
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
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          min={1000}
        />
      </Form.Item>

      <Form.Item
        name="model"
        rules={[{ required: true, message: '请选择模型' }]}
      >
        <ModelSelector />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          开始回测
        </Button>
      </Form.Item>
    </Form>
  );
}; 