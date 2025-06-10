import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState
} from 'reactflow';
import { useCallback, useState } from 'react';

import 'reactflow/dist/style.css';

import { AppNode } from '@/nodes/types';
import { edgeTypes } from '../edges';
import { initialNodes, nodeTypes } from '../nodes';
import { Button } from './ui/button';

type FlowProps = {
  className?: string;
};

export function Flow({ className = '' }: FlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const proOptions = { hideAttribution: true };
  
  // Initialize the flow when it first renders
  const onInit = useCallback(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Connect two nodes with marker
  const onConnect = useCallback(
    (connection: Connection) => {
      // Create a new edge with a marker and unique ID
      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`, // Add unique ID
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Reset the flow to initial state
  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        proOptions={proOptions}
        fitView
      >
        <Background gap={13}/>
        <Controls 
          position="bottom-center" 
          style={{ bottom: 20 }}
        />
        <Panel position="top-right">
          <Button
            onClick={resetFlow}
            className="mr-2"
          >
            Reset Flow
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 