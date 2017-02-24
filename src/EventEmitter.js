export default class EventEmitter {
	constructor() {
		this._queues = {};
	}

	on(name, fn) {
		let queue = this._queues[name];
		if (!queue) {
			queue = [];
			this._queues[name].push(queue);
		}

		queue.push(fn);
	}

	emit(name, ...) {
		let queue = this._queues[name];
		if (queue) {
			queue.map(item => item(...));
		} else {
			throw new Error(`Unable to emit '${name}': Queue does not exist`);
		}
	}
}