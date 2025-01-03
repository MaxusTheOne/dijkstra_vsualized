import * as controller from './controller';
import PrioQueue from './types/prioQueue';
import * as view from './view';

//this is our array which gets the processed nodes from the json data
export let nodes = []; // Main nodes
//NOT IN USE, DELETE THIS
let startNode;
//global array to check if a given node has been visited
let visitedNodes = [];
//find meaningful comment in the prioQueue class 
let priorityQueue = new PrioQueue();
//dictionary object containing a key which is the nodeId and a value which is the distance from the starting node
let distances = {};
//dictionary object containing a key which is the nodeId and a value which the neighboring node or what?
let previousNodes = {};

//NOT IN USE, DELETE THIS
// export async function init() {
//   //initNodes gets called in dijkstra function as well, figure explanation out?
//   await initNodes();
// }

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

export async function init() {
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

//NOT IN USE, DELETE THIS
// export async function dijkstra(startCountry, endCountry) {
//   // await initNodes();
//   return dijkstraAlgo(startCountry, endCountry);
// }

//called by start dijkstra in the controller, gets the start and end parameters from there
//we have changed the parameter names to be more meaningful

export async function dijkstraAlgo(startCountry, endCountry) {
  //Since we get the names of the countrys from the input fields,
  //we need to find the corresponding nodes, hence the functions below
  let startNode = findNodeByName(startCountry);
  let endNode = findNodeByName(endCountry);

  //error handling in case no node is found by that country name
  if (!startNode || !endNode) {
    console.error('Start or end node not found');
    return [];
  }

  //is only called once outside the while loop, initiates an array
  //with object of this structure {nodeId, visited: true/false}
  initVisitedNodes();

  //dictionary obbject distances has its first pair set to the key = nodeId
  //of our starting node and the value = 0, which is correct for
  //the dijkstar algo, we do this to have a starting point
  distances[startNode.nodeId] = 0;

  //Enqueue the starting node, which takes a node and its distance from start
  //this will always be the starting node, so nothing else to sort
  priorityQueue.enqueue(startNode, 0);

  //this is the while loop that actually runs the algorithm from start to end
  //it runs on the condition that the prioQueue is not empty
  while (!priorityQueue.isEmpty()) {
    //Get node with the smallest distance, this is reassigned each iteration
    //current is an object of this structure {node, distance/priority}
    let current = priorityQueue.dequeue();

    //Here we highlight the current node being processed
    view.highlightNode(current);

    //Here we show the distance between nodes on the "edge label" between the nodes
    view.setDistancesToEdges(current.node);

    //if the nodeId of the current is the same as the one for the endNode, 
    // which we get outside the while loop, then we call the getOptimalPath
    //function which returns an array of nodeId's in order, with the starting node
    //first and the end node last
    if (current.node.nodeId === endNode.nodeId) {
      return getOptimalPath(startNode, endNode);
    }

    //this conditional checks if the current nodes, checked by the nodeId,
    //has its visited property, in the visitedNodes array, set to true
    //if so, it skips the rest of this iteration
    //we use a separate array for this visitedNodes to have separation of concerns
    //with the node objects themselves and the visited property which is used by dijkstra algo
    if (findNodeByIdInVisited(current.node.nodeId).visited) {
      continue;
    }

    //else it sets the visited property to true (it would have been false to even get here)
    findNodeByIdInVisited(current.node.nodeId).visited = true;

    //CONTINUE REFACTORING FROM HERE
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

export function getOptimalPath(start, end) {
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

// Initializes a list of objects containing all nodeId's and true/false if it has been visited
function initVisitedNodes() {
  //NOT IN USE, DELETE THIS
  // visitedNodes = [];
  for (let node of nodes) {
    visitedNodes.push({ id: node.nodeId, visited: false });
  }
}

// Utility functions
function getNodeDist(node1, node2) {
  return Math.sqrt((node1.lng - node2.lng) ** 2 + (node1.lat - node2.lat) ** 2);
}


//finds the corresponding node to the country name
//error handling if find returns undefined
export function findNodeByName(countryName) {
  const node = nodes.find((node) => node.name === countryName);
  if (!node) {
    console.error(`Node ${countryName} not found in nodes: `);
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
