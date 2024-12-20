let nodes = []; // Main node
let startNode;
let distancesFromStart = [] // Distance node
let visitedNodes = []; // Visited node
export function init() {
  console.log('model.js loaded');

  initNodes();
  
  dijkstra();
}
// Node structure = {id: "Denmark", x: 0, y: 0, connections: ["Sweden", "Germany"]}
function initNodes() {
  nodes.push({id: "Denmark", x: 0, y: 0, connections: ["Sweden","Germany"]});
  nodes.push({id: "Sweden", x: 20, y: 20, connections: ["Denmark","Norway","Finland"] });
  nodes.push({id: "Germany", x: 40, y: 40, connections: ["Denmark"]});
  nodes.push({id: "Norway", x: 60, y: 60, connections: ["Sweden","Goalland","Finland"]});
  nodes.push({id: "Finland", x: 80, y: 80, connections: ["Sweden","Goalland"]});
  nodes.push({id: "Goalland", x: 100, y: 100, connections: ["Norway", "Finland"]});
  startNode = nodes[0]
}

function dijkstra(){
  initdistancesFromStart()
  initVisitedNodes()

  let nextNode = pickShortest(distancesFromStart)
  console.log(distancesFromNode(nextNode));
   
  // Get distances from all connections


}

function initdistancesFromStart(){
  for (let node of nodes){
    console.log(node);
    // Find if the node exists in the startnodes connections
    if (node == startNode) distancesFromStart.push({id: node.id, dist: 0});
    else if (startNode.connections.find(connection => node.id == connection)){
      addDistanceFromStart(node)
    } else {
      distancesFromStart.push({id: node.id, dist: Infinity})
    }
  }
  console.log("Distance List: ", distancesFromStart);
  
}
function distancesFromNode(node){
  console.log("checking node:", node);
  
  let nodeConnections = [];
  let currentNodeDistFromStart = findNodeByNameInDistance(node.id)
  for (let connection of node.connections){
    if (findNodeByNameInVisited(connection).visited == false ){
      let connectedNode = findNodeByName(connection)
      let distanceNode = findNodeByNameInDistance(connection)
      let dist = getNodeDist(node, connectedNode)
      nodeConnections.push({id: connectedNode.id, dist: dist })
      distanceNode.dist = dist + currentNodeDistFromStart.dist
    }
  }
  console.log(distancesFromStart);
  return nodeConnections
  
}

function findNodeByName(nodeName){
  return nodes.find(node => node.id == nodeName)
}
function findNodeByNameInDistance(nodeName){
  return distancesFromStart.find(node => node.id == nodeName)
}
function findNodeByNameInVisited(nodeName){
  return visitedNodes.find(node => node.id == nodeName)
}

function initVisitedNodes(){
  for (let node of nodes){
    if (node.id == "Denmark") visitedNodes.push({id: node.id, visited: true})
    else visitedNodes.push({id: node.id, visited: false})
  }
}

function getNodeDist(node1, node2) {
  return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

function addDistanceFromStart(node){
  let dist = getNodeDist(startNode, node)
  distancesFromStart.push({id: node.id, dist: dist})
}

function pickShortest(nodeList){
  let i = 0;
  let sortedList = nodeList.sort( node => {node.dist})
  while (findNodeByNameInVisited(nodeList[i].id).visited == true){
    i++
  }
  let shortest = sortedList[i]
  console.log("shortest: ", shortest);
  
  return findNodeByName(shortest.id)
  
}

