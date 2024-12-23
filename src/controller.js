import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

function init() {
  console.log('controller.js loaded');
  document
    .querySelector('#input_button')
    .addEventListener('click', handleNodeSelection);

  model.init();
  view.init();
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
