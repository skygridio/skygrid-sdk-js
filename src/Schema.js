import Acl from './Acl';
import * as Util from './Util';

/**
 * Represents a device schema in the SkyGrid system.
 */
export default class Schema {
	/**
	 * Create a schema instance.  This should NEVER be called by the user.
	 * To get actual schema instances, use SkyGrid.schema() or one of the find() functions.
	 * @param {SkyGridApi} api - The API interface used to get device data from the SkyGrid servers.
	 * @param {object} data - The data that represents this device.
	 * @private
	 */
	constructor(api, data) {
		if (!data) {
			throw new Error('No schema data/ID supplied');
		}

		this._api = api;
		this._data = data;

		this._changes = { properties: {} };
		this._fetched = false;
		this._changed = false;

		if (typeof data === 'object') {
			this._data = data;
			this._fetched = !!data.properties;
		} 
		else if (typeof data === 'string') {
			this._data = { id: data, properties: {} };
		}
	}

	/**
	 * Gets the unique ID of this schema.
	 * @returns {string} The unique ID of this schema.
	 */
	get id() {
		return this._data.id;
	}

	/**
	 * Sets the name of this schema.
	 * @param {string} value - The name of the schema.
	 */
	get name() {
		if (this._changes.name) {
			return this._changes.name;
		}

		return this._data.name;
	}

	/**
	 * Sets the name of this schema.
	 * @param {string} value - The name of the schema.
	 */
	set name(value) {
		this._changes.name = value;
		this._changed = true;
	}

	/**
	 * Gets the description of this schema.
	 * @returns {string} Description of the schema.
	 */
	get description() {
		if (this._changes.description) {
			return this._changes.description;
		}

		return this._data.description;
	}

	/**
	 * Sets the description of this schema.
	 * @param {string} value Description of the schema
	 * @returns {void}
	 */
	set description(value) {
		this._changes.description = value;
		this._changed = true;
	}

	/**
	 * Gets the Access-Control-List (ACL) associated with this schema.
	 * @returns {Acl} The ACL associated with this schema.
	 * @private
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
	 * Sets the Access-Control-List (ACL) associated with this schema.
	 * @param {object|Acl} value The ACL object.
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
	 * Gets a value deteremining whether this class is complete (has been fetched from the server).
	 * @returns {boolean} True if the schema has been fetched.
	 */
	get isComplete() {
		return this._fetched !== true;
	}

	/**
	 * Gets a value deteremining whether unsaved changes have been made to this schema.
	 * @returns {boolean} True if the schema has unsaved changes.
	 * @private
	 */
	get isDirty() {
		return this._changed === true;
	}

	/**
	 * Gets an array of strings that contains the names of all available properties.
	 * @returns {string[]} A string array of all property names.
	 */
	get properties() {
		const names = Object.keys(this._data.properties);
		for (let key in this._changes.properties) {
			names[key] = this._changes.properties[key];
		}

		return names;
	}

	/**
	 * Adds a new property to the schema.
	 * @param {string} name   The name of the property.
	 * @param {object} schema The schema that details the content of the property.
	 * @param {any} def    	  The default value of the property.  Must be relational to the schema!
	 * @returns {void}
	 * @private
	 */
	addProperty(name, schema, def) {
		this._changes.properties[name] = {
			schema: schema,
			default: def
		};

		this._changed = true;
	}

	/**
	 * Updates a property.
	 * @param {string} name   The name of the property.
	 * @param {object} schema The schema that details the content of the property.
	 * @param {any} def    	  The default value of the property.  Must be relational to the schema!
	 * @returns {void}
	 * @private
	 */
	updateProperty(name, schema, def) {
		let prop = this._changes[name];
		if (prop) {
			if (schema) {
				prop.schema = schema;
			}

			if (def) {
				prop.default = def;
			}

			this._changed = true;
		} else {
			throw new Error(`Property '${name}' does not exist`);
		}
	}

	/**
	 * Gets a property.
	 * @param  {string} name Name of the property to get.
	 * @returns {object} An object containing the property details.
	 */
	getProperty(name) {
		if (this._changes.properties.hasOwnProperty(name)) {
			return this._changes.properties[name];
		}

		if (this._data.properties.hasOwnProperty(name)) {
			return this._data.properties[name];
		}
		
		// TODO: Log warning
		return null;
	}

	/**
	 * Removes a property.
	 * @param  {string} name The name of the property to remove
	 * @returns {void}
	 * @private
	 */
	removeProperty(name) {
		this._changes[name] = null;
		this._changed = true;
	}

	/**
	 * Saves all changes that have been made since the last save.
	 * @returns {Promise<Schema, SkyGridException>} A promise that resolves to this instance of the schema.
	 * @private
	 */
	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridException('Can only edit users when using the master key');
		}

		if (this._changed === true) {
			let changes = Util.prepareChanges(this._changes, {
				schemaId: this.id
			});

			return this._api.request('updateDeviceSchema', changes).then(() => {
				Util.mergeFields(this._data, this._changes, ['name', 'description', 'properties']);
				Util.mergeAcl(this._data, this._changes);

				this._changes = { properties: {} };
				this._changed = false;

				return this;
			});
		}

		return Promise.resolve(this);
	}

	/**
	 * Fetches the schema from the SkyGrid backend.
	 * @returns {Promise<Schema, SkyGridException>} A promise that resolves to this instance of the schema.
	 *
	 * @example
	 * schema.fetch().then(() => {
	 *	   // Schema state has been successfully fetched
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 */
	fetch() {
		return this._api.request('fetchDeviceSchema', { 
			schemaId: this.id 
		}).then(data => {
			this._data = data;
			this._fetched = true;
			return this;
		});
	}

	/**
	 * Fetches the schema from the SkyGrid backend if it has not yet been fetched.
	 * @returns {Promise<Schema, SkyGridException>} A promise that resolves to this instance of the schema.
	 *
	 * @example
	 * schema.fetchIfNeeded().then(() => {
	 *	   // Schema state has been successfully fetched
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
	 * Removes this schema from the SkyGrid server.  Any devices that make use of this
	 * schema will no longer have a schema associated with them.
	 * 
	 * NOTE: This is permanent and cannot be reversed so use with caution!
	 * 
	 * @returns {Promise} A promise that resolves when the schema has been deleted.
	 *
	 * @example
	 * schema.remove().then(() => {
	 *     // Schema removed
	 * }).catch(err => {
	 *     // Handle errors here
	 * });
	 *
	 * @private
	 */
	remove() {
		return this._api.request('deleteDeviceSchema', { schemaId: this.id });
	}

	/**
	 * Discards all changes that have been applied since the schema was last saved.
	 * @returns {void}
	 * @private
	 */
	discardChanges() {
		this._changes = { properties: {} };
	}
}