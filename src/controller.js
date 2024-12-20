import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

function init() {
  console.log('controller.js loaded');

  model.init();
  view.init();

  
}

export function addNode(x,y){
  view.addNode(x,y)
}
// function nextViableNode(nodeId) {
//   const connections = view.graph.degreeWithoutSelfLoops(nodeId);

//   if (connections > 2 && nodeId < view.nodeInstances) {
//     return nextViableNode(nodeId + 1);
//   }
//   console.log('chose note with connections: ', nodeId, connections);

//   return nodeId;
// }
