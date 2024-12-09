import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

function init() {
  console.log('controller.js loaded');

  model.init();
  view.init();

  setInterval(addRandomNode, 500);
}

function addRandomNode() {
  const node = {
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 10 + 10,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  };
  const NodeId = Math.floor(Math.random() * view.nodeInstances) + 1;
  const targetNodeId = nextViableNode(NodeId);
  view.addNodeWithConnection(node, targetNodeId);
}

function nextViableNode(nodeId) {
  const connections = view.graph.degreeWithoutSelfLoops(nodeId);

  if (connections > 2) {
    nextViableNode(nodeId + 1);
    return;
  }
  console.log('added note with connections: ', connections);

  return nodeId;
}
