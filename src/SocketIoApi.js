import Api from './Api';
import SkyGridError from './SkyGridError';
import ValidationError from './ValidationError';
import io from 'socket.io-client';

/**
 * @private
 */
export default class SocketIoApi extends Api {
	constructor(address, projectId) {
		super(); 
		
		this._address = address;
		this._projectId = projectId;
		this._session = false;
		this._connected = false;
		this._socket = null;
		this._masterKey = null;

		if (!this._socket) {
			this._socket = io.connect(this._address, { secure: true });

			this._socket.on('connect', () => {
				this._session = false;
				this._connected = true;
				this.emit('connect');
			});

			this._socket.on('update', data => {
				this.emit('update', data);
			});

			this._socket.on('disconnect', () => {
				this._session = false;
				this._connected = false;
				this.emit('disconnect');
			});
		}
	}

	close() {
		this._socket.close();
		this._socket = null;
	}

	request(name, data) {
		if (name === 'loginMaster') {
			this._masterKey = data.masterKey;
		}

		if (this._session) {
			return this._makeRequest(name, data);
		}

		return this._makeRequest('createSession', { 
			projectId: this._projectId
		}).then(() => {
			this._session = true;
			if (name !== 'loginMaster' && this._masterKey) {
				return this._makeRequest('loginMaster', { masterKey: this._masterKey });
			}
		}).then(() => {
			return this._makeRequest(name, data);
		});
	}

	_makeRequest(name, data) {
		const request = {
			type: name
		};

		if (data) {
			request.data = data;
		}

		return new Promise((resolve, reject) => {
			this._socket.emit('message', request, response => {
				if (response.status === 'ok') {
					resolve(response.data);
				} else if (typeof response.data === 'string') {
					reject( new SkyGridError(response.data));
				} else {
					reject( new ValidationError(response.data));
				}				
			});
		});
	}
}