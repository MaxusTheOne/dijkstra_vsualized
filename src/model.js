import * as controller from './controller';
import PrioQueue from './types/prioQueue';
import * as view from './view';

export let nodes = []; // Main nodes
//NOT IN USE, DELETE THIS
let startNode;
let visitedNodes = []; // Visited nodes
let priorityQueue = new PrioQueue(); // Priority queue for Dijkstra
let distances = {};
let previousNodes = {};

export async function init() {
  await initNodes();
}

//NOT IN USE, DELETE THIS
// Node structure = {id: "Denmark", x: 0, y: 0, connections: ["Sweden", "Germany"]}
// export async function initNodes() {
//   let fetchedNodes;
//   let fetchedConnections;
//   await fetch('./src/nodes.json')
//     .then((response) => response.json())
//     .then((data) => {
//       fetchedNodes = data.nodes;
//       fetchedConnections = data.edges;
//     });
//   fetchedNodes.forEach((node) => {
//     node.connections = [];
//     distances[node.nodeId] = Infinity;
//     previousNodes[node.nodeId] = null;
//   });
//   let connection1, connection2;
//   fetchedConnections.forEach((connection) => {
//     connection1 = fetchedNodes.find(
//       (node) => node.nodeId === connection.source
//     );
//     connection2 = fetchedNodes.find(
//       (node) => node.nodeId === connection.target
//     );

//     if (connection1 && connection2) {
//       connection1.connections.push(connection2.nodeId);
//       connection2.connections.push(connection1.nodeId);
//     } else {
//       console.error('Connection not found for nodes:', connection);
//     }
//   });
//   nodes = fetchedNodes;
// }

export async function initNodes() {
  try {
    const response = await fetch('./src/nodes.json');
    //destructuring of the variables from the json
    const { nodes: fetchedNodes, edges: fetchedConnections } = await response.json();

    //node.connection sets a property on the node with an empty array
    //distances[node.nodeId] sets a key = nodeId, value = Infinity, pair inside the dictionary object distances
    //previousNodes[node.nodeId] sets a key = nodeId, value = null, pair inside the dictionary object previousNodes
    fetchedNodes.forEach((node) => {
      node.connections = [];
      distances[node.nodeId] = Infinity;
      previousNodes[node.nodeId] = null;
    });

    //we find each node based on the edges source and target, which is corresponding to a nodeId
    //we use the .find method to look through fetchedNodes and find the corresponding node which
    //we then set to the variables connectionSource and connectionTarget
    //finally we push each nodes ID (target, source) to each others connections array, so that they contain a reference to 
    //each other as a connection
    fetchedConnections.forEach(({ source, target }) => {
      const connectionSource = fetchedNodes.find((node) => node.nodeId === source);
      const connectionTarget = fetchedNodes.find((node) => node.nodeId === target);

      if (connectionSource && connectionTarget) {
        connectionSource.connections.push(connectionTarget.nodeId);
        connectionTarget.connections.push(connectionSource.nodeId);
      } else {
        console.error('Connection not found for nodes:', { source, target });
      }
    });

    //finally we set the global array "nodes" to the fetchedNodes which have now been initialized with
    //correct properties and an array of connections which reference the ID of the connection nodes
    nodes = fetchedNodes;
  } catch (error) {
    console.error('Failed to initialize nodes:', error);
  }
}


export async function dijkstra(start, end) {
  await initNodes();
  return dijkstraAlgo(start, end);
}

export async function dijkstraAlgo(start, end) {
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
    //Her highlightes den node der processeres lige nu
    view.highlightNode(current);
    view.setDistancesToEdges(current.node);
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
        view.setSchemaToNodeList(previousNodes);
      }
    }
    await controller.pauseDijkstra();
  }
  return [];
}
// Calculate distances from a given node
export function distancesFromNode(node) {
  let nodeConnections = [];
  for (let connection of node.connections) {
    let connectedNode = findNodeById(connection);
    let dist = getNodeDist(node, connectedNode);
    nodeConnections.push({ id: connectedNode.nodeId, dist });
  }

  //Her highlighter vi edges fra den current node til dens connections
  for (let distance of nodeConnections) {
    view.highlightEdge(node.nodeId, distance.id);
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
      console.error('Infinite loop detected in getOptimalRoute');
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
    console.error(`Node ${nodeName} not found in nodes: `);
    console.log(nodes);
  }
  return node;
}

export function findNodeById(nodeId) {
  const node = nodes.find((node) => node.nodeId === nodeId);
  if (!node) {
    console.error(`Node ${nodeId} not found`);
  }
  return node;
}

function findNodeByIdInVisited(nodeId) {
  return visitedNodes.find((node) => node.id === nodeId);
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
  controller.startDijkstra(startNode.name, endNode.name);
}
