import SocketIoApi from './SocketIoApi';
import RestApi from './RestApi';
import Device from './Device';
import Schema from './Schema';
import User from './User';
import SubscriptionManager from './SubscriptionManager';
import SkyGridException from './SkyGridException';
import SkyGridObject from './SkyGridObject';
import * as Util from './Util';

const API_URL = process.env.SKYGRID_SERVER_ADDRESS || 'https://api.skygrid.io';

function parseSettings(settings) {
	settings = settings || {};
	if (!settings.api) {
		settings.api = 'socketio';
	}

	if (!settings.address) {
		settings.address = API_URL;
	}

	return settings;
}

/**
 * Represents a project in the SkyGrid system.
 */
export default class Project extends SkyGridObject {
	/**
	 * [constructor description]
	 * @param  {[type]} projectId [description]
	 * @param  {[type]} settings  [description]
	 * @return {[type]}           [description]
	 * @private
	 */
	constructor(projectId, settings) {
		super();

		settings = parseSettings(settings);

		switch (settings.api) {
			case 'rest': 
				this._api = new RestApi(settings.address, projectId);
				break;
			case 'socketio': 
				this._api = new SocketIoApi(settings.address, projectId);
				break;
		}

		this._projectId = projectId;
		this._serverTime = 0;

		this._subManager = new SubscriptionManager(this._api);
		this._subCallbacks = {};
		this._subCount = 0;
		this._serverSubId = null;

		this._data = { id: projectId };
		
		this._setupListeners();

		this._timeInterval = setInterval(() => { this.fetchServerTime(); }, 30000);
		this.fetchServerTime();
	}

	/**
	 * Gets the name of this project.
	 * @returns {string} The name of this project, if a name has been set.  Otherwise returns null.
	 */
	get name() {
		this._getProperty('name');
	}

	get allowSignup() {
		this._getProperty('allowSignup');
	}

	set allowSignup(value) {
		this._setProperty('allowSignup', value);
	}

	/**
	 * Gets the Access-Control-List (ACL) associated with this project.
	 * @returns {Acl} The ACL associated with this project.
	 */
	get acl() {
		this._getAclProperty();
	}

	/**
	 * Sets the Access-Control-List (ACL) associated with this project.
	 * @param {object|Acl} value - The ACL object.
	 */
	set acl(value) {
		this._setAclProperty(value);
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
	 * [loginMaster description]
	 * @param  {string} masterKey [description]
	 * @returns {[type]}           [description]
	 * @private
	 */
	loginMaster(masterKey) {
		return this._api.request('loginMaster', {
			masterKey: masterKey
		});
	}

	/**
	 * Logs in as the specified user.
	 * @param  {string} email    Email of the user to log in as
	 * @param  {string} password Password of the user
	 * @returns {Promise}        A promise that resolves once the user has been logged in.
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
	 * @param  {object}  [constraints] 	The constraints to apply to the search.
	 * @param  {Boolean} [fetch]		Determines whether the full user object should be fetched, or just the description.  Defaults to true.
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
	 * @param  {object}  [constraints] 	The constraints to apply to the search.
	 * @param  {Boolean} [fetch]		Determines whether the full schema object should be fetched, or just the description.  Defaults to true.
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
			subscriptionManager: this._subManager
		}, deviceId);
	}

	/**
	 * Finds devices that adhere to the specified constraints.
	 * @param  {object}  [constraints] 	The constraints to apply to the search.
	 * @param  {Boolean} [fetch]		Determines whether the full device object should be fetched, or just the description.  Defaults to true.
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

	/**
	 * Fetches the current state of this project.
	 * @returns {Promise<Project, SkyGridException>} A promise that resolves to this instance of the project.
	 *
	 * @example
	 * project.fetch().then(() => {
	 *	   // Project state has been successfully fetched
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	fetch() {
		return this._fetch('fetchProject', { 
			deviceId: this.id 
		});
	}

	/**
	 * Saves the changes that have been made to the project to the SkyGrid server.
	 * @returns {Promise<Project, SkyGridException>} A promise that resolves to this instance of the project.
	 */
	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridException('Can only edit users when using the master key');
		}

		return this._saveChanges({
			default: {
				projectId: this.id
			},
			requestName: 'updateProject',
			fields: ['allowSignup'],
			hasAcl: true
		});
	}

	/**
	 * Subscribes to all changes made to devices belonging to this project via the SkyGrid back end.
	 *   
	 * NOTE: Subscribing is currently only available when using socket based communication methods.
	 * 
	 * @param  {Function} [callback] Optional callback that is raised when an update is received.
	 * @returns {Promise<Number, SkyGridException>} A promise that resolves to the ID of the subscription.
	 *
	 * @example
	 * device.subscribe();
	 *
	 * @example
	 * project.subscribe((device, changes) => {
	 *     changes.map(change => {
	 *         console.log(change, device.get(change));
	 *     });
	 * });
	 */
	subscribe(settings, callback) {
		return Promise.resolve().then(() => {
			if (this._serverSubId === null) {
				return this._subManager.addSubscription({
					projectId: this.id
				}, 
				(changes, device) => {
					for (let key in this._subCallbacks) {
						const subCallback = this._subCallbacks[key];
						subCallback(changes, device);
					}
				}).then(serverSubId => {
					this._serverSubId = serverSubId;
				});
			}
		}).then(() => {
			const id = this._subCount++;
			this._subCallbacks[id] = callback;
			return id;
		});
	}

	/**
	 * Unsubscribes the specified ID or callback from this project.
	 * If no ID or callback is specified, all subscriptions are removed.
	 * @param  {Number|Function} [id] The unique ID returned by subscribe(), or the callback passed to subscribe() 
	 * @return {Promise} A promise that resolves once the subscription has been removed.
	 */
	unsubscribe(id) {
		if (id) {
			if (typeof id === 'function') {
				id = this._findSubId(id);
				if (id === null) {
					throw new SkyGridException('Subscription does not exist');
				}
			}

			if (this._subCallbacks[id] === undefined) {
				throw new SkyGridException('Subscription does not exist');
			} 

			delete this._subCallbacks[id];
		} else {
			this._subCallbacks = {};
		}

		if (Util.objectEmpty(this._subCallbacks)) {
			return this._subManager.removeSubscription(this._subId).then(() => {
				this._subId = null;
			});
		}

		return Promise.resolve();
	}

	unsubscribeAll(id) {
		return this._subManager.removeSubscriptions();
	}

	close() {
		return this.removeSubscriptions().then(() => {
			return this._api.close();
		}).then(() => {
			clearInterval(this._timeInterval);
			this._projectId = null;
			this._user = null;
			this._timeInterval = null;
		});
	}

	_setupListeners() {
		this._api.on('connect', () => {
			this._subManager.requestSubscriptions();
		});

		this._api.on('update', message => {
			const device = this.device(message.device);
			this._subManager.raise(message.id, message.changes, device);
		});

		this._api.on('disconnect', () => {
			this._subManager.invalidateSubscriptions();
		});
	}
}