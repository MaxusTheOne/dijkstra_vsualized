import * as model from './model.js';
import * as view from './view.js';

window.addEventListener('load', init);

async function init() {
  //NOT IN USE, DELETE THIS
  console.log('controller.js loaded');

  view.init();

  //we await this because all of our data is constructed in this function and that is
  //a little bit important for the rest of our application
  await model.init();
  //NOT IN USE, DELETE THIS
  console.log('model.nodes', model.nodes);

  //NOT IN USE, DELETE THIS
  // Getting optimal path from Denmark to Goalland
  // model.dijkstra('Denmark', 'Goalland');
  // startDijkstra('Italy', 'Goalland');
}

export function addNode(x, y) {
  view.addNode(x, y);
}

//we use this for pausing operations in the algo for visual purposes, to show
//each step of the algo in a more meaningful way
//we create a new promise that takes a resolve callback function which we call inside the 
//setTimeout so that we can set a pause time which we can "await" the rest of the code to wait for
//pauseTime we get dynamically from the HTML input field
export async function pauseDijkstra() {
  const pauseTime = document.querySelector("#pause_time").value;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, pauseTime);
  });
}

// this function calls the dijkstra algo in the model, with the country names from the
// HTML input fields in the view
export async function startDijkstra(startCountry, endCountry) {
  let optimalPath = await model.dijkstraAlgo(startCountry, endCountry);
  //We keep this to ensure that the visual path matches the model path
  console.log('Path:', optimalPath);

  //used to highlight the optimal path, once it has been found 
  view.highlightPath(optimalPath);

  //this will be the array containing the optimal path nodes in order, 
  // from the dijkstra algo function in the model
  return optimalPath;
}
