import React from 'react';
import { List, Tag, Tooltip, Space } from 'antd';
import { useNodeContext } from '@/contexts/node-context';
import { getAgentByKey } from '@/data/agents';

export const AgentStatusMonitor: React.FC = () => {
  const { agentNodeData } = useNodeContext();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'in_progress':
        return 'processing';
      case 'done':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderAgentStatus = (nodeId: string) => {
    const nodeData = agentNodeData[nodeId];
    if (!nodeData) return null;

    const agent = getAgentByKey(nodeId);
    if (!agent) return null;

    return (
      <List.Item>
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <Space>
              <span className="font-medium">{agent.display_name}</span>
              <Tag color={getStatusColor(nodeData.status)}>
                {nodeData.status.toLowerCase().replace(/_/g, ' ')}
              </Tag>
            </Space>
            {nodeData.ticker && (
              <Tag color="blue">{nodeData.ticker}</Tag>
            )}
          </div>
          
          {nodeData.message && (
            <div className="text-sm text-gray-500">
              {nodeData.message}
            </div>
          )}

          {nodeData.analysis && (
            <Tooltip title="点击查看详细分析">
              <div 
                className="text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600"
                onClick={() => {
                  // TODO: 实现查看详细分析的功能
                }}
              >
                查看分析 →
              </div>
            </Tooltip>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <List
      className="agent-status-list"
      dataSource={Object.keys(agentNodeData)}
      renderItem={renderAgentStatus}
      locale={{ emptyText: '暂无代理运行' }}
    />
  );
}; 