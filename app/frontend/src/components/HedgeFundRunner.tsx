import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Alert, Spin, InputNumber, Select } from 'antd';
import { tradingApi } from '@/services/api';
import { useNodeContext, NodeStatus } from '@/contexts/node-context';
import type { ModelItem } from '@/data/models';
import type { AgentItem } from '@/data/agents';
import { apiModels, defaultModel } from '@/data/models';
import { AgentSelector } from '@/components/AgentSelector';
import type { HedgeFundConfig } from '@/types';

interface HedgeFundRunnerProps {
  onComplete?: (result: any) => void;
}

export const HedgeFundRunner: React.FC<HedgeFundRunnerProps> = ({ onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAgentNode } = useNodeContext();
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentItem[]>([]);

  const handleAgentChange = (agents: AgentItem[]) => {
    setSelectedAgents(agents);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const config: HedgeFundConfig = {
        tickers: values.tickers.split(',').map((t: string) => t.trim()),
        selected_agents: selectedAgents.map(agent => agent.key),
        model_name: selectedModel?.model_name || defaultModel?.model_name || 'gpt-4o',
        model_provider: selectedModel?.provider || defaultModel?.provider || 'OpenAI',
        initial_cash: values.initialCash,
        margin_requirement: values.marginRequirement / 100,
        show_reasoning: true,
      };
      
      // 创建流式连接
      const abort = await tradingApi.runHedgeFund(config, (event) => {
        // 更新代理状态
        if (event.agent && event.status) {
          let nodeStatus: NodeStatus = 'IDLE';
          if (event.status === 'IN_PROGRESS') nodeStatus = 'IN_PROGRESS';
          else if (event.status === 'COMPLETE') nodeStatus = 'COMPLETE';
          else if (event.status === 'ERROR') nodeStatus = 'ERROR';
          updateAgentNode(event.agent, {
            status: nodeStatus,
            message: event.message || '',
            ticker: event.ticker || null,
            analysis: event.analysis || null,
            timestamp: event.timestamp,
          });
        }
        // 监听完成事件
        if (event.status === 'COMPLETE' && onComplete) {
          onComplete(event);
          setLoading(false);
          abort();
        }
        // 监听错误
        if (event.status === 'ERROR') {
          setError('运行对冲基金策略过程中发生错误');
          setLoading(false);
          abort();
        }
      });

    } catch (err) {
      setError('启动对冲基金策略失败');
      setLoading(false);
    }
  };

  return (
    <Card title="运行对冲基金策略" className="w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          tickers: 'AAPL,MSFT,GOOGL',
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
          name="model"
          label="Model"
          rules={[{ required: true, message: 'Please select a model' }]}
        >
          <Select
            value={selectedModel?.model_name}
            onChange={val => setSelectedModel(apiModels.find(m => m.model_name === val) || null)}
            placeholder="Select a model..."
            options={apiModels.map(m => ({
              label: `${m.display_name} (${m.provider})`,
              value: m.model_name
            }))}
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string).toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="选择AI分析师"
        >
          <AgentSelector
            value={selectedAgents}
            onChange={handleAgentChange}
          />
        </Form.Item>

        <Form.Item
          label="初始资金"
          name="initialCash"
          rules={[{ required: true, message: '请输入初始资金' }]}
        >
          <InputNumber<number>
            min={1000}
            max={10000000}
            step={1000}
            style={{ width: '100%' }}
            formatter={(value) => value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
            parser={(value) => {
              const parsed = value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 1000;
              return Math.max(1000, Math.min(10000000, parsed));
            }}
          />
        </Form.Item>

        <Form.Item
          label="保证金要求"
          name="marginRequirement"
          rules={[{ required: true, message: '请输入保证金要求' }]}
        >
          <InputNumber<number>
            min={0}
            max={1}
            step={0.1}
            style={{ width: '100%' }}
            formatter={(value) => value ? `${value * 100}%` : ''}
            parser={(value) => {
              const parsed = value ? Number(value.replace('%', '')) / 100 : 0;
              return Math.max(0, Math.min(1, parsed));
            }}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              启动策略
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
            <Spin tip="策略运行中..." />
          </div>
        )}
      </Form>
    </Card>
  );
}; 