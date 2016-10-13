import SkyGridException from './SkyGridException';
import ValidationException from './ValidationException';
import io from 'socket.io-client';

/**
 * @private
 */
export default class SocketApi {
	constructor(address, emitter) {
		this.address = address;
		this.emitter = emitter;
		this.session = false;
		this.connected = false;
	}

	setup(projectId, masterKey) {
		this.projectId = projectId;
		this.masterKey = masterKey;
		
		if (!this.socket) {
			this.socket = io.connect(this.address, {secure: true});

			this.socket.on('connect', () => {
				this.session = false;
				this.connected = true;
				this.emitter.emit('connect');
			});

			this.socket.on('update', data => {
				this.emitter.emit('update', data);
			});

			this.socket.on('disconnect', () => {
				this.session = false;
				this.connected = false;
				this.emitter.emit('disconnect');
			});
		}
	}

	close() {
		this.socket.close();
		this.socket = null;
	}

	request(name, data) {
		if (this.session) {
			return this.makeRequest(name, data);
		}

		return this.makeRequest('createSession', { 
			projectId: this.projectId
		}).then(() => {
			this.session = true;
			if (this.masterKey) {
				return this.makeRequest('loginMaster', { masterKey: this.masterKey });
			}
		}).then(() => {
			return this.makeRequest(name, data);
		});
	}

	makeRequest(name, data) {
		let request = {
			type: name
		};

		if (data) {
			request.data = data;
		}
		
		return new Promise((resolve, reject) => {
			this.socket.emit('message', request, response => {
				if (response.status === 'ok') {
					resolve(response.data);
				} else if (typeof response.data === 'string') {
					throw new SkyGridException(response.data);
				} else {
					throw new ValidationException(response.data);
				}
			});
		});
	}
}