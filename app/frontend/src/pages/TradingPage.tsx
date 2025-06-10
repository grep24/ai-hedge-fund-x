import { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Flow } from "@/components/Flow";
import { AgentSelector } from "@/components/AgentSelector";
import { HedgeFundRunner } from "@/components/HedgeFundRunner";
import { AgentStatusMonitor } from "@/components/AgentStatusMonitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalystSignal {
  name: string;
  reasoning: string;
  score: number;
  recommendation: string;
}

interface TradingResult {
  decisions: {
    portfolio: any;
    trades: any[];
  };
  analyst_signals: {
    [key: string]: AnalystSignal;
  };
}

export default function TradingPage() {
  const [tickers, setTickers] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/trading/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers: tickers.split(',').map(t => t.trim()),
          show_reasoning: true,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('buy')) return 'text-green-600';
    if (recommendation.toLowerCase().includes('hold')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI 对冲基金分析系统</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tickers" className="text-lg">输入股票代码（用逗号分隔）</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="tickers"
                value={tickers}
                onChange={(e) => setTickers(e.target.value)}
                placeholder="例如：AAPL,MSFT,NVDA"
                className="flex-1"
              />
              <Button
                onClick={handleAnalyze}
                disabled={loading || !tickers}
                className="min-w-[120px]"
              >
                {loading ? '分析中...' : '开始分析'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          {/* 分析师信号部分 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">分析师分析结果</h2>
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.analyst_signals).map(([name, signal]) => (
                  <Card key={name} className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">评分：</span>
                        <span className={`font-bold ${getScoreColor(signal.score)}`}>
                          {signal.score}/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">建议：</span>
                        <span className={`font-bold ${getRecommendationColor(signal.recommendation)}`}>
                          {signal.recommendation}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">分析理由：</span>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                          {signal.reasoning}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* 最终决策部分 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">最终投资决策</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">投资组合</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(result.decisions.portfolio, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">交易建议</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(result.decisions.trades, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 