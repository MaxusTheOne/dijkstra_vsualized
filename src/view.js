import 'leaflet/dist/leaflet.css';
import chroma from 'chroma-js';
import Graph from 'graphology';
import L from 'leaflet';
import * as controller from './controller.js';
import * as model from './model.js';
export let graph;
//dictionary of edges ids - key, value pairs
let edges = {};
let map;
export let nodeInstances = 1;
let selectedNodes = [];

//This ensures that our map and graph and json data is all initialized
//this adds the eventlistener to start the algo
export async function init() {
  initMap();
  initGraph();
  await loadJson();

  //this click starts the algo
  document
    .querySelector('#input_button')
    .addEventListener('click', handleNodeSelection);
}

//initializes our map from Leaflet
export function initMap() {
  //sets the current viewed part of the map to europe
  map = L.map('map_container').setView([55, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //NOT CURRENTLY IN USE
  // map.on('click', onMapClick);
}

//NOT CURRENTLY IN USE
// function onMapClick(e) {
//   const { lat, lng } = e.latlng;
//   const radius = 30000; // Radius of the nodes in meters[55, 10], 4
//   let nearestNode;

//   let isNearNode = false;
//   graph.forEachNode((nodeId, attributes) => {
//     const distance = map.distance([lat, lng], [attributes.lat, attributes.lng]);
//     if (distance < radius) {
//       isNearNode = true;
//     }
//     if (nearestNode === undefined || distance < nearestNode.distance) {
//       nearestNode = { nodeId, distance };
//     }
//   });
//   console.log('nearestNode', nearestNode);
//   if (!isNearNode) {
//     console.log('click at:', lat, lng);
//     addNode(lat, lng);
//   } else {
//     console.log('');
//   }
// }



//initializes our graph from Graphology
export function initGraph() {
  graph = new Graph();
}

//adds a node as a visual circle on the map
export function addNode(lat, lng, name) {
  const nodeId = ++nodeInstances;

  graph.addNode(nodeId, {
    lat,
    lng,
    size: 100,
    color: chroma.random().hex(),
    name: name,
    nodeId: nodeId.toString(),
  });

  //creates circle and adds the attributes
  const circle = L.circle([lat, lng], {
    color: 'red',
    radius: 30000,
  }).addTo(map);



  //gives the name label to the circle on the map
  circle.bindTooltip(`${name}`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    direction: 'top',
  });
}

//We used this initially in the development, to figure out
//which nodes where connected on the map, to add to our json
//it is not needed anymore, but it was critical in development
function handleNodeClickForEdges(nodeId) {
  selectedNodes.push(nodeId);
  if (selectedNodes.length === 2) {
    const [node1, node2] = selectedNodes;
    console.log('Adding edge between nodes', node1, node2);

    addEdge(node1, node2);
    selectedNodes = [];
  }
}

//adds visual edges between 2 given nodes, called in loadJson
function addEdge(node1Id, node2Id) {
  const node1 = graph.getNodeAttributes(node1Id);
  const node2 = graph.getNodeAttributes(node2Id);

  //generates an edgekey string based on nodeId's
  const edgeKey = `${node1Id}-${node2Id}`;

  //this is the actual visual representation of the edge
  //based on the latitude and longitude props from each node
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

  //adds the label to the edge between node1 and node2
  //set to the infinity symbol bc Dijkstar
  polyline.bindTooltip(`∞`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });

  //after the polyline is generated, we set the value for the edge key, 
  //to be that polyline
  edges[edgeKey] = polyline;
}

//here we use the key from addEdge, which is literally 
//a string of the 2 id's, to find the polyline we want
//to remove the label from
function removeLabels(node1Id, node2Id) {
  const edgeKey = `${node1Id}-${node2Id}`;
  if (edges[edgeKey]) {
    edges[edgeKey].unbindTooltip();
  }
}

//here we display each edges label with the given distance
function displayDistanceToEdges(node1Id, node2Id, distance) {
  const node1 = graph.getNodeAttributes(node1Id);
  const node2 = graph.getNodeAttributes(node2Id);

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

  //remove label from the edge between these 2 nodes
  removeLabels(node1Id, node2Id);

  polyline.bindTooltip(`${distance.toFixed(2)}`, {
    permanent: true,
    direction: 'center',
    className: 'polyline-label',
    offset: [0, -15],
  });

  //generates an edgekey string based on nodeId's
  const edgeKey = `${node1Id}-${node2Id}`;

  //replaces the previous polyline with this one
  edges[edgeKey] = polyline;
}

//this gets current node in dijsktra algo
//then finds all distances to its connections from the current node
//then loops through each distance obj {id: nodeId, dist: distance}
export function setDistancesToEdges(node) {
  const distanceList = model.distancesFromNode(node);

  //displays the given calculated distance on each edges label
  for (let nodeConnection of distanceList) {
    displayDistanceToEdges(node.nodeId, nodeConnection.id, nodeConnection.dist);
  }
}

//loads json data and then converts to visual nodes on the map
export async function loadJson() {
  try {
    const response = await fetch('./src/nodes.json');
    const { nodes, edges } = await response.json();

    //Destructure nodes props and then addNode function called 
    //with those props
    nodes.forEach(({ lat, lng, name, nodeId }) => {
      addNode(lat, lng, name, nodeId);
    });

    //Destructure edges props and then addEdge function called
    //with those props
    edges.forEach(({ source, target }) => {
      addEdge(source, target);
    });

  } catch (error) {
    console.error('Failed to load JSON data:', error);
  }
}

//highlights the current node being processed on the map,
//calls the function that changes the label and circle color/size
export async function highlightNode(currentNodeObj) {
  const currentNodeId = currentNodeObj.node.nodeId;
  const { lat, lng, name } = graph.getNodeAttributes(currentNodeId);
  colorCircle(lat, lng, name);
}

//logic for highlighting color and size of circle
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

  await controller.pauseDijkstra();

  circle.remove();
}

//adds a red edge between 2 nodes, delays, removes it again
//this is done to show dijsktra algo calculating distances to connections
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
  await controller.pauseDijkstra();
  polyline.remove();
}

//adds a green edge between 2 nodes, to show the optimalpath
//if we wanted better reset, we should remove again, once the
//algo runs again
export async function highlightEdgeForPath(nodeId1, nodeId2) {
  const node1 = graph.getNodeAttributes(nodeId1);
  const node2 = graph.getNodeAttributes(nodeId2);
  L.polyline(
    [
      [node1.lat, node1.lng],
      [node2.lat, node2.lng],
    ],
    {
      color: 'green',
      weight: 4,
    }
  ).addTo(map);
}


//add one line of HTML with the names of the 2 connected nodes
function addConnectionToSchema(node1Name, node2Name) {
  let schema = document.querySelector('#connections');

  let connectionContainer = document.createElement('div');
  connectionContainer.classList.add('connection');
  connectionContainer.id = `${node1Name}-connection`;
  connectionContainer.innerHTML = `
  <span class="from">${node2Name}</span> to <span class="to">${node1Name}</span>
  `;

  schema.appendChild(connectionContainer);
}

//nodeList is the global previousNodes dictionary object
//called every iteration of the connections loop, for each connection
//changes the html schema to match the previous nodes dictionary
export function setSchemaToNodeList(towardsStartDictionary) {
  //find schema html element
  let schema = document.querySelector('#connections');
  //reset innerHTML
  schema.innerHTML = '';

  //look at each element in the object, use for in for this reason
  //since not an array, no "order" in a object, not iterable
  for (let keyValue in towardsStartDictionary) {
    //default is null if they are not changed, we skip null values in the loop
    if (!towardsStartDictionary[keyValue]) {
      continue;
    }

    //find main node by the key: nodeId from the towardsStartDictionary
    let mainNode = model.findNodeById(keyValue);

    //we find the connected node with shortest distance to start
    //by accessing the value of the towardsStartDictionary, which will be that nodes ID
    //to be able to get back towards start, we need to go to the value attached to the key 
    let towardsStartNode = model.findNodeById(towardsStartDictionary[keyValue]);

    //adds an HTML element with the names of the nodes in this step of the optimal path
    addConnectionToSchema(mainNode.name, towardsStartNode.name);
  }
}

//this gets called, from the controller, after dijkstra has run in the model
//with the return array from the dijkstra algo
//EX: of given path SPAIN -> GOALLAND ['13', '10', '2', '3', '4', '5', '7']
export async function highlightPath(path) {
  for (let i = path.length - 1; i > 0; i--) {
    await controller.pauseDijkstra();
    await highlightEdgeForPath(path[i], path[i - 1]);
  }
}

//starts the program/algo
async function handleNodeSelection(e) {
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
  let path = await controller.startDijkstra(startNode.name, endNode.name);

  path = path.map(nodeName => model.findNodeById(nodeName));
  // Add order to the path and update HTML schema
  const schema = document.querySelector('#connections');
  schema.innerHTML = '';
  path.forEach((node, index) => {
    if (index === path.length - 1) {
      return;
    }
    let connectionContainer = document.createElement('div');
    connectionContainer.classList.add('connection');
    connectionContainer.id = `${node.name}-connection`;
    connectionContainer.innerHTML = `
      <span class="from">${node.name}</span> to <span class="to">${path[index + 1].name}</span>
      `;


    // Create a new div for the order
    let orderDiv = document.createElement('div');
    orderDiv.classList.add('connection-order');
    orderDiv.innerText = `Order: ${index + 1}`;

    // Append the order div to the connection container
    connectionContainer.appendChild(orderDiv);

    schema.appendChild(connectionContainer);
  });

  // Print the path with order
  console.log('Path with order:', path);


}
