import PrioQueue from './types/prioQueue';

let nodes = []; // Main nodes
let startNode;
let visitedNodes = []; // Visited nodes
let priorityQueue = new PrioQueue(); // Priority queue for Dijkstra
let distances = {};
let previousNodes = {};
export async function init() {
  let path = await dijkstra("Italy", "Goalland");
  console.log("Path:", path); 
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
    distances[node.nodeId] = Infinity;
    previousNodes[node.nodeId] = null;
  });
  let connection1, connection2;
  fetchedConnections.forEach((connection) => {
    connection1 = fetchedNodes.find(
      (node) => node.nodeId === connection.source
    );
    connection2 = fetchedNodes.find(
      (node) => node.nodeId === connection.target
    );

    if (connection1 && connection2) {
      connection1.connections.push(connection2.nodeId);
      connection2.connections.push(connection1.nodeId);
    } else {
      console.error("Connection not found for nodes:", connection);
    }
  });
  nodes = fetchedNodes;
}

export async function dijkstra(start, end) {
  await initNodes();
  return dijkstraAlgo(start, end);
}

export function dijkstraAlgo(start, end) {
  // Convert start and end to node objects
  start = findNodeByName(start);
  end = findNodeByName(end);
  
  if (!start || !end) {
    console.error('Start or end node not found');
    return [];
  }
  
  initVisitedNodes();
  distances[start.nodeId] = 0;

  // Enqueue the starting node
  priorityQueue.enqueue(start, 0);

  while (!priorityQueue.isEmpty()) {
    let current = priorityQueue.dequeue(); // Get node with the smallest distance

    if (current.node.nodeId === end.nodeId) {
      return getOptimalRoute(start, end);
    }
    
    // Skip if already visited
    if (findNodeByIdInVisited(current.node.nodeId).visited) {
      continue;
    }

    // Mark as visited
    findNodeByIdInVisited(current.node.nodeId).visited = true;

    // Process connections
    let connections = distancesFromNode(current.node);
    for (let connection of connections) {
      let neighbor = findNodeById(connection.id);
      if (!neighbor) {
        console.error(`Neighbor node ${connection.id} not found`);
        continue;
      }
      let newDist = distances[current.node.nodeId] + connection.dist;

      if (newDist < distances[neighbor.nodeId]) {
        distances[neighbor.nodeId] = newDist;
        previousNodes[neighbor.nodeId] = current.node.nodeId;
        priorityQueue.enqueue(neighbor, newDist);
      }
    }
  }
  return [];
}
// Calculate distances from a given node
function distancesFromNode(node) {
  let nodeConnections = [];
  
  for (let connection of node.connections) {
    let connectedNode = findNodeById(connection);
    let dist = getNodeDist(node, connectedNode);
    nodeConnections.push({ id: connectedNode.nodeId, dist });
  }
  return nodeConnections;
}
export function getOptimalRoute(start, end) {
  let path = [];
  let currentNode = end.nodeId;

  let safetyCounter = 0; // Safety counter to prevent infinite loop
  const maxIterations = 1000; // Adjust this value as needed
  
  while (currentNode !== null && currentNode !== start.nodeId) {
    if (safetyCounter > maxIterations) {
      console.error("Infinite loop detected in getOptimalRoute");
      break;
    }
    path.unshift(currentNode);
    currentNode = previousNodes[currentNode];
    safetyCounter++;
  }

  // Add the start node to the path
  if (currentNode === start.nodeId) {
    path.unshift(start.nodeId);
  }
  
  return path;
}

// Initialize visited nodes
function initVisitedNodes() {
  visitedNodes = [];
  for (let node of nodes) {
    visitedNodes.push({ id: node.nodeId, visited: false });
  }
}

// Utility functions
function getNodeDist(node1, node2) {
  return Math.sqrt((node1.lng - node2.lng) ** 2 + (node1.lat - node2.lat) ** 2);
}

export function findNodeByName(nodeName) {
  const node = nodes.find((node) => node.name === nodeName);
  if (!node) {
    console.error(`Node ${nodeName} not found`);
  }
  return node;
}

function findNodeById(nodeId) {
  const node = nodes.find((node) => node.nodeId === nodeId);
  if (!node) {
    console.error(`Node ${nodeId} not found`);
  }
  return node;
}

function findNodeByIdInVisited(nodeId) {
  return visitedNodes.find((node) => node.id === nodeId);
}