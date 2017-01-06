import Api from './Api';
import SkyGridError from './SkyGridError';
import fetch from 'node-fetch'

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	const error = new Error(response.statusText);
	error.response = response;
	throw error;
}

function parseJSON(response) {
	if (response.status !== 204) {
		return response.json();
	}

	return {};
}

function generateQueryUrl(url, queries) {
	if (queries) {
		url += '?where=' + encodeURIComponent(JSON.stringify(queries));
	}
	return url;
}

/**
 * @private
 */
export default class RestApi extends Api {
	constructor(address, projectId) {
		super();

		this._address = address;
		this._projectId = projectId;
		this._masterKey = null;
		this._token = null;

		this._endPoints = {
			signup: data => {
				return this._fetchJson('/users', { method: 'post', body: data });
			},

			login: data => {
				return this._fetchJson('/login', {
					method: 'post',
					body: data
				}).then((data) => {
					this._token = data.token;
					return data;
				});
			},

			loginMaster: data => {
				this._masterKey = data.masterKey;
				return Promise.resolve();
			},

			logout: () => {
				return this._fetchJson('/logout', { method: 'post' });
			},

			fetchUser: data => {
				return this._fetchJson(`/users/${data.userId}`, { method: 'get' });
			},

			findUsers: data => {
				const url = generateQueryUrl('/users', data.constraints);
				return this._fetchJson(url, { method: 'get' });
			},

			deleteUser: data => {
				return this._fetchJson(`/users/${data.userId}`, { method: 'delete' });
			},

			requestPasswordReset: data => {
				return this._fetchJson('/users/requestPasswordReset', { method: 'post', body: data });
			},

			resetPassword: data => {
				return this._fetchJson('/users/resetPassword', { method: 'post', body: data });
			},

			fetchProject: data => {
				return this._fetchJson(`/projects/${data.projectId}`, { method: 'get' });
			},

			updateProject: data => {
				return this._fetchJson(`/projects/${data.projectId}`, { method: 'put', body: data });
			},

			addDeviceSchema: data => {
				return this._fetchJson('/schemas', { method: 'post', body: data });
			},

			findDeviceSchemas: data => {
				const url = generateQueryUrl('/schemas', data.constraints);
				return this._fetchJson(url, { method: 'get' });
			},

			fetchDeviceSchema: data => {
				return this._fetchJson(`/schemas/${data.schemaId}`, { method: 'get' });
			},

			updateDeviceSchema: data => {
				const schemaId = data.schemaId;
				delete data.schemaId;
				return this._fetchJson(`/schemas/${schemaId}`, { method: 'put', body: data });
			},

			deleteDeviceSchema: data => {
				return this._fetchJson(`/schemas/${data.schemaId}`, { method: 'delete' });
			},

			findDevices: data => {
				const url = generateQueryUrl('/devices', data.constraints);
				return this._fetchJson(url, { method: 'get' });
			},

			addDevice: data => {
				return this._fetchJson('/devices', { method: 'post', body: data });
			},

			fetchDevice: data => {
				return this._fetchJson(`/devices/${data.deviceId}`, { method: 'get' });
			},

			updateDevice: data => {
				const deviceId = data.deviceId;
				delete data.deviceId;
				return this._fetchJson(`/devices/${deviceId}`, { method: 'put', body: data });
			},

			deleteDevice: data => {
				return this._fetchJson(`/devices/${data.deviceId}`, { method: 'delete' });
			},

			fetchHistory: data => {
				return this._fetchJson(`/history/${data.deviceId}`, { method: 'get' });
			},

			getServerTime: () => {
				return this._fetchJson('/time', { method: 'get' });
			}
		};
	}

	close() {

	}

	request(name, data) {
		const ep = this._endPoints[name];
		if (ep) {
			return ep(data);
		}

		throw new SkyGridError(`API end point '${name}' does not exist on the REST API`);
	}

	_fetchJson(url, params) {
		if (!params.headers) {
			params.headers = {};
		}

		params.headers['Accept'] = 'application/json';
		params.headers['Content-Type'] = 'application/json';

		if (this._token) {
			params.headers['X-Access-Token'] = this._token;
		} else {
			if (this._masterKey) {
				params.headers['X-Master-Key'] = this._masterKey;
			}

			params.headers['X-Project-ID'] = this._projectId;
		}

		if (params.body) {
			params.body = JSON.stringify(params.body);
		}

		const fullUrl = this._address + url;
		return fetch(fullUrl, params)
				.then(checkStatus)
				.then(parseJSON);
	}
}
