import * as controller from './controller';
import PrioQueue from './types/prioQueue';
import * as view from './view';

//this is our array which gets the processed nodes from the json data
export let nodes = []; // Main nodes

//global array to check if a given node has been visited
let visitedNodes = [];

//find meaningful comment in the prioQueue class 
let priorityQueue = new PrioQueue();

//dictionary object containing a key which is the nodeId and a value which is the distance from the starting node
let distances = {};

//could be called "shortestConnectionToStartDictionary"
//dictionary object containing a key which is the nodeId and a value which the neighboring node or what?
let previousNodes = {};

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

    //this conditional checks if the current node, checked by the nodeId,
    //has its visited property, in the visitedNodes array, set to true
    //if so, it skips the rest of this iteration
    //we use a separate array for this visitedNodes to have separation of concerns
    //with the node objects themselves and the visited property which is used by dijkstra algo
    if (findNodeByIdInVisited(current.node.nodeId).visited) {
      continue;
    }

    //else it sets the visited property to true (it would have been false to even get here)
    findNodeByIdInVisited(current.node.nodeId).visited = true;

    //Gets connection node objects in an array with structure {id: connectedNode.nodeId, dist }
    //from the current node
    let connections = distancesFromNode(current.node);

    //for each connection node object we start by finding the neighbor
    //which is any node connected directly to the current node
    for (let connection of connections) {
      //finds the main node from the nodeId, instead of only having the connection object
      let neighbor = findNodeById(connection.id);

      //all nodes should have connections, but this is just good practice
      //for debugging purposes, skips the rest of this iteration if no neighbors
      if (!connection) {
        console.error(`Neighbor node ${connection.id} not found`);
        continue;
      }

      //we use the distances dictionary object, by acessing the key, which we
      //get from our current nodes, nodeId. By accessing the key, we can add
      //the value, which is set to connection.dist (change this to distanceFromParent later)
      //our current nodes distance to its connection/neighbor
      let newDist = distances[current.node.nodeId] + connection.dist;

      //the first time we check a connections distance = "newDistance" (from our current node)
      //it will always be smaller and therefore fulfill the conditional, since it is set to Infinity (Dijkstra says this)
      if (newDist < distances[connection.id]) {

        //we reassign the value of the key, to the newDist, since we
        //now it is smaller (Dijkstra says this)
        distances[connection.id] = newDist;

        //this is used for optimal path, if this is the shortest distance from our current node
        //then we set the value of our connection node id, to be the current nodes id, a reference
        //structure of previousNodes key: connectionNodeId, value: currentNodeId
        previousNodes[connection.id] = current.node.nodeId;

        //neighbor is a main node, newDist is the shortest distance (and priority in the prioQueue)
        //all nodes get enqueued the first time they are processed, bc they start with distance Infinity
        priorityQueue.enqueue(neighbor, newDist);

        //this is used to add html elements to the schema, if they exist in the
        //previousNodes dictionary object as values
        view.setSchemaToNodeList(previousNodes);
      }
    }
    //pauses for visual purposes
    await controller.pauseDijkstra();
  }
  //for the optimal path variable, if we get an empty array this is for debugging
  //see "startDijkstra" in controller.js
  return [];
}

//This function takes a node and from that nodes "connections" property it calculates
//the distances from that node to its connections
export function distancesFromNode(node) {
  let nodeConnections = [];
  for (let connection of node.connections) {
    //finds node by nodeId, which is needed bc we only have
    //the reference nodeId
    let connectedNode = findNodeById(connection);
    //we use the connectedNode and the paramater node to figure out the distance
    //between them, using lang lng
    let distanceFromParent = getNodeDist(node, connectedNode);
    //we push an object containing, the id of the current connected node that we are processing
    //to the local array nodeConnections, which we later can use to find that 
    //node elsewhere, we also set a prop "distanceFromParent"
    nodeConnections.push({ id: connectedNode.nodeId, dist: distanceFromParent });
  }

  //We highlight the edges that are currently being processed
  //we call this after the first loop, because we need the fully populated
  //nodeConnections array to be able to know which edges to highlight
  //connection.id could be connection.connectionId (corresponds to naming in node.nodeId as well)
  for (let connection of nodeConnections) {
    view.highlightEdge(node.nodeId, connection.id);
  }

  //We return the node connections as an array of objects with this structure
  // type {id: connectedNode.nodeId, dist }
  return nodeConnections;
}

//CONTINUE REFACTORING FROM HERE
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

//Pythagoras theorem to calculate distance between 2 points, by using each nodes
//lat and lng properties
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

//takes a nodeId from a node and looks through the global "nodes"
//array and returns the node which matches the nodeId
export function findNodeById(nodeId) {
  const node = nodes.find((node) => node.nodeId === nodeId);
  if (!node) {
    console.error(`Node ${nodeId} not found`);
  }
  return node;
}

//to prevent looking at nodes that have already been visited (prevent backtracking)
function findNodeByIdInVisited(nodeId) {
  return visitedNodes.find((node) => node.id === nodeId);
}


