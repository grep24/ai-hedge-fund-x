export interface ModelConfig {
  display_name: string;
  model_name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Groq' | 'DeepSeek' | 'Gemini' | 'Ollama';
}

export interface BacktestConfig {
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_cash: number;
  model_config: ModelConfig;
}

export interface BacktestResult {
  portfolio_value: number[];
  dates: string[];
  returns: number[];
  sharpe_ratio: number;
  max_drawdown: number;
  total_return: number;
  trades: Trade[];
}

export interface Trade {
  date: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  reasoning: string;
}

export interface HedgeFundConfig {
  tickers: string[];
  initial_cash: number;
  model_config: ModelConfig;
}

export interface HedgeFundStatus {
  portfolio_value: number;
  cash: number;
  positions: Position[];
  last_updated: string;
}

export interface Position {
  ticker: string;
  shares: number;
  current_price: number;
  total_value: number;
  unrealized_pnl: number;
} 