export default class PrioQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(node, priority) {
    this.queue.push({ node, priority });
    this.sort();
  }

  dequeue() {
    return this.queue.shift();
  }

  updatePriority(node, newPriority) {
    this.queue = this.queue.map((item) => {
      if (item.node === node) {
        item.priority = newPriority;
      }
      return item;
    });
    this.sort();
  }

  dump() {
    console.log(this.queue);
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  sort() {
    this.queue.sort((a, b) => a.priority - b.priority);
  }
}
