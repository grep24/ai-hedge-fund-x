import React from 'react';
import { Card, Statistic, Table, Row, Col } from 'antd';
import { Line } from '@ant-design/charts';
import type { BacktestResult, Trade } from '../types';

interface BacktestResultsProps {
  result: BacktestResult;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ result }) => {
  const portfolioData = result.dates.map((date, index) => ({
    date,
    value: result.portfolio_value[index],
  }));

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
      render: (action: string) => (
        <span style={{ color: action === 'BUY' ? '#52c41a' : '#f5222d' }}>
          {action === 'BUY' ? '买入' : '卖出'}
        </span>
      ),
    },
    {
      title: '股数',
      dataIndex: 'shares',
      key: 'shares',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: '总额',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: '原因',
      dataIndex: 'reasoning',
      key: 'reasoning',
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收益率"
              value={result.total_return * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: result.total_return >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="夏普比率"
              value={result.sharpe_ratio}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最大回撤"
              value={result.max_drawdown * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交易次数"
              value={result.trades.length}
            />
          </Card>
        </Col>
      </Row>

      <Card title="投资组合价值" style={{ marginTop: 16 }}>
        <Line
          data={portfolioData}
          xField="date"
          yField="value"
          point={{
            size: 2,
            shape: 'diamond',
          }}
          tooltip={{
            formatter: (datum) => {
              return {
                name: '投资组合价值',
                value: `$${datum.value.toFixed(2)}`,
              };
            },
          }}
        />
      </Card>

      <Card title="交易记录" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={result.trades}
          rowKey={(record, index) => index.toString()}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
}; 