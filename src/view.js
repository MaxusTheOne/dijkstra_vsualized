import 'leaflet/dist/leaflet.css';

import chroma from 'chroma-js';
import Graph from 'graphology';
import L from 'leaflet';

import * as controller from './controller.js';
import * as model from './model.js';

// import { Settings } from "sigma/src/settings";

export let graph;
let graphNodes = [];
let edges = {};
let circles = [];
let map;
export let nodeInstances = 1;
let selectedNodes = [];

export async function init() {
  console.log('view.js loaded');

  initMap();
  initGraph();
  await loadJson();

  document
    .querySelector('#input_button')
    .addEventListener('click', handleNodeSelection);
}

export function initMap() {
  map = L.map('map_container').setView([55, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', onMapClick);
}

function onMapClick(e) {
  const { lat, lng } = e.latlng;
  const radius = 30000; // Radius of the nodes in meters[55, 10], 4
  let nearestNode;

  let isNearNode = false;
  graph.forEachNode((nodeId, attributes) => {
    const distance = map.distance([lat, lng], [attributes.lat, attributes.lng]);
    if (distance < radius) {
      isNearNode = true;
    }
    if (nearestNode === undefined || distance < nearestNode.distance) {
      nearestNode = { nodeId, distance };
    }
  });
  console.log('nearestNode', nearestNode);
  if (!isNearNode) {
    console.log('click at:', lat, lng);
    addNode(lat, lng);
  } else {
    console.log('');
  }
}

export function initGraph() {
  graph = new Graph();
}

export function addNode(lat, lng, name) {
  const nodeId = ++nodeInstances;
  let node = graph.addNode(nodeId, {
    lat,
    lng,
    size: 100,
    color: chroma.random().hex(),
    name: name,
    nodeId: nodeId.toString(),
  });

  // graphNodes.push(graph.getNodeAttribute(node, "id"));
  graphNodes.push(graph.getNodeAttributes(node));
  const circle = L.circle([lat, lng], {
    color: 'red',
    radius: 30000, // Increase the radius to make the nodes bigger
  }).addTo(map);

  circle.on('click', (e) => {
    e.originalEvent.stopPropagation(); // Prevent map click event
    handleNodeClick(nodeId);
  });
  circle.bindTooltip(`${name}`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    direction: 'top',
  });
}

function handleNodeClick(nodeId) {
  selectedNodes.push(nodeId);
  if (selectedNodes.length === 2) {
    const [node1, node2] = selectedNodes;
    console.log('Adding edge between nodes', node1, node2);

    addEdge(node1, node2);
    selectedNodes = [];
  }
}

function addEdge(node1Id, node2Id) {
  const node1 = graph.getNodeAttributes(node1Id);
  const node2 = graph.getNodeAttributes(node2Id);

  const edgeKey = `${node1Id}-${node2Id}`;

  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'purple',
      weight: 4,
    }
  ).addTo(map);

  polyline.bindTooltip(`∞`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });

  edges[edgeKey] = polyline;
  edges[edgeKey] = polyline;
}

function removeLabels(node1, node2) {
  const edgeKey = `${node1}-${node2}`;
  if (edges[edgeKey]) {
    edges[edgeKey].unbindTooltip();
  }
}

function displayDistanceToEdges(node1Id, node2Id, distance) {
  const node1 = graph.getNodeAttributes(node1Id);
  const node2 = graph.getNodeAttributes(node2Id);
  // Add new polyline with updated label

  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'purple', // Optional: Set color for the polyline
      weight: 4, // Optional: Set weight for the polyline
    }
  ).addTo(map);

  removeLabels(node1Id, node2Id);
  polyline.bindTooltip(`${distance.toFixed(2)}`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });
}

export function setDistancesToEdges(node) {
  const distances = model.distancesFromNode(node);

  for (let distance of distances) {
    displayDistanceToEdges(node.nodeId, distance.id, distance.dist);
  }
}

export function addNodeWithConnection(node, targetNodeId) {
  graph.addNode(++nodeInstances, {
    ...node,
    label: `Node ${nodeInstances}`,
  });

  const targetNode = graph.getNodeAttributes(targetNodeId);
  L.polyline(
    [
      [node.lat, node.lng],
      [targetNode.lat, targetNode.lng],
    ],
    {
      color: 'purple',
      weight: 5,
    }
  ).addTo(map);
}

async function loadJson() {
  await fetch('./src/nodes.json')
    .then((response) => response.json())
    .then((data) => {
      data.nodes.forEach((node) => {
        addNode(node.lat, node.lng, node.name, node.nodeId);
      });
      data.edges.forEach((edge) => {
        addEdge(edge.source, edge.target);
      });
    });
}

export async function highlightNode(currentNodeObj) {
  const currentNodeId = currentNodeObj.node.nodeId;
  const { lat, lng, name } = graph.getNodeAttributes(currentNodeId);
  colorCircle(lat, lng, name);
}

export async function colorCircle(lat, lng, name) {
  const circle = L.circle(
    { lat, lng },
    { color: 'yellow', radius: 30000 }
  ).addTo(map);

  circle.bindTooltip(`${name} IN FOCUS`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    direction: 'top',
  });

  await controller.pauseDijkstra(500);

  circle.remove();
}

export async function highlightEdge(nodeId1, nodeId2) {
  const node1 = graph.getNodeAttributes(nodeId1);
  const node2 = graph.getNodeAttributes(nodeId2);
  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'red', // Optional: Set color for the polyline
      weight: 4, // Optional: Set weight for the polyline
    }
  ).addTo(map);
  await controller.pauseDijkstra(500);
  polyline.remove();
}
export async function highlightEdgeForPath(nodeId1, nodeId2) {
  const node1 = graph.getNodeAttributes(nodeId1);
  const node2 = graph.getNodeAttributes(nodeId2);
  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'green', // Optional: Set color for the polyline
      weight: 4, // Optional: Set weight for the polyline
    }
  ).addTo(map);
}

// export function findEdgeFromNode(node) {
//   const distances = model.distancesFromNode(node);
//   for (let distance of distances) {
//     highlightEdge(node.nodeId, distance.id);
//   }
// }
function addConnectionToSchema(node1, node2) {
  let schema = document.querySelector('#connections');

  let connectionContainer = document.createElement('div');
  connectionContainer.classList.add('connection');
  connectionContainer.id = `${node1}-connection`;
  connectionContainer.innerHTML = `
  <span class="from">${node1}</span> to <span class="to">${node2}</span>
  `;

  schema.appendChild(connectionContainer);
}

export function addPathToSchema(path) {
  let schema = document.querySelector('#connections');

  let connectionContainer = document.createElement('div');
  connectionContainer.classList.add('connection');

  for (let i = 0; i < path.length - 1; i++) {
    let node1 = model.findNodeById(path[i]);
    let node2 = model.findNodeById(path[i + 1]);
    if (node1 && node2) {
      addConnectionToSchema(node1.name, node2.name);
    }
  }

  schema.appendChild(connectionContainer);
}

export function setSchemaToNodeList(nodeList) {
  let schema = document.querySelector('#connections');
  schema.innerHTML = '';

  for (let nodeId in nodeList) {
    let node = model.findNodeById(nodeId);
    if (!nodeList[nodeId]) {
      continue;
    }
    let connectedNode = model.findNodeById(nodeList[nodeId]);
    addConnectionToSchema(node.name, connectedNode.name);
  }
}

export async function highlightPath(path) {
  let schema = document.querySelector('#connections');
  let connections = schema.querySelectorAll('.connection');
  let countryNames = path.map((nodeId) => model.findNodeById(nodeId).name);
  for (let connection of connections) {
    connection.classList.remove('highlight');
    if (
      countryNames.includes(connection.querySelector('.from').innerText) &&
      countryNames.includes(connection.querySelector('.to').innerText)
    ) {
      connection.classList.add('highlight');
    }
  }
  for (let i = path.length - 1; i > 0; i--) {
    await controller.pauseDijkstra(500);
    await highlightEdgeForPath(path[i], path[i - 1]);
  }
}

function handleNodeSelection(e) {
  e.preventDefault();

  // find startnode by name in nodes
  const inputStart = document.querySelector('#input_start').value;
  const startNode = model.findNodeByName(inputStart);

  // find endnode by name in nodes
  const inputEnd = document.querySelector('#input_goal').value;
  const endNode = model.findNodeByName(inputEnd);

  // Print the found nodes
  console.log('Start Node:', startNode);
  console.log('End Node:', endNode);

  // Start Dijkstra
  console.log(startNode.name, endNode.name);
  controller.startDijkstra(startNode.name, endNode.name);
}
