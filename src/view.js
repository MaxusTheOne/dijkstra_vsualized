import Graph from 'graphology';
import chroma from 'chroma-js';
import ForceSupervisor from 'graphology-layout-force/worker';
import Sigma from 'sigma';
import * as controller from "./controller.js";

// import { Settings } from "sigma/src/settings";

const arrTest = [];

export let graph;
let draggedNode = null;
let isDragging = false;
let renderer, mouseCaptor, viewportCoords;
export let nodeInstances = 1;

export function init() {
  console.log('view.js loaded');


  // initGraph();
  // initEventListeners();
}

export function initGraph() {
  graph = new Graph();
  // Create the sigma
  renderer = new Sigma(graph, document.getElementById('sigma_container'), { enableCameraZooming: false, enableCameraPan: false });

  const canvas = document.getElementById('screen');
  canvas.addEventListener('mousedown', (e) => {
    const viewportCoords = renderer.viewportToGraph({ x: e.clientX, y: e.clientY });
    console.log('mousedown at:', viewportCoords.x, viewportCoords.y);
    controller.addNode(viewportCoords.x, viewportCoords.y);
  });
}

export function addNode(x, y, name) {
  graph.addNode(nodeInstances++, {
    name,
    x,
    y,
    size: 10,
    color: "grey",
  });
  // console.log('added node', nodeInstances);

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

//graph.setNodeAttribute('Martha', 'age', 34);
export function highLightNode(nodeId, colorName) {
  const nodes = document.querySelectorAll('[data-name]');
  nodes.forEach(node => {
    if (node.dataset.name === nodeId) {
      node.style.backgroundColor = colorName;
    } else {
      node.style.backgroundColor = 'grey';
    }
  });
}

export function placeDot(x, y, name) {
  // Create a new div element
  const dot = document.createElement('div');

  // Set the style for the dot
  dot.style.width = '15px';
  dot.style.height = '15px';
  dot.style.backgroundColor = 'grey';
  dot.style.position = 'absolute';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.borderRadius = '50%';

  // Set the data-name attribute
  dot.dataset.name = name;

  // Append the dot to the body
  document.body.appendChild(dot);

  return addVisualNodeObject(x, y, name);
}

function addVisualNodeObject(x, y, name) {
  const visualNodeObj = {
    x, y, name
  };

  arrTest.push(visualNodeObj);
  return visualNodeObj;
}

export function drawLine(node1, node2) {
  const visualNodeObj1 = arrTest.find(item => item.name === node1.name);
  const visualNodeObj2 = arrTest.find(item => item.name === node2.name);

  const x1 = visualNodeObj1.x;
  const y1 = visualNodeObj1.y;
  const x2 = visualNodeObj2.x;
  const y2 = visualNodeObj2.y;

  // Create a new div element for the line
  const line = document.createElement('div');

  // Set the data-name attribute
  line.dataset.nodes = `${node1.name},${node2.name}`;


  // Calculate the distance and angle between the points
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  // Set the style for the line
  line.style.width = `${length}px`;
  line.style.height = '2px';
  line.style.backgroundColor = 'black';
  line.style.position = 'absolute';
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.transformOrigin = '0 0';
  line.style.transform = `rotate(${angle}deg)`;

  // Append the line to the body
  document.body.appendChild(line);
}

export function highlightLinesContainingNode(nodeName, color) {
  const lines = document.querySelectorAll('[data-nodes]');
  lines.forEach(line => {
    const nodes = line.dataset.nodes.split(',');
    if (nodes.includes(nodeName)) {
      line.style.backgroundColor = color;
    } else {
      line.style.backgroundColor = 'black';
    }
  });
}