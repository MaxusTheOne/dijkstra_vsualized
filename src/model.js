import PrioQueue from './types/prioQueue';

let nodes = []; // Main nodes
let startNode;
let visitedNodes = []; // Visited nodes
let priorityQueue = new PrioQueue(); // Priority queue for Dijkstra

export function init() {
  initNodes();
  dijkstra();
}

// Node structure = {id: "Denmark", x: 0, y: 0, connections: ["Sweden", "Germany"]}
function initNodes() {
  nodes.push({ id: 'Denmark', x: 0, y: 0, connections: ['Sweden', 'Germany'] });
  nodes.push({
    id: 'Sweden',
    x: 20,
    y: 20,
    connections: ['Denmark', 'Norway', 'Finland'],
  });
  nodes.push({
    id: 'Germany',
    x: 40,
    y: 40,
    connections: ['Denmark'],
  });
  nodes.push({
    id: 'Norway',
    x: 60,
    y: 60,
    connections: ['Sweden', 'Goalland', 'Finland'],
  });
  nodes.push({
    id: 'Finland',
    x: 80,
    y: 80,
    connections: ['Sweden', 'Goalland'],
  });
  nodes.push({
    id: 'Goalland',
    x: 100,
    y: 100,
    connections: ['Norway', 'Finland'],
  });
  startNode = nodes[0];
}

function dijkstra() {
  initVisitedNodes();

  // Enqueue the starting node
  priorityQueue.enqueue(startNode, 0);

  while (!priorityQueue.isEmpty()) {
    let current = priorityQueue.dequeue(); // Get node with the smallest distance

    // Skip if already visited
    if (findNodeByNameInVisited(current.node.id).visited) {
      continue;
    }

    // Mark as visited
    findNodeByNameInVisited(current.node.id).visited = true;

    // Process connections
    let connections = distancesFromNode(current.node);
    for (let connection of connections) {
      let connectedNode = findNodeByName(connection.id);

      // Only update if the new distance is smaller
      let newDistance = current.priority + connection.dist;
      if (!findNodeByNameInVisited(connectedNode.id).visited) {
        priorityQueue.enqueue(connectedNode, newDistance);
      }
    }
  }
}

// Calculate distances from a given node
function distancesFromNode(node) {
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
  return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

function findNodeByName(nodeName) {
  return nodes.find((node) => node.id === nodeName);
}

function findNodeByNameInVisited(nodeName) {
  return visitedNodes.find((node) => node.id === nodeName);
}
