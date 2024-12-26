import 'leaflet/dist/leaflet.css';
import * as model from './model.js';
import chroma from 'chroma-js';
import Graph from 'graphology';
import L from 'leaflet';

// import { Settings } from "sigma/src/settings";

export let graph;
let graphNodes = [];
let graphEdges = [];
let map;
export let nodeInstances = 1;
let selectedNodes = [];

export async function init() {
  console.log('view.js loaded');
  
  initMap();
  initGraph();
  await loadJson();
  console.log("visuel nodes", graphNodes);
  console.log("visuel edges", graphEdges);
  
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
    addEdge(node1, node2);
    selectedNodes = [];
  }
}

function addEdge(node1Id, node2Id) {
  console.log('node1Id inside addEdge', node1Id);
  console.log('node2Id inside addEdge', node2Id);
  
  const node1 = graph.getNodeAttributes(node1Id);
  console.log('nodes value after getting the node', node1);
  
  const node2 = graph.getNodeAttributes(node2Id);

  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'purple',
      weight: 5,
    }
  ).addTo(map);

  polyline.bindTooltip(`∞`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });
}

function displayDistanceToEdges(node1Id, node2Id, distance) {
  console.log("Hvad værdierne er inde i node1Id", node1Id, node2Id, distance);
  
  const node1 = graph.getNodeAttributes(node1Id);
  const node2 = graph.getNodeAttributes(node2Id);
  

  const polyline = L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
  ).addTo(map);

  polyline.bindTooltip(`${distance}`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });
}

export function setDistancesToEdges(node) {
  const distances = model.distancesFromNode(node);
  console.log('node inside setDistancesToEdge', node);
  
  console.log('distances array', distances);
  
  for (let distance of distances) {
    displayDistanceToEdges(node.id, distance.id, distance.dist);
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
        addNode(node.lat, node.lng, node.name);
      });
      data.edges.forEach((edge) => {
        addEdge(edge.source, edge.target);
      });
    });
}