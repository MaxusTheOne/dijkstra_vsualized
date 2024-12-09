import Graph from 'graphology';
import chroma from 'chroma-js';
import ForceSupervisor from 'graphology-layout-force/worker';
import Sigma from 'sigma';

export let graph;
let draggedNode = null;
let isDragging = false;
let renderer;
export let nodeInstances = 1;

export function init() {
  console.log('view.js loaded');

  initGraph();
}

export function initGraph() {
  graph = new Graph();
  graph.addNode('1', { x: 0, y: 0, size: 10, color: chroma.random().hex() });

  // Create the spring layout and start it
  const layout = new ForceSupervisor(graph, {
    isNodeFixed: (_, attr) => {
      attr.highlighted;
    },
    settings: {
      gravity: 0.0000002,
      inertia: 0.4,
      repulsion: 0.4,
      attraction: 0.0003,
    },
  });
  layout.start();

  // Create the sigma
  renderer = new Sigma(graph, document.getElementById('screen'));

  // State for drag'n'drop

  // On mouse down on a node
  //  - we enable the drag mode
  //  - save in the dragged node in the state
  //  - highlight the node
  //  - disable the camera so its state is not updated
  renderer.on('downNode', (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, 'highlighted', true);
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });

  // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
  renderer.on('moveBody', ({ event }) => {
    if (!isDragging || !draggedNode) return;

    // Get new position of node
    const pos = renderer.viewportToGraph(event);

    graph.setNodeAttribute(draggedNode, 'x', pos.x);
    graph.setNodeAttribute(draggedNode, 'y', pos.y);

    // Prevent sigma to move camera:
    event.preventSigmaDefault();
    event.original.preventDefault();
    event.original.stopPropagation();
  });

  // On mouse up, we reset the dragging mode
  const handleUp = () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, 'highlighted');
    }
    isDragging = false;
    draggedNode = null;
  };
  renderer.on('upNode', handleUp);
  renderer.on('upStage', handleUp);
}

export function addNodeWithConnection(node, targetNodeId) {
  graph.addNode(++nodeInstances, {
    ...node,
    label: `Node ${nodeInstances}`,
  });
  graph.addEdge(nodeInstances, targetNodeId, {
    size: 5,
    color: 'purple',
  });
}
