import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

function init() {
  console.log('controller.js loaded');

  model.init();
  view.init();

  // setInterval(addRandomNode, 3000);
}

// function addRandomNode() {
//   const node = {
//     x: Math.random(),
//     y: Math.random(),
//     size: Math.random() * 10 + 10,
//     color: '#' + Math.floor(Math.random() * 16777215).toString(16),
//   };
//   const nodeId = Math.floor(Math.random() * view.nodeInstances) + 1;
//   let targetNodeId = nextViableNode(nodeId);

//   if (targetNodeId === 1 && view.graph.degreeWithoutSelfLoops(1) >= 2) {
//     targetNodeId = nextViableNode(nodeId + 1);
//   }

//   view.addNodeWithConnection(node, targetNodeId);
// }

// function nextViableNode(nodeId) {
//   const connections = view.graph.degreeWithoutSelfLoops(nodeId);

//   if (connections > 2 && nodeId < view.nodeInstances) {
//     return nextViableNode(nodeId + 1);
//   }
//   console.log('chose note with connections: ', nodeId, connections);

//   return nodeId;
// }
