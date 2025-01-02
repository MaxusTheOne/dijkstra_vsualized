import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

async function init() {
  console.log('controller.js loaded');

  view.init();
  await model.init();
  console.log('model.nodes', model.nodes);

  // Getting optimal path from Denmark to Goalland
  // model.dijkstra('Denmark', 'Goalland');
  // startDijkstra('Italy', 'Goalland');
}
export function addNode(x, y) {
  view.addNode(x, y);
}

export async function pauseDijkstra() {
  const pauseTime = document.querySelector("#pause_time").value;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, pauseTime);
  });
}

export async function startDijkstra(country1, country2) {
  let path = await model.dijkstra(country1, country2);
  console.log('Path:', path);

  view.highlightPath(path);
  return path;
}
