import SkyGridException from './SkyGridException';

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		var error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
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
export default class RestApi {
	constructor(address) {
		this.address = address;

		this.endPoints = {
			signup: data => {
				return this.fetchJson('/users', { method: 'post', body: data });
			},

			login: data => {
				return this.fetchJson('/login', { 
					method: 'post',
					body: data
				}).then((data) => {
					this.token = data.token;
					return data;
				});
			},

			logout: () => {
				return this.fetchJson('/logout', { method: 'post' });
			},

			fetchUser: data => {
				return this.fetchJson(`/users/${data.userId}`, { method: 'get' });
			},

			findUsers: data => {
				let url = generateQueryUrl('/users', data.constraints);
				return this.fetchJson(url, { method: 'get' });
			},

			deleteUser: data => {
				return this.fetchJson(`/users/${data.userId}`, { method: 'delete' });
			},

			findDeviceSchemas: data => {
				let url = generateQueryUrl('/schemas', data.constraints);
				return this.fetchJson(url, { method: 'get' });
			},

			addDeviceSchema: data => {
				return this.fetchJson('/schemas', { method: 'post', body: data });
			},

			fetchDeviceSchema: data => {
				return this.fetchJson(`/schemas/${data.schemaId}`, { method: 'get' });
			},

			updateDeviceSchema: data => {
				let schemaId = data.schemaId;
				delete data.schemaId;
				return this.fetchJson(`/schemas/${schemaId}`, { method: 'put', body: data });
			},

			deleteDeviceSchema: data => {
				return this.fetchJson(`/schemas/${data.schemaId}`, { method: 'delete' });
			},

			findDevices: data => {
				let url = generateQueryUrl('/devices', data.constraints);
				return this.fetchJson(url, { method: 'get' });
			},

			addDevice: data => {
				return this.fetchJson('/devices', { method: 'post', body: data });
			},

			fetchDevice: data => {
				return this.fetchJson(`/devices/${data.deviceId}`, { method: 'get' });
			},

			updateDevice: data => {
				let deviceId = data.deviceId;
				delete data.deviceId;
				return this.fetchJson(`/devices/${deviceId}`, { method: 'put', body: data });
			},

			deleteDevice: data => {
				return this.fetchJson(`/devices/${data.deviceId}`, { method: 'delete' });
			},

			fetchHistory: data => {
				return this.fetchJson(`/history/${data.deviceId}`, { method: 'get' });
			},

			getServerTime: data => {
				return this.fetchJson('/time', { method: 'get' });
			}
		};
	}

	setup(projectId, masterKey) {
		this.projectId = projectId;
		this.masterKey = masterKey;
		this.token = null;
	}

	close() {

	}

	request(name, data) {
		let ep = this.endPoints[name];
		if (ep) {
			return ep(data);
		}

		throw new SkyGridException(`API end point '${name}' does not exist on the REST API`);
	}

	fetchJson(url, params) {
		if (!params.headers) {
			params.headers = {};
		}
		
		params.headers['Accept'] = 'application/json';
		params.headers['Content-Type'] = 'application/json';

		if (this.token) {
			params.headers['X-Access-Token'] = this.token;
		} else {
			if (this.masterKey) {
				params.headers['X-Master-Key'] = this.masterKey;
			}

			params.headers['X-Project-ID'] = this.projectId;
		}

		if (params.body) {
			params.body = JSON.stringify(params.body);
		}

		let fullUrl = this.address + url;
		return fetch(fullUrl, params)
				.then(checkStatus)
				.then(parseJSON);
	}
}