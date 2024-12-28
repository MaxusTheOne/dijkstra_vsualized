import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

async function init() {
  console.log('controller.js loaded');
  document
    .querySelector('#input_button')
    .addEventListener('click', handleNodeSelection);

  await model.init();
  view.init();
  console.log('model.nodes', model.nodes);
  
  view.setDistancesToEdges(model.nodes[1]);

  // Getting optimal path from Denmark to Goalland
  // model.dijkstra('Denmark', 'Goalland');
}

export function addNode(x, y) {
  view.addNode(x, y);
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
}
