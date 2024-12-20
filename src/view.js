import Graph from 'graphology';
import chroma from 'chroma-js';
import ForceSupervisor from 'graphology-layout-force/worker';
import Sigma from 'sigma';
// import { Settings } from "sigma/src/settings";


export let graph;
let draggedNode = null;
let isDragging = false;
let renderer;
export let nodeInstances = 1;

export function init() {
  console.log('view.js loaded');

  initGraph();

  initEventListeners();
}

export function initGraph() {
  graph = new Graph();
  graph.addNode('1', {label: "node1", x: 0, y: 0, size: 10, color: chroma.random().hex() });
  graph.addNode('2', {label: "node2", x: 20, y: 20, size: 10, color: chroma.random().hex() });
  
  // Create the sigma
  renderer = new Sigma(graph, document.getElementById('screen'));

  // renderer.setSettings({enableCameraZooming: false, enableCameraPan: false});

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

function initEventListeners() {
  document.addEventListener('mousedown', (e) => {
    console.log('mousedown');;
    console.log('mousedown at:', e.clientX, e.clientY);
  });
}