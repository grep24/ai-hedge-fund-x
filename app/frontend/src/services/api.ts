import { OutputNodeData, useNodeContext, NodeStatus } from '@/contexts/node-context';
import { ModelProvider } from '@/services/types';
import axios from 'axios';
import type { BacktestConfig, HedgeFundConfig, HedgeFundStatus, ModelConfig } from '../types';

interface AgentModelConfig {
  agent_id: string;
  model_name?: string;
  model_provider?: ModelProvider;
}

interface HedgeFundRequest {
  tickers: string[];
  selected_agents: string[];
  agent_models?: AgentModelConfig[];
  end_date?: string;
  start_date?: string;
  model_name?: string; // Keep for backwards compatibility, will be removed later
  model_provider?: ModelProvider; // Keep for backwards compatibility, will be removed later
  initial_cash?: number;
  margin_requirement?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: '/api',
});

export interface TradingEvent {
  agent: string;
  ticker: string | null;
  status: string;
  message?: string;
  analysis?: string;
  timestamp: string;
}

export interface EventSourceCallback {
  (event: TradingEvent): void;
}

export const tradingApi = {
  getAvailableModels: async (): Promise<ModelConfig[]> => {
    const response = await apiClient.get('/trading/models');
    return response.data;
  },

  simulateTrading: async (config: { tickers: string[]; show_reasoning: boolean }, onEvent: EventSourceCallback): Promise<EventSource> => {
    const params = new URLSearchParams({
      tickers: config.tickers.join(','),
      show_reasoning: String(config.show_reasoning),
    });

    const eventSource = new EventSource(`${API_BASE_URL}/api/trading/simulate?${params}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return eventSource;
  },

  runBacktest: async (config: BacktestConfig, onEvent: EventSourceCallback): Promise<EventSource> => {
    const params = new URLSearchParams({
      tickers: config.tickers.join(','),
      start_date: config.start_date,
      end_date: config.end_date,
      initial_cash: String(config.initial_cash),
      margin_requirement: String(config.margin_requirement),
      use_ollama: String(config.use_ollama || false),
    });

    const eventSource = new EventSource(`${API_BASE_URL}/api/trading/backtest?${params}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return eventSource;
  },

  runHedgeFund: async (config: HedgeFundConfig, onEvent: EventSourceCallback): Promise<() => void> => {
    const controller = new AbortController();
    const { signal } = controller;
    const response = await fetch(`${API_BASE_URL}/api/hedge-fund/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const eventText of events) {
            if (!eventText.trim()) continue;
            try {
              const eventTypeMatch = eventText.match(/^event: (.+)$/m);
              const dataMatch = eventText.match(/^data: (.+)$/m);
              if (eventTypeMatch && dataMatch) {
                const eventType = eventTypeMatch[1];
                const eventData = JSON.parse(dataMatch[1]);
                if (eventType === 'progress' || eventType === 'complete' || eventType === 'error') {
                  onEvent(eventData);
                }
              }
            } catch (err) {
              console.error('Error parsing SSE event:', err, 'Raw event:', eventText);
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error reading SSE stream:', error);
        }
      }
    })();
    return () => controller.abort();
  },

  getHedgeFundStatus: async (): Promise<HedgeFundStatus> => {
    const response = await apiClient.get('/trading/status');
    return response.data;
  },

  stopHedgeFund: async (): Promise<void> => {
    await apiClient.post('/trading/stop');
  }
};

export const api = {
  /**
   * Runs a hedge fund simulation with the given parameters and streams the results
   * @param params The hedge fund request parameters
   * @param nodeContext Node context for updating node states
   * @returns A function to abort the SSE connection
   */
  runHedgeFund: (
    params: HedgeFundRequest, 
    nodeContext: ReturnType<typeof useNodeContext>
  ): (() => void) => {
    // Convert tickers string to array if needed
    if (typeof params.tickers === 'string') {
      params.tickers = (params.tickers as unknown as string).split(',').map(t => t.trim());
    }

    // For SSE connections with FastAPI, we need to use POST
    // First, create the controller
    const controller = new AbortController();
    const { signal } = controller;

    // Make a POST request with the JSON body
    fetch(`${API_BASE_URL}/api/hedge-fund/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
            
      // Process the response as a stream of SSE events
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Function to process the stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process any complete events in the buffer (separated by double newlines)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep last partial event in buffer
            
            for (const eventText of events) {
              if (!eventText.trim()) continue;
                            
              try {
                // Parse the event type and data from the SSE format
                const eventTypeMatch = eventText.match(/^event: (.+)$/m);
                const dataMatch = eventText.match(/^data: (.+)$/m);
                
                if (eventTypeMatch && dataMatch) {
                  const eventType = eventTypeMatch[1];
                  const eventData = JSON.parse(dataMatch[1]);
                  
                  console.log(`Parsed ${eventType} event:`, eventData);
                  
                  // Process based on event type
                  switch (eventType) {
                    case 'start':
                      // Reset all nodes at the start of a new run
                      nodeContext.resetAllNodes();
                      break;
                    case 'progress':
                      if (eventData.agent) {
                        // Map the progress to a node status
                        let nodeStatus: NodeStatus = 'IN_PROGRESS';
                        if (eventData.status === 'Done') {
                          nodeStatus = 'COMPLETE';
                        }
                        // Use the agent name as the node ID
                        const agentId = eventData.agent.replace('_agent', '');
                        
                        // Use the enhanced API to update both status and additional data
                        nodeContext.updateAgentNode(agentId, {
                          status: nodeStatus,
                          ticker: eventData.ticker,
                          message: eventData.status,
                          analysis: eventData.analysis,
                          timestamp: eventData.timestamp
                        });
                      }
                      break;
                    case 'complete':
                      // Store the complete event data in the node context
                      if (eventData.data) {
                        nodeContext.setOutputNodeData(eventData.data as OutputNodeData);
                      }
                      // Mark all agents as complete when the whole process is done
                      nodeContext.updateAgentNodes(params.selected_agents || [], 'COMPLETE');
                      // Also update the output node
                      nodeContext.updateAgentNode('output', {
                        status: 'COMPLETE',
                        message: 'Analysis complete',
                        ticker: null,
                        analysis: null
                      });
                      break;
                    case 'error':
                      // Mark all agents as error when there's an error
                      nodeContext.updateAgentNodes(params.selected_agents || [], 'ERROR');
                      break;
                    default:
                      console.warn('Unknown event type:', eventType);
                  }
                }
              } catch (err) {
                console.error('Error parsing SSE event:', err, 'Raw event:', eventText);
              }
            }
          }
        } catch (error: any) { // Type assertion for error
          if (error.name !== 'AbortError') {
            console.error('Error reading SSE stream:', error);
            // Mark all agents as error when there's a connection error
            const agentIds = params.selected_agents || [];
            nodeContext.updateAgentNodes(agentIds, 'ERROR');
          }
        }
      };
      
      // Start processing the stream
      processStream();
    })
    .catch((error: any) => { // Type assertion for error
      if (error.name !== 'AbortError') {
        console.error('SSE connection error:', error);
        // Mark all agents as error when there's a connection error
        const agentIds = params.selected_agents || [];
        nodeContext.updateAgentNodes(agentIds, 'ERROR');
      }
    });

    // Return abort function
    return () => {
      controller.abort();
    };
  },
}; 