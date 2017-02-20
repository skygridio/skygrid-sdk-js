import SkyGridWebSocket from './SkyGridWebSocket';
import Api from './Api';

const c_LoginMasterEndpoint = 'session.loginMaster';

export default class WebSocketApi extends Api {
	constructor(address, projectId) {
		super(address, projectId);

		this._address = address;
		this._projectId = projectId;
		this._session = false;
		this._connected = false;
		this._socket = null;
		this._masterKey = null;

		this._socket = new SkyGridWebSocket(address);
	}

	close() {
		this._socket.close();
		this._socket = null;

		this._session = false;
		this._connected = false;
		this._masterKey = null;
	}

	request(name, data) {
		if (name === c_LoginMasterEndpoint) {
			this._masterKey = data.masterKey;
		}

		if (this._session) {
			return this._makeRequest(name, data);
		}

		return this._makeRequest('session.create', { 
			projectId: this._projectId
		}).then(() => {
			this._session = true;
			if (name !== c_LoginMasterEndpoint && this._masterKey) {
				return this._makeRequest(c_LoginMasterEndpoint, { masterKey: this._masterKey });
			}
		}).then(() => {
			return this._makeRequest(name, data);
		});
	}

	_makeRequest(name, data) {
		const request = {
			endpoint: name
		};

		if (data) {
			request.body = data;
		}

		return this._socket.send(request).then(response => {
			if (response.code >= 200 && response.code < 300) {
				return response.body || {};
			} else if (typeof response.body === 'string') {
				throw new SkyGridError(response.body);
			}
		});
	}
}