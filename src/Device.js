import Acl from './Acl';
import * as Util from './Util';

/** 
 * Represents a device in the SkyGrid system.
 */
export default class Device {
	/**
	 * Create a device instance.  This should NEVER be called by the user.
	 * To get actual device instances, use SkyGrid.device() or one of the find() functions.
	 * @param {SkyGridApi} api - The API interface used to get device data from the SkyGrid servers.
	 * @param {object} data - The data that represents this device.
	 * @private
	 */
	constructor(api, data) {
		if (!data) {
			throw new Error('No device data/ID supplied');
		}

		this._api = api.api;
		this._subscriptionManager = api.subscriptionManager;

		this._changes = { properties: {} };
		this._fetched = false;
		this._changed = false;

		if (typeof data === 'object') {
			Util.fixDataDates(data);
			this._data = data;
			this._fetched = !!data.properties;
		} 
		else if (typeof data === 'string') {
			this._data = { id: data, properties: {} };
		}	
	}

	/**
	 * Gets the unique ID of this device.
	 * @returns {string} The unique ID of this device.
	 */
	get id() {
		return this._data.id;
	}

	/**
	 * Gets the name of this device.
	 * @returns {string} The name of this device, if a name has been set.  Otherwise returns null.
	 */
	get name() {
		if (this._changes.name) {
			return this._changes.name;
		}

		return this._data.name;
	}

	/**
	 * Sets the name of this device.
	 * @param {string} value - The name of the device.
	 */
	set name(value) {
		this._changes.name = value;
		this._changed = true;
	}

	/**
	 * Gets the Access-Control-List (ACL) associated with this device.
	 * @returns {Acl} The ACL associated with this device.
	 */
	get acl() {
		if (!this._changes.acl) {
			if (this._data.acl) {
				this._changes.acl = new Acl(this._data.acl);
			} else {
				this._changes.acl = new Acl();
			}

			this._changed = true;
		}

		return this._changes.acl;
	}

	/**
	 * Sets the Access-Control-List (ACL) associated with this device.
	 * @param {object|Acl} value - The ACL object.
	 */
	set acl(value) {
		if (value && typeof value === 'object') {
			if (!(value instanceof Acl)) {
				value = new Acl(value);
			}
		}

		this._changes.acl = value;
		this._changed = true;
	}

	/**
	 * Gets a value determining whether logging is enabled for this device.
	 * @returns {boolean} True if logging is currently enabled.
	 */
	get log() {
		if (this._changes.log) {
			return this._changes.log;
		}

		return this._data.log;
	}

	/**
	 * Sets a value determining whether logging is enabled for this device.
	 * @param {boolean} value - True to enable logging.
	 */
	set log(value) {
		this._changes.log = value;
		this._changed = true;
	}

	/**
	 * Gets a value deteremining whether this class is complete (has been fetched from the server).
	 * @returns {boolean} true if the device is complete, otherwise false.
	 */
	get isComplete() {
		return this._fetched !== true;
	}

	/**
	 * Gets a value deteremining whether unsaved changes have been made to this device.
	 * @returns {boolean} True if the device has changes.
	 */
	get isDirty() {
		return this._changed === true;
	}

	/**
	 * Gets the unique ID of the schema related to this device.
	 * @returns {id} The ID of the schema.
	 */
	get schemaId() {
		return this._data.schemaId;
	}

	/**
	 * Gets the schema related to this device
	 * @returns {Schema} The schema.
	 */
	get schema() {
		return new Schema(this._api, this.schemaId);
	}

	/**
	 * Gets a Map of properties and their values.  This map is a copy of the internal
	 * state, and as a result changes will not be reflected on the Device object.
	 * @returns {Map<string,any>} A map of properties and their values
	 *
	 * @example
	 * for (let [key, value] of device.properties) {
	 *     console.log(key + " = " + value);
	 * }
	 */
	get properties() {
		const ret = new Map();
		for (let key in this._data.properties) {
			ret.set(key, this._data.properties[key]);
		}

		for (let key in this._changes.properties) {
			ret.set(key, this._changes.properties[key]);
		}

		return ret;
	}

	/**
	 * Sets the given property name to the specified value.
	 * @param {string} name - The name of the property to set.
	 * @param {number|string|boolean} value - The value to set the property to.
	 * @returns {void}
	 */
	set(name, value) {
		this._changes.properties[name] = value;
		this._changed = true;
	}

	/**
	 * Gets the value of the specified property.
	 * @param {string} name - The name of the property to get.
	 * @returns {number|string|boolean} The value of the specified property.  Returns null if the property does not exist or has not been set.
	 */
	get(name) {
		if (this._changes.properties.hasOwnProperty(name)) {
			return this._changes.properties[name];
		}

		if (this.propertyExists(name)) {
			return this._data.properties[name];
		}
		
		// TODO: Log warning
		return null;
	}

	/**
	 * Returns a value determining whether the specified property exists.
	 * @param  {string}   name - The name of the property to check for.
	 * @returns {boolean}  A value determining whether the specified property exists.
	 */
	propertyExists(name) {
		return this._data.properties.hasOwnProperty(name);
	}

	/**
	 * Saves the changes that have been made to the device to the SkyGrid server.
	 * @param 	{object}	properties 	[An optional table of properties to set when saving.]
	 * @returns {Promise<Device, SkyGridException>} A promise that resolves to this instance of the device.
	 */
	save(properties) {
		if (properties) {
			for (let key in properties) {
				this._changes.properties[key] = properties[key];
				this._changed = true;
			}
		}

		if (this._changed === true) {
			let changes = Util.prepareChanges(this._changes, {
				deviceId: this.id
			});
			
			return this._api.request('updateDevice', changes).then(() => {
				Util.mergeFields(this._data, this._changes, ['name', 'log', 'properties']);
				Util.mergeAcl(this._data, this._changes);

				this._changes = { properties: {} };
				this._changed = false;

				return this;
			});
		}

		return Promise.resolve(this);
	}

	/**
	 * Fetches the current state of this device.
	 * @returns {Promise<Device, SkyGridException>} A promise that resolves to this instance of the device.
	 *
	 * @example
	 * device.fetch().then(() => {
	 *	   // Device state has been successfully fetched
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	fetch() {
		return this._api.request('fetchDevice', { 
			deviceId: this.id 
		}).then(data => {
			Util.fixDataDates(data);
			this._data = data;
			this._fetched = true;
			return this;
		});
	}

	/**
	 * Fetches the current state of this device if it has not been fetched yet.
	 * 
	 * NOTE: This will only fetch the device if it has not previously been fetched, and
	 * does not take in to account changes that have happened to the device since it was last fetched.
	 * 
	 * @returns {Promise<Device, SkyGridException>} A promise that resolves to this instance of the device.
	 *
	 * @example
	 * device.fetchIfNeeded().then(() => {
	 *	   // Device state has been successfully fetched
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	fetchIfNeeded() {
		if (this._fetched !== true) {
			return this.fetch();
		}

		return Promise.resolve(this);
	}

	/**
	 * Retreives the logged history of this device.  Each history record stores the entire
	 * state of the device at the time it is logged.
	 * 
	 * NOTE: The 'log' attribute on this device must be set to true to start logging history.
	 * 
	 * @param  {Date} 	[start] The start date to retrieve data from.
	 * @param  {Date} 	[end]   The end date to retrieve data to.
	 * @param  {Number}	[limit] The total numer of records to return.
	 * @returns {Promise<object[], SkyGridException>} A promise that resolves to an array of records found within the given constraints.
	 *
	 * @example
	 * device.history(startDate, endDate).then(results => {
	 *     results.map(result => {
	 *         // result.time
	 *         // result.properties
	 *     });
	 * });
	 */
	history(start, end, limit) {
		let data = { deviceId: this.id };
		let constraints = {};

		if (start) {
			if (typeof start === 'string') {
				start = new Date(start);
			}

			if (start instanceof Date) {
				constraints.time = { $gte: start };
			} 
			else if (typeof start == 'object') {
				constraints = start;
			}
		}

		if (end) {
			if (typeof end === 'string') {
				end = new Date(end);
			}

			if (end instanceof Date) {
				if (!constraints.time) {
					constraints.time = {};
				}

				constraints.time.$lt = end;
			}
		}

		data.constraints = constraints;

		if (limit) {
			if (typeof limit !== 'number') {
				limit = parseInt(limit);
			}

			data.limit = limit;
		}
		
		return this._api.request('fetchHistory', data).then(res => {
			res.map(item => { item.time = new Date(item.time); });
			return res;
		});
	}

	/**
	 * Removes this device from the SkyGrid server.
	 * 
	 * NOTE: This is permanent and cannot be reversed so use with caution!
	 * 
	 * @returns {Promise} A promise that resolves when the device has been deleted.
	 *
	 * @example
	 * device.remove().then(() => {
	 *     // Device removed
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	remove() {
		return this._api.request('deleteDevice', { deviceId: this.id });
	}

	/**
	 * Subscribes to all changes made to this device via the SkyGrid back end.
	 * This function works in 2 ways:
	 * - Firstly, the device this is called on is constantly kept up to date with the changes
	 *   that it receives.
	 * - Secondly, an optional callback can be passed to this method, which gets called
	 *   every time a new update is received.
	 *   
	 * NOTE: Subscribing is currently only available when using the websocket communication method.
	 * 
	 * @param  {Function} [callback] Optional callback that is raised when an update is received.
	 * @returns {void}
	 *
	 * @example
	 * device.subscribe((device, changes) => {
	 *     changes.map(change => {
	 *         console.log(change, device.get(change));
	 *     });
	 * });
	 *
	 * @example
	 * function printChanges(device, changes) {
	 *     console.log(change, device.get(change));
	 * }
	 *
	 * device.subscribe(printChanges);
	 */
	subscribe(callback) {
		this._subscriptionManager.addSubscription({
			deviceId: this.id
		}, 
		(device, changes) => {
			this._data = device._data;
			this._fetched = true;

			if (callback) {
				callback(this, changes);
			}
		});
	}

	/**
	 * Discards all changes that have been applied since the device was last saved.
	 * @returns {void}
	 */
	discardChanges() {
		this._changes = { properties: {} };
	}
}