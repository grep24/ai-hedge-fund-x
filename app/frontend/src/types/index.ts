export interface ModelConfig {
  name: string;
  provider: string;
  description: string;
}

export interface BacktestConfig {
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_cash: number;
  margin_requirement: number;
  use_ollama?: boolean;
}

export interface BacktestResult {
  performance_metrics: {
    total_return: number;
    annualized_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
  };
  backtest_results: {
    trades: Array<{
      date: string;
      action: string;
      ticker: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface HedgeFundConfig {
  tickers: string[];
  selected_agents: string[];
  model_name: string;
  model_provider: string;
  initial_cash: number;
  margin_requirement: number;
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