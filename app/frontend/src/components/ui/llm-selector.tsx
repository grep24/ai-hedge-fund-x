import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

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
import { apiModels, type ModelItem } from "@/data/models"

interface ModelSelectorProps {
  value: ModelItem | null;
  onChange: (item: ModelItem | null) => void;
  placeholder?: string;
}

export function ModelSelector({ 
  value, 
  onChange, 
  placeholder = "选择LLM模型..." 
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)

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
            {value
              ? value.display_name
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0">
        <Command>
          <CommandInput placeholder="搜索模型..." className="h-9" />
          <CommandList>
            <CommandEmpty>没有找到匹配的模型。</CommandEmpty>
            <CommandGroup>
              {apiModels.map((model) => (
                <CommandItem
                  key={model.model_name}
                  value={model.model_name}
                  onSelect={(currentValue) => {
                    if (currentValue === value?.model_name) {
                      onChange(null);
                    } else {
                      const selectedModel = apiModels.find(m => m.model_name === currentValue);
                      if (selectedModel) {
                        onChange(selectedModel);
                      }
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-title">{model.display_name}</span>
                    <span className="text-subtitle text-muted-foreground">{model.provider}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      value?.model_name === model.model_name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 