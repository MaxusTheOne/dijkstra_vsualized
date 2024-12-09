import Graph from 'graphology';
import Sigma from 'sigma';

export function init() {
  console.log('view.js loaded');
}

export function initGraph() {
  const graph = new Graph();
  graph.addNode('1', { label: 'Node 1', x: 0, y: 0, size: 10, color: 'blue' });
  graph.addNode('2', { label: 'Node 2', x: 1, y: 1, size: 20, color: 'red' });
  graph.addEdge('1', '2', { size: 5, color: 'purple' });

  const sigmaInstance = new Sigma(graph, document.getElementById('container'));
}
