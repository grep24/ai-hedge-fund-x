import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, message, Card, Statistic, Table, Row, Col } from 'antd';
import { ModelSelector } from './ModelSelector';
import type { HedgeFundConfig, HedgeFundStatus, ModelConfig, Position } from '../types';
import { tradingApi } from '../services/api';

interface HedgeFundControlProps {
  onStatusUpdate: (status: HedgeFundStatus) => void;
}

export const HedgeFundControl: React.FC<HedgeFundControlProps> = ({ onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleStart = async (values: any) => {
    try {
      setLoading(true);
      const config: HedgeFundConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        initial_cash: values.initialCash,
        model_config: values.model,
      };

      const status = await tradingApi.startHedgeFund(config);
      onStatusUpdate(status);
      message.success('对冲基金启动成功！');
    } catch (error) {
      console.error('启动失败:', error);
      message.error('启动失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await tradingApi.stopHedgeFund();
      message.success('对冲基金已停止');
    } catch (error) {
      console.error('停止失败:', error);
      message.error('停止失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        form={form}
        onFinish={handleStart}
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
          <Button.Group style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '50%' }}>
              启动
            </Button>
            <Button danger onClick={handleStop} loading={loading} style={{ width: '50%' }}>
              停止
            </Button>
          </Button.Group>
        </Form.Item>
      </Form>
    </div>
  );
};

interface HedgeFundStatusDisplayProps {
  status: HedgeFundStatus;
}

export const HedgeFundStatusDisplay: React.FC<HedgeFundStatusDisplayProps> = ({ status }) => {
  const columns = [
    {
      title: '股票',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: '持仓数量',
      dataIndex: 'shares',
      key: 'shares',
    },
    {
      title: '当前价格',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: '市值',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: '未实现盈亏',
      dataIndex: 'unrealized_pnl',
      key: 'unrealized_pnl',
      render: (pnl: number) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#f5222d' }}>
          ${pnl.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <Statistic
              title="投资组合总值"
              value={status.portfolio_value}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="可用现金"
              value={status.cash}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      <Card title="持仓明细" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={status.positions}
          rowKey="ticker"
          pagination={false}
        />
      </Card>
    </div>
  );
}; 