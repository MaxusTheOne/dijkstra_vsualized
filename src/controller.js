import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

function init() {
  console.log('controller.js loaded');

  model.init();
  view.init();

  // Call the function to place the dot
  const denmarkNode = addNode(330, 300, "Denmark");
  const swedenNode = addNode(380, 220, "Sweden");
  const germanyNode = addNode(320, 400, "Germany");
  const finlandNode = addNode(470, 150, "Finland");
  const norwayNode = addNode(320, 180, "Norway");
  const goallandNode = addNode(380, 50, "Goalland");

  drawLine(denmarkNode, swedenNode);
  drawLine(denmarkNode, germanyNode);
  drawLine(swedenNode, norwayNode);
  drawLine(swedenNode, finlandNode);
  drawLine(finlandNode, goallandNode);
  drawLine(norwayNode, goallandNode);
}



export function addNode(x, y, name) {
  return view.placeDot(x, y, name);
}

export function highLightNode(nodeId, colorName) {
  view.highLightNode(nodeId, colorName);
}

export function highlightLinesContainingNode(nodeName, color) {
  view.highlightLinesContainingNode(nodeName, color);
}

export function drawLine(node1, node2) {
  view.drawLine(node1, node2);
}

// function nextViableNode(nodeId) {
//   const connections = view.graph.degreeWithoutSelfLoops(nodeId);

//   if (connections > 2 && nodeId < view.nodeInstances) {
//     return nextViableNode(nodeId + 1);
//   }
//   console.log('chose note with connections: ', nodeId, connections);

//   return nodeId;
// }
