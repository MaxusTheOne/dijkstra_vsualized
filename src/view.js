import Graph from 'graphology';
import chroma from 'chroma-js';
import ForceSupervisor from 'graphology-layout-force/worker';
import Sigma from 'sigma';
import * as controller from "./controller.js"

// import { Settings } from "sigma/src/settings";


export let graph;
let draggedNode = null;
let isDragging = false;
let renderer, mouseCaptor, viewportCoords;
export let nodeInstances = 1;

export function init() {
  console.log('view.js loaded');

  initGraph();
  initEventListeners();
}

export function initGraph() {
  graph = new Graph();
  // Create the sigma
  renderer = new Sigma(graph, document.getElementById('sigma_container'),{enableCameraZooming: false, enableCameraPan: false});

  const canvas = document.getElementById('screen');
  canvas.addEventListener('mousedown', (e) => {
    const viewportCoords = renderer.viewportToGraph({ x: e.clientX, y: e.clientY });
    console.log('mousedown at:', viewportCoords.x, viewportCoords.y);
    controller.addNode(viewportCoords.x, viewportCoords.y);
  });
}

export function addNode(x, y) {
  graph.addNode(++nodeInstances, {
    x,
    y,
    size: 10,
    color: chroma.random().hex(),
  });
  console.log('added node', nodeInstances);
  
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
  
}