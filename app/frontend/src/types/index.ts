export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface ModelConfig {
  name: string;
  provider: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface ModelItem {
  name: string;
  provider: string;
  description?: string;
}

export interface Position {
  ticker: string;
  shares: number;
  value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export interface Portfolio {
  total_value: number;
  cash: number;
  positions: Position[];
  performance: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
  };
}

export interface BacktestConfig {
  tickers: string[];
  initial_capital: number;
  initial_cash: number;
  start_date: string;
  end_date: string;
  margin_requirement: number;
  show_reasoning: boolean;
  use_ollama?: boolean;
}

export interface BacktestResult {
  portfolio: Portfolio;
  trades: any[];
  metrics: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
  };
}

export interface HedgeFundConfig {
  tickers: string[];
  selected_agents: string[];
  model_name?: string;
  model_provider?: string;
  initial_cash: number;
  margin_requirement: number;
  show_reasoning: boolean;
}

export interface HedgeFundStatus {
  is_running: boolean;
  current_positions: Record<string, number>;
  cash_balance: number;
  total_value: number;
  last_update: string;
}

export interface AgentSignal {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
  analysis?: {
    [key: string]: any;
  };
}

export interface TradingDecision {
  action: 'buy' | 'sell' | 'short' | 'cover' | 'hold';
  quantity: number;
  reasoning?: string;
}

export interface TradingResult {
  decisions: Record<string, string>;
  analyst_signals: Record<string, string>;
} 