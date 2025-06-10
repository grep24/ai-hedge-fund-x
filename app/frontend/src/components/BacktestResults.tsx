import React from 'react';
import { Card, Statistic, Table, Row, Col } from 'antd';
import { Line } from '@ant-design/charts';
import type { BacktestResult } from '../types';

interface BacktestResultsProps {
  result: BacktestResult;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ result }) => {
  // Create portfolio value data for chart
  const portfolioData = result.trades.map((trade: any, index: number) => ({
    date: trade.date,
    value: trade.portfolio_value,
  }));

  const lineConfig = {
    data: portfolioData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    animation: false,
    xAxis: {
      type: 'time',
    },
    yAxis: {
      label: {
        formatter: (v: string) => {
          return `$${Number(v).toLocaleString()}`;
        },
      },
    },
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '股票',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总收益率"
              value={result.metrics.total_return * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: result.metrics.total_return >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="夏普比率"
              value={result.metrics.sharpe_ratio}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="最大回撤"
              value={result.metrics.max_drawdown * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="组合价值走势" style={{ marginBottom: 24 }}>
        <Line {...lineConfig} />
      </Card>

      <Card title="交易记录">
        <Table
          columns={columns}
          dataSource={result.trades}
          rowKey={(record: any, index) => index?.toString() || ''}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
}; 