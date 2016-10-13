import RestApi from './RestApi';
import SocketApi from './SocketApi';
import EventEmitter from './EventEmitter';

/**
 * @private
 */
export default class Api {
	constructor(url) {
		this.emitter = new EventEmitter();
		this.current = null;
	}

	get api() {
		return this.current;
	}

	get usingMasterKey() {
		return this.masterKey !== null;
	}

	get connected() {
		if (this.socket && this.current === this.socket) {
			return this.socket.connected;
		}

		return false;
	}

	setup(address, apiType, projectId, masterKey) {
		this.apis = { 
			rest: new RestApi(address, this.emitter),
			websocket: new SocketApi(address, this.emitter)
		};
		
		this.address = address;
		this.projectId = projectId;
		this.masterKey = masterKey;
		this.setApiType(apiType);
	}

	/**
	 * Sets the API interface to be used.  Current valid options are "rest" and "websocket".
	 * @param {string} name The name of the API interface to use.
	 */
	setApiType(name) {
		let next = this.apis[name];
		if (next) {
			if (this.current) {
				this.current.close();
			}

			next.setup(this.projectId, this.masterKey);
			this.current = next;
		} else {
			throw new Error(`API type '${name}' unknown`);
		}
	}

	addListener(name, callback) {
		this.emitter.addListener(name, callback);
	}

	request(name, data) {
		return this.current.request(name, data);
	}
}