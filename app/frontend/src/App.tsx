import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { NodeProvider } from '@/contexts/node-context';
import { Home } from '@/pages/Home';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <NodeProvider>
        <Home />
      </NodeProvider>
    </ConfigProvider>
  );
};

export default App;
