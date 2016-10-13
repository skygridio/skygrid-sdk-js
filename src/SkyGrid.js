import Api from './Api';
import Device from './Device';
import Schema from './Schema';
import User from './User';
import SubscriptionManager from './SubscriptionManager';
import SkyGridException from './SkyGridException';

const API_URL = 'https://api.skygrid.io';

export default class SkyGrid {
	/**
	 * [constructor description]
	 * @param  {[type]} projectId [description]
	 * @param  {[type]} masterKey [description]
	 * @param  {[type]} settings  [description]
	 * @return {[type]}           [description]
	 * @private
	 */
	constructor(projectId, masterKey, settings) {
		this._api = new Api();
		this._serverTime = 0;
		this._subscriptionManager = new SubscriptionManager(this._api);
		this.openProject(projectId, masterKey, settings);

		this._api.addListener('connect', () => {
			this._subscriptionManager.requestSubscriptions();
		});

		this._api.addListener('update', message => {
			let device = this.device(message.device);
			this._subscriptionManager.raise(message.id, device, message.changes);
		});

		this._api.addListener('disconnect', () => {
			this._subscriptionManager.invalidateSubscriptions();
		});

		setInterval(() => { this.fetchServerTime(); }, 30000);
		this.fetchServerTime();
	}


	static project(projectId, settings) {
		return new SkyGrid(projectId, settings);
	}

	/**
	 * Returns the last fetched server time.
	 * @returns {Date} The last fetched server time.
	 */
	get serverTime() {
		return this._serverTime;
	}

	/**
	 * Fetches the current server time from the server.
	 * @returns {Promise<Date, SkyGridException>} A promise that resolves to the fetched time.
	 */
	fetchServerTime() {
		return this._api.request('getServerTime').then(time => {
			this._serverTime = new Date(time);
			this._timeOffset = this._serverTime - new Date();
			return time;
		});
	}

	/**
	 * [openProject description]
	 * @param  {[type]} projectId [description]
	 * @param  {[type]} masterKey [description]
	 * @param  {[type]} settings  [description]
	 * @returns {[type]}           [description]
	 * @private
	 */
	openProject(projectId, masterKey, settings) {
		if (masterKey) {
			if (typeof masterKey === 'object') {
				settings = masterKey;
				masterKey = null;
			}
		}

		settings = settings || {};
		if (!settings.api) {
			settings.api = 'websocket';
		}

		if (!settings.address) {
			settings.address = API_URL;
		}

		this._projectId = projectId;
		this._masterKey = masterKey;
		this._subscriptions = {};

		this._api.setup(settings.address, settings.api, projectId, masterKey);
	}

	/**
	 * [switchProject description]
	 * @param  {[type]} projectId [description]
	 * @param  {[type]} masterKey [description]
	 * @param  {[type]} settings  [description]
	 * @returns {[type]}           [description]
	 * @private
	 */
	switchProject(projectId, masterKey, settings) {
		return this.closeProject().then(() => {
			this.openProject(projectId, masterKey, settings);
		});
	}

	/**
	 * Logs in as the specified user.
	 * @param  {string} email    Email of the user to log in as
	 * @param  {string} password Password of the user
	 * @returns {Promise}         A promise that resolves once the user has been logged in.
	 */
	login(email, password) {
		return this._api.request('login', { 
			email: email, 
			password: password
		}).then(userData => {
			this._user = {
				email: email,
				id: userData.userId,
				token: userData.token
			};
		});
	}

	/**
	 * [loginMaster description]
	 * @param  {[type]} masterKey [description]
	 * @returns {[type]}           [description]
	 * @private
	 */
	loginMaster(masterKey) {
		// NYI
	}

	/**
	 * Logs out the currently logged in user.
	 * @returns {Promise} A promise that resolves once the user has been logged out.
	 */
	logout() {
		return this._api.request('logout').then(() => {
			this._user = null;
		});
	}

	/**
	 * Signs up a new user to a project.
	 * @param  {string} email    Email address of the user,.
	 * @param  {string} password Password of the user.
	 * @param  {object} meta     Associated block of meta data to be associated with the user.
	 * @returns {Promise<User, SkyGridException>} A promise that resolves to the created User.
	 */
	signup(email, password, meta) {
		return this._api.request('signup', { 
			email: email, 
			password: password,
			meta: meta
		}).then(data => {
			return this.user(data.id).fetch();
		});
	}

	/**
	 * Gets the user with the specified user ID.
	 * @param  {string} userId The unique ID of the user.
	 * @returns {User} The user object associated with this ID.
	 */
	user(userId) {
		return new User(this._api, userId);
	}

	/**
	 * Finds users that adhere to the specified constraints.
	 * @param  {object}  [constraints] The constraints to apply to the search.
	 * @param  {Boolean} [fetch]	Determines whether the full user object should be fetched, or just the description.  Defaults to true.
	 * @returns {Promise<User, SkyGridException>} A promise that resolves to an array of all users that were found.
	 */
	users(constraints, fetch = true) {
		return this._api.request('findUsers', { 
			constraints: constraints,
			fetch: fetch
		}).then(users => {
			return users.map(item => {
				return this.user(item);
			});
		});
	}

	/**
	 * [addSchema description]
	 * @param {[type]} data [description]
	 * @private
	 */
	addSchema(data) {
		return this._api.request('addDeviceSchema', data).then(schema => {
			return this.schema(schema.id).fetch();
		});
	}

	/**
	 * Gets the schema with the specified user ID.
	 * @param  {string} schemaId The unique ID of the schema.
	 * @returns {Schema} The schema object associated with this ID.
	 */
	schema(schemaId) {
		return new Schema(this._api, schemaId);
	}

	/**
	 * Finds schemas that adhere to the specified constraints.
	 * @param  {object}  [constraints] The constraints to apply to the search.
	 * @param  {Boolean} [fetch]	Determines whether the full schema object should be fetched, or just the description.  Defaults to true.
	 * @returns {Promise<Schema, SkyGridException>} A promise that resolves to an array of all schemas that were found.
	 */
	schemas(constraints, fetch = true) {
		return this._api.request('findDeviceSchemas', { 
			constraints: constraints,
			fetch: fetch
		}).then(schemas => {
			return schemas.map(item => {
				return this.schema(item);
			});
		});
	}

	/**
	 * [addDevice description]
	 * @param {[type]} data [description]
	 * @private
	 */
	addDevice(data) {
		if (typeof data.schema === 'object') {
			data.schemaId = data.schema.id;
		} else {
			data.schemaId = data.schema;
		}

		delete data.schema;

		return this._api.request('addDevice', data).then(device => {
			return this.device(device.id).fetch();
		});
	}

	/**
	 * Gets the device with the specified user ID.
	 * @param  {string} deviceId The unique ID of the device.
	 * @returns {Device} The device object associated with this ID.
	 */
	device(deviceId) {
		return new Device({
			api: this._api,
			subscriptionManager: this._subscriptionManager
		}, deviceId);
	}

	/**
	 * Finds devices that adhere to the specified constraints.
	 * @param  {object}  [constraints] The constraints to apply to the search.
	 * @param  {Boolean} [fetch]	Determines whether the full device object should be fetched, or just the description.  Defaults to true.
	 * @returns {Promise<Device, SkyGridException>} A promise that resolves to an array of all devices that were found.
	 */
	devices(constraints, fetch = true) {
		return this._api.request('findDevices', { 
			constraints: constraints,
			fetch: fetch
		}).then(devices => {
			return devices.map(item => {
				return this.device(item);
			});
		});
	}

	subscribe(settings, callback) {
		this._subscriptionManager.addSubscription(settings, callback);
	}

	removeSubscriptions() {
		return this._subscriptionManager.removeSubscriptions();
	}

	closeProject() {
		return this.removeSubscriptions().then(() => {
			if (this._api) {
				//this._api.closeProject();
			}

			this._projectId = null;
			this._masterKey = null;
			this._user = null;
		});
	}

	close() {
		return this.closeProject().then(() => {
			this._api.close();
		});
	}
}