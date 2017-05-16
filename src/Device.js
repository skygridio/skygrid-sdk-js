import SkyGridObject from './SkyGridObject';
import SkyGridError from './SkyGridError';

import Acl from './Acl';
import Schema from './Schema';

import * as Util from './Util';

/** 
 * Represents a device in the SkyGrid system.
 */
export default class Device extends SkyGridObject {
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

		super();

		this._api = api.api;
		this._subManager = api.subscriptionManager;
		this._subCallbacks = {};
		this._subCount = 0;
		this._serverSubId = null;

		this._changeDefaults = { properties: {} };
		this._fetched = false;
		this.discardChanges();

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
	 * Gets the name of this device.
	 * @returns {string} The name of this device, if a name has been set.  Otherwise returns null.
	 */
	get name() {
		return this._getDataProperty('name');
	}

	/**
	 * Sets the name of this device.
	 * @param {string} value - The name of the device.
	 */
	set name(value) {
		this._setDataProperty('name', value);
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

		this._setDataProperty('acl', value);
	}

	/**
	 * Gets a value determining whether logging is enabled for this device.
	 * @returns {boolean} True if logging is currently enabled.
	 */
	get log() {
		return this._getDataProperty('log');
	}

	/**
	 * Sets a value determining whether logging is enabled for this device.
	 * @param {boolean} value - True to enable logging.
	 */
	set log(value) {
		this._setDataProperty('log', value);
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
	 *     console.log(key + ' = ' + value);
	 * }
	 */
	get properties() {
		const ret = new Map();
		for (const key in this._data.properties) {
			ret.set(key, this._data.properties[key]);
		}

		for (const key in this._changes.properties) {
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
	 * @returns {Promise<Device, SkyGridError>} A promise that resolves to this instance of the device.
	 */
	save(properties) {
		if (properties) {
			for (const key in properties) {
				this._changes.properties[key] = properties[key];
				this._changed = true;
			}
		}

		return this._saveChanges({
			default: {
				deviceId: this.id
			},
			requestName: 'updateDevice',
			fields: ['name', 'log', 'properties'],
			hasAcl: true
		});
	}

	/**
	 * Fetches the current state of this device.
	 * @returns {Promise<Device, SkyGridError>} A promise that resolves to this instance of the device.
	 *
	 * @example
	 * device.fetch().then(() => {
	 *	   // Device state has been successfully fetched
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	fetch() {
		return this._fetch('fetchDevice', { 
			deviceId: this.id 
		}).then(() => {
			Util.fixDataDates(this._data);
			return this;
		});
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
	 * @returns {Promise<object[], SkyGridError>} A promise that resolves to an array of records found within the given constraints.
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
		const data = { deviceId: this.id };
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
	 * Retreives the aggregated history of a property of this device.  Each history record stores the entire
	 * state of the device at the time it is logged.
	 * 
	 * NOTE: The 'log' attribute on this device must be set to true, and the 'aggregate' property must be set
	 * to true on the property, to start logging aggregates.
	 * 
	 * @param  {String} [property] The property to retrieve the aggregate values
	 * @param  {String} [period] The aggregation type (hourly, daily, monthly)
	 * @returns {Promise<object[], SkyGridError>} A promise that resolves to an array of records found within the given constraints. 
	 */
	aggregate(property, period) {
		const validPeriods = ['hourly', 'daily', 'monthly'];
		const isValidPeriod = p => validPeriods.indexOf(p) > -1;

		if (!period) {
			period = validPeriods[0];
		}

		if (!isValidPeriod(period)) {
			throw new SkyGridError('Invalid aggregate period. Valid: ' + validPeriods);
		}

		// check property is valid
		if (!this.propertyExists(property)) {
			throw new SkyGridError('Property does not exist');
		}

		const data = {
			deviceId: this.id,
			property: property,
			aggregation: period
		};

		return this._api.request('fetchAggregate', data).then(res => {
			res.map(item => { 
				item.start = new Date(item.start);
				item.end = new Date(item.end);
			});
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
	 * NOTE: Subscribing is currently only available when using socket based communication methods.
	 * 
	 * @param  {Function} [callback] Optional callback that is raised when an update is received.
	 * @returns {Promise<Number, SkyGridError>} A promise that resolves to the ID of the subscription.
	 *
	 * @example
	 * device.subscribe();
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
		return Promise.resolve().then(() => {
			if (this._serverSubId === null) {
				return this._subManager.addSubscription({
					deviceId: this.id
				}, 
				(changes, device) => {
					this._data = device._data;
					this._fetched = true;

					for (const key in this._subCallbacks) {
						const subCallback = this._subCallbacks[key];
						subCallback(changes, this);
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
	 * Unsubscribes the specified ID or callback from this device.
	 * If no ID or callback is specified, all subscriptions are removed.
	 * @param  {Number|Function} [id] The unique ID returned by subscribe(), or the callback passed to subscribe() 
	 * @return {Promise} A promise that resolves once the subscription has been removed.
	 */
	unsubscribe(id) {
		if (id) {
			if (typeof id === 'function') {
				id = this._findSubId(id);
				if (id === null) {
					throw new SkyGridError('Subscription does not exist');
				}
			}

			if (this._subCallbacks[id] === undefined) {
				throw new SkyGridError('Subscription does not exist');
			}

			delete this._subCallbacks[id];
		} else {
			this._subCallbacks = {};
		}

		if (Util.objectEmpty(this._subCallbacks)) {
			return this._subManager.removeSubscription(this._serverSubId).then(() => {
				this._serverSubId = null;
			});
		}
		
		return Promise.resolve();
	}

	/**
	 * Finds the subscription ID associated with the specified callback function.
	 * @param  {Function} 	callback 	The callback function to search for
	 * @return {number|null} 	The ID of the subscription.  Returns null if no subscription is found.
	 */
	_findSubId(callback) {
		for (const id in this._subCallbacks) {
			if (this._subCallbacks[id] === callback) {
				return id;
			}
		}

		return null;
	}
}