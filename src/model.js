import PrioQueue from './types/prioQueue';
import * as view from './view.js';

export let nodes = []; // Main nodes
let startNode;
let visitedNodes = []; // Visited nodes
let priorityQueue = new PrioQueue(); // Priority queue for Dijkstra
export async function init() {
  await initNodes();
  console.log('model nodes', nodes);

  //dijkstra();
}

// Node structure = {id: "Denmark", x: 0, y: 0, connections: ["Sweden", "Germany"]}
async function initNodes() {
  let fetchedNodes;
  let fetchedConnections;
  await fetch('./src/nodes.json')
    .then((response) => response.json())
    .then((data) => {
      fetchedNodes = data.nodes;
      fetchedConnections = data.edges;
    });
  fetchedNodes.forEach((node) => {
    node.connections = [];
  });
  let connection1, connection2;
  fetchedConnections.forEach((connection) => {
    connection1 = fetchedNodes.find(
      (node) => node.nodeId === connection.source
    );
    connection2 = fetchedNodes.find(
      (node) => node.nodeId === connection.target
    );

    connection1.connections.push(connection2.name);
    connection2.connections.push(connection1.name);
  });

  fetchedNodes.forEach((node) => {
    nodes.push({
      ...node,
      id: node.name,
    });
  });

  nodes.forEach((node) => {
    view.graph.addNode(node.id, node);
  });
  startNode = nodes[1];
}

function dijkstra() {
  console.log('Starting Dijkstra');
  
  initVisitedNodes();

  // Enqueue the starting node
  console.log(`enqueueing ${startNode.id} with distance 0`);
  
  priorityQueue.enqueue(startNode, 0);

  while (!priorityQueue.isEmpty()) {
    let current = priorityQueue.dequeue(); // Get node with the smallest distance
    console.log(`dequeueing ${current.node.id} with distance ${current.priority}`);
    
    // Skip if already visited
    if (findNodeByNameInVisited(current.node.id).visited) {
      console.log(`skipping ${current.node.id}`);
      continue;
    }

    // Mark as visited
    console.log(`marking ${current.node.id} as visited`);
    findNodeByNameInVisited(current.node.id).visited = true;

    // Process connections
    let connections = distancesFromNode(current.node);
    for (let connection of connections) {
      let connectedNode = findNodeByName(connection.id);

      // Only update if the new distance is smaller and the node is not visited
      if (!findNodeByNameInVisited(connectedNode.id).visited) {
        let newDistance = current.priority + connection.dist;
        console.log(`updating distance to ${connectedNode.id} to ${newDistance}`);
        
        // Enqueue the connected node with the new distance
        priorityQueue.enqueue(connectedNode, newDistance);
      }
    }
  }
}

// Calculate distances from a given node
export function distancesFromNode(node) {
  let nodeConnections = [];

  for (let connection of node.connections) {
    let connectedNode = findNodeByName(connection);
    let dist = getNodeDist(node, connectedNode);

    nodeConnections.push({ id: connectedNode.id, dist });
  }
  return nodeConnections;
}

// Initialize visited nodes
function initVisitedNodes() {
  for (let node of nodes) {
    visitedNodes.push({ id: node.id, visited: false });
  }
}

// Utility functions
function getNodeDist(node1, node2) {
  return Math.sqrt((node1.lng - node2.lng) ** 2 + (node1.lat - node2.lat) ** 2);
}

export function findNodeByName(nodeName) {
  return nodes.find((node) => node.id === nodeName);
}

function findNodeByNameInVisited(nodeName) {
  return visitedNodes.find((node) => node.id === nodeName);
}
