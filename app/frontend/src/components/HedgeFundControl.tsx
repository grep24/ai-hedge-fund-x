import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Card, Statistic, Table, Row, Col } from 'antd';
import { tradingApi } from '../services/api';
import type { HedgeFundConfig, HedgeFundStatus } from '../types';

export const HedgeFundControl: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<HedgeFundStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const currentStatus = await tradingApi.getHedgeFundStatus();
      setStatus(currentStatus);
      setIsRunning(currentStatus.is_running);
    } catch (error) {
      console.error('Failed to get status:', error);
    }
  };

  const handleStart = async (values: any) => {
    setLoading(true);
    try {
      const config: HedgeFundConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        selected_agents: ['agent1', 'agent2'], // You might want to make this configurable
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement / 100,
        show_reasoning: true,
      };
      
      const abort = await tradingApi.runHedgeFund(config, (event) => {
        console.log('Hedge fund event:', event);
        if (event.status === 'COMPLETE') {
          setIsRunning(false);
          checkStatus();
          abort();
        }
        if (event.status === 'ERROR') {
          message.error('运行对冲基金策略过程中发生错误');
          setIsRunning(false);
          checkStatus();
          abort();
        }
      });
      
      message.success('对冲基金已启动');
      setIsRunning(true);
      checkStatus();
    } catch (error) {
      console.error('Failed to start hedge fund:', error);
      message.error('启动对冲基金失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await tradingApi.stopHedgeFund();
      message.success('对冲基金已停止');
      setIsRunning(false);
      checkStatus();
    } catch (error) {
      console.error('Failed to stop hedge fund:', error);
      message.error('停止对冲基金失败');
    } finally {
      setLoading(false);
    }
  };

  const positionColumns = [
    {
      title: '股票',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: '持仓',
      dataIndex: 'shares',
      key: 'shares',
    },
    {
      title: '价值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Card title="对冲基金控制台" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          onFinish={handleStart}
          layout="vertical"
        >
          <Form.Item
            label="股票代码"
            name="tickers"
            rules={[{ required: true, message: '请输入股票代码' }]}
            help="多个股票代码请用逗号分隔"
          >
            <Input placeholder="AAPL,GOOGL,MSFT" disabled={isRunning} />
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
              disabled={isRunning}
            />
          </Form.Item>

          <Form.Item
            label="保证金要求 (%)"
            name="marginRequirement"
            rules={[{ required: true, message: '请输入保证金要求' }]}
            initialValue={100}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              disabled={isRunning}
            />
          </Form.Item>

          <Form.Item>
            {!isRunning ? (
              <Button type="primary" htmlType="submit" loading={loading} block>
                启动对冲基金
              </Button>
            ) : (
              <Button danger onClick={handleStop} loading={loading} block>
                停止对冲基金
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      {status && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="总价值"
                  value={status.total_value}
                  prefix="$"
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="现金余额"
                  value={status.cash_balance}
                  prefix="$"
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="持仓数量"
                  value={Object.keys(status.current_positions).length}
                />
              </Card>
            </Col>
          </Row>

          <Card title="当前持仓">
            <Table
              columns={positionColumns}
              dataSource={Object.entries(status.current_positions).map(([ticker, shares]) => ({
                ticker,
                shares,
                value: shares * 100, // You might want to get actual price
              }))}
              rowKey="ticker"
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
}; 