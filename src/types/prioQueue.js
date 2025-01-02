export default class PrioQueue {
  constructor() {
    this.queue = [];
  }

  //priority will always be the distance of the node from the start node to the node itself

  //sort is used to sort all items in the queue after priority, which is this said distance
  enqueue(node, priority) {
    this.queue.push({ node, priority });
    this.sort();
  }

  //this uses the shift method of js arrays, which always returns the first element, and 
  //since we have sort the array on each enqueue, the first item will always be the one
  //with the shortest distance to the start node
  dequeue() {
    return this.queue.shift();
  }

  //NOT IN USE, DELETE THIS
  updatePriority(node, newPriority) {
    this.queue = this.queue.map((item) => {
      if (item.node === node) {
        item.priority = newPriority;
      }
      return item;
    });
    this.sort();
  }

  //shows the data inside the queue at this moment in time
  dump() {
    console.log(this.queue);
  }

  //returns true or false if the queue is empty or not
  isEmpty() {
    return this.queue.length === 0;
  }

  //this is the sort method which is used each time we enqueue, the priority is the distance
  //of the node from the start node
  sort() {
    this.queue.sort((a, b) => a.priority - b.priority);
  }
}
