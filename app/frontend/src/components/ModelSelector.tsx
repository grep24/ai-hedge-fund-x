import React, { useEffect, useState } from 'react';
import { Select, Form, Spin } from 'antd';
import type { ModelConfig } from '../types';
import { tradingApi } from '../services/api';

interface ModelSelectorProps {
  value?: ModelConfig;
  onChange?: (model: ModelConfig) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await tradingApi.getAvailableModels();
        setModels(availableModels);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return <Spin />;
  }

  return (
    <Form.Item label="选择模型" required>
      <Select
        value={value?.model_name}
        onChange={(modelName) => {
          const selectedModel = models.find(m => m.model_name === modelName);
          if (selectedModel && onChange) {
            onChange(selectedModel);
          }
        }}
        placeholder="请选择一个LLM模型"
      >
        {models.map((model) => (
          <Select.Option key={model.model_name} value={model.model_name}>
            {model.display_name} ({model.provider})
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}; 