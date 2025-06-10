import React, { createContext, useContext, useState } from 'react';
import { ModelItem } from '@/data/models';

// Export NodeStatus type from utils
export type NodeStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETE' | 'ERROR';

interface NodeUpdateData {
  status: NodeStatus;
  message: string;
  ticker?: string | null;
  analysis?: string | null;
  timestamp?: string;
}

// Message history item
export interface MessageItem {
  timestamp: string;
  message: string;
  ticker: string | null;
  analysis: Record<string, string>;
}

// Agent node state structure
export interface AgentNodeData {
  status: NodeStatus;
  ticker: string | null;
  message: string;
  lastUpdated: number;
  messages: MessageItem[];
  timestamp?: string;
  analysis: string | null;
}

// Data structure for the output node data (from complete event)
export interface OutputNodeData {
  decisions: Record<string, any>;
  analyst_signals: Record<string, any>;
}

// Default agent node state
const DEFAULT_AGENT_NODE_STATE: AgentNodeData = {
  status: 'IDLE',
  ticker: null,
  message: '',
  messages: [],
  lastUpdated: Date.now(),
  analysis: null,
};

interface NodeContextType {
  agentNodes: Record<string, NodeStatus>;
  agentNodeData: Record<string, AgentNodeData>;
  outputNodeData: OutputNodeData | null;
  agentModels: Record<string, ModelItem | null>;
  updateAgentNode: (agentId: string, updateData: NodeUpdateData) => void;
  updateAgentNodes: (nodeIds: string[], status: NodeStatus) => void;
  setOutputNodeData: (data: OutputNodeData) => void;
  setAgentModel: (nodeId: string, model: ModelItem | null) => void;
  getAgentModel: (nodeId: string) => ModelItem | null;
  getAllAgentModels: () => Record<string, ModelItem | null>;
  resetAllNodes: () => void;
  clearAgentNodes: () => void;
}

const NodeContext = createContext<NodeContextType>({
  agentNodes: {},
  agentNodeData: {},
  outputNodeData: null,
  agentModels: {},
  updateAgentNode: () => {},
  updateAgentNodes: () => {},
  setOutputNodeData: () => {},
  setAgentModel: () => {},
  getAgentModel: () => null,
  getAllAgentModels: () => ({}),
  resetAllNodes: () => {},
  clearAgentNodes: () => {},
});

export const useNodeContext = () => useContext(NodeContext);

export const NodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentNodes, setAgentNodes] = useState<Record<string, NodeStatus>>({});
  const [agentNodeData, setAgentNodeData] = useState<Record<string, AgentNodeData>>({});
  const [outputNodeData, setOutputNodeData] = useState<OutputNodeData | null>(null);
  const [agentModels, setAgentModels] = useState<Record<string, ModelItem | null>>({});

  const updateAgentNode = (agentId: string, updateData: NodeUpdateData) => {
    setAgentNodes((prev) => ({
      ...prev,
      [agentId]: updateData.status,
    }));
    
    // Also update the detailed agent node data
    setAgentNodeData(prev => ({
      ...prev,
      [agentId]: {
        ...(prev[agentId] || DEFAULT_AGENT_NODE_STATE),
        ...updateData,
        lastUpdated: Date.now()
      }
    }));
  };

  const updateAgentNodes = (nodeIds: string[], status: NodeStatus) => {
    if (nodeIds.length === 0) return;
    
    setAgentNodeData(prev => {
      const newStates = { ...prev };
      
      nodeIds.forEach(id => {
        newStates[id] = {
          ...(newStates[id] || { ...DEFAULT_AGENT_NODE_STATE }),
          status,
          lastUpdated: Date.now()
        };
      });
      
      return newStates;
    });
  };

  const setAgentModel = (nodeId: string, model: ModelItem | null) => {
    setAgentModels(prev => {
      if (model === null) {
        // Remove the agent model if setting to null
        const { [nodeId]: removed, ...rest } = prev;
        return rest;
      } else {
        // Set the agent model
        return {
          ...prev,
          [nodeId]: model
        };
      }
    });
  };

  const getAgentModel = (nodeId: string): ModelItem | null => {
    return agentModels[nodeId] || null;
  };

  const getAllAgentModels = (): Record<string, ModelItem | null> => {
    return agentModels;
  };

  const resetAllNodes = () => {
    setAgentNodeData({});
    setOutputNodeData(null);
    // Note: We don't reset agentModels here as users would want to keep their model selections
  };

  const clearAgentNodes = () => {
    setAgentNodes({});
  };

  return (
    <NodeContext.Provider value={{
      agentNodes,
      agentNodeData,
      outputNodeData,
      agentModels,
      updateAgentNode,
      updateAgentNodes,
      setOutputNodeData,
      setAgentModel,
      getAgentModel,
      getAllAgentModels,
      resetAllNodes,
      clearAgentNodes,
    }}>
      {children}
    </NodeContext.Provider>
  );
}; 