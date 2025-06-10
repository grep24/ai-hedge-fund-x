import { type NodeProps } from 'reactflow';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardContent } from '@/components/ui/card';
import { ModelSelector } from '@/components/ui/llm-selector';
import { useNodeContext } from '@/contexts/node-context';
import { apiModels, ModelItem } from '@/data/models';
import { cn } from '@/lib/utils';
import { type AgentNode } from '../types';
import { getStatusColor } from '../utils';
import { AgentOutputDialog } from './agent-output-dialog';
import { NodeShell } from './node-shell';
import { Button } from '@/components/ui/button';

export function AgentNode({
  data,
  selected,
  id,
  isConnectable,
}: NodeProps<AgentNode>) {
  const { agentNodeData, setAgentModel, getAgentModel } = useNodeContext();
  const nodeData = agentNodeData[id] || { 
    status: 'IDLE', 
    ticker: null, 
    message: '', 
    messages: [],
    lastUpdated: 0
  };
  const status = nodeData.status;
  const isInProgress = status === 'IN_PROGRESS';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get the current model for this agent (null if using global model)
  const currentModel = getAgentModel(id);
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(currentModel);

  // Update the node context when the model changes
  useEffect(() => {
    if (selectedModel !== currentModel) {
      setAgentModel(id, selectedModel);
    }
  }, [selectedModel, id, setAgentModel, currentModel]);

  const handleModelChange = (model: ModelItem | null) => {
    setSelectedModel(model);
  };

  const handleUseGlobalModel = () => {
    setSelectedModel(null);
  };

  return (
    <NodeShell
      id={id}
      selected={selected}
      isConnectable={isConnectable}
      icon={<Bot className="h-5 w-5" />}
      iconColor={getStatusColor(status)}
      name={(data as any)?.name || "Agent"}
      description={(data as any)?.description}
      status={status}
      hasRightHandle={false}
    >
      <CardContent className="p-0">
        <div className="border-t border-border p-3">
          <div className="flex flex-col gap-2">
            <div className="text-subtitle text-muted-foreground flex items-center gap-1">
              Status
            </div>

            <div className={cn(
              "text-foreground text-xs rounded p-2",
              isInProgress ? "gradient-animation" : getStatusColor(status)
            )}>
              <span className="capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
            </div>
            
            {nodeData.message && (
              <div className="text-foreground text-subtitle">
                {nodeData.message}
                {nodeData.ticker && <span className="ml-1">({nodeData.ticker})</span>}
              </div>
            )}
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="!text-subtitle text-muted-foreground">
                  Advanced
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex flex-col gap-2">
                    <div className="text-subtitle text-muted-foreground flex items-center gap-1">
                      Model
                    </div>
                    <div className="mt-3">
                      <ModelSelector 
                        models={apiModels}
                        value={selectedModel?.model_name || ""}
                        onChange={handleModelChange}
                        placeholder="Use global model"
                      />
                      {selectedModel && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 p-0 h-auto"
                          onClick={handleUseGlobalModel}
                        >
                          Use global model
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <AgentOutputDialog 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          name={(data as any)?.name || "Agent"}
          nodeId={id}
        />
      </CardContent>
    </NodeShell>
  );
}
