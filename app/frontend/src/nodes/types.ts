import { MessageItem } from '@/contexts/node-context';
import type { Node } from 'reactflow';

export type NodeMessage = MessageItem;

// Custom node types
export type AgentNode = Node<{
  name?: string;
  description?: string;
  model?: string;
  messages: NodeMessage[];
}, 'agent-node'>;

export type PortfolioManagerNode = Node<{
  name?: string;
  description?: string;
  tickers?: string[];
  model?: string;
}, 'portfolio-manager-node'>;

export type TextOutputNode = Node<{
  name?: string;
  description?: string;
  output?: string;
}, 'text-output-node'>;

export type JsonOutputNode = Node<{
  name?: string;
  description?: string;
  output?: any;
}, 'json-output-node'>;

// Union of all custom node types
export type AppNode = AgentNode | PortfolioManagerNode | TextOutputNode | JsonOutputNode;
