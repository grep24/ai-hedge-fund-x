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
  models: ModelItem[];
  value: string;
  onChange: (model: ModelItem | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function ModelSelector({
  models,
  value,
  onChange,
  placeholder = "Select model...",
  searchPlaceholder = "Search models...",
  emptyText = "No model found.",
  className
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedModel = models.find(model => model.model_name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedModel
            ? `${selectedModel.display_name} (${selectedModel.provider})`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            {models.map((model) => (
              <CommandItem
                key={model.model_name}
                value={model.model_name}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? null : model);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === model.model_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {model.display_name} ({model.provider})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 