import EventEmitter from 'eventemitter2';

export default class SkyGridWebSocket extends EventEmitter {
	constructor(address) {
		super();

		this._socket = new WebSocket(address);
		this._reconnect = true;
		this._requestId = 0;
		this._requests = {};
		this._requestQueue = [];
		
		this._socket.onopen = () => {
			const len = this._requestQueue.length;
			for (let i = 0; i < len; i++) {
				this._requestQueue[i]();
			}

			this._requestQueue = this._requestQueue.splice(len, this._requestQueue.length - len);
			this.emit('connect'); 
		};

		this._socket.onclose = () => { 
			this.emit('disconnect'); 
		};

		this._socket.onmessage = (e) => {
			const data = JSON.parse(e.data);

			if (this._requests.hasOwnProperty(data.requestId)) {
				const request = this._requests[data.requestId];
				request(data);
				delete this._requests[data.requestId];
			} else {
				this.emit('update', data);
			}
		};

		this._socket.onerror = (error) => { throw new Error(error); };
	}

	get state() {
		return this._socket.readyState;
	}

	send(message) {
		switch (this._socket.readyState)
		{
			case WebSocket.CONNECTING:
				return this._queueMessage(message);
			case WebSocket.CLOSING:
			case WebSocket.CLOSED:
				throw new Error('Websocket is closed');
		}

		return this._handleSend(message);
	}

	_queueMessage(message) {
		return new Promise((resolve, reject) => {
			this._requestQueue.push(() => {
				this._handleSend(message).then(resolve).catch(reject);
			});
		});
	}

	_handleSend(message) {
		message.requestId = this._requestId++;
		this._socket.send(JSON.stringify(message));

	 	return new Promise((resolve, reject) => {
	 		this._requests[message.requestId] = (response) => {
	 			resolve(response);
			};
	 	});
	}

	close() {
		this._requestQueue = [];

		this._reconnect = false;
		this._socket.close();
	}
}