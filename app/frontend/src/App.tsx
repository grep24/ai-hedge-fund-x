import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { NodeProvider } from './contexts/node-context';
import Home from '@/pages/Home';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <NodeProvider>
        <Home />
      </NodeProvider>
    </ConfigProvider>
  );
}

export default App;
