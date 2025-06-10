import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { agents, type AgentItem } from '@/data/agents';

interface AgentSelectorProps {
  value: AgentItem[];
  onChange?: (value: AgentItem[]) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ value = [], onChange }) => {
  const [open, setOpen] = React.useState(false);
  const selectedAgents = value.map(agent => agent.key);

  const handleSelect = (agentKey: string) => {
    const agent = agents.find(a => a.key === agentKey);
    if (!agent) return;

    let newValue: AgentItem[];
    if (selectedAgents.includes(agentKey)) {
      newValue = value.filter(a => a.key !== agentKey);
    } else {
      newValue = [...value, agent];
    }
    onChange?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="text-subtitle">
            {value.length > 0
              ? `已选择 ${value.length} 个分析师`
              : "选择AI分析师"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0">
        <Command>
          <CommandInput placeholder="搜索分析师..." className="h-9" />
          <CommandList>
            <CommandEmpty>没有找到匹配的分析师。</CommandEmpty>
            <CommandGroup>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.key}
                  value={agent.key}
                  onSelect={handleSelect}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-title">{agent.display_name}</span>
                    {agent.description && (
                      <span className="text-subtitle text-muted-foreground">{agent.description}</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedAgents.includes(agent.key) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 