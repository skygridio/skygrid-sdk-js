import Acl from './Acl';
import * as Util from './Util';
import SkyGridObject from './SkyGridObject';

/**
 * Represents a device schema in the SkyGrid system.
 */
export default class Schema extends SkyGridObject {
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

		super();

		this._api = api;
		this._changeDefaults = { properties: {} };

		if (typeof data === 'object') {
			this._data = data;
			this._fetched = !!data.properties;
		} 
		else if (typeof data === 'string') {
			this._data = { id: data, properties: {} };
		} else {
			throw new Error('Schema data is of an unknown type');
		}
	}

	/**
	 * Sets the name of this schema.
	 * @param {string} value - The name of the schema.
	 */
	get name() {
		this._getProperty('name');
	}

	/**
	 * Sets the name of this schema.
	 * @param {string} value - The name of the schema.
	 */
	set name(value) {
		this._setProperty('name');
	}

	/**
	 * Gets the description of this schema.
	 * @returns {string} Description of the schema.
	 */
	get description() {
		this._getProperty('description');
	}

	/**
	 * Sets the description of this schema.
	 * @param {string} value Description of the schema
	 * @returns {void}
	 */
	set description(value) {
		this._setProperty('description');
	}

	/**
	 * Gets the Access-Control-List (ACL) associated with this schema.
	 * @returns {Acl} The ACL associated with this schema.
	 * @private
	 */
	get acl() {
		return this._getAclProperty();
	}

	/**
	 * Sets the Access-Control-List (ACL) associated with this schema.
	 * @param {object|Acl} value The ACL object.
	 */
	set acl(value) {
		this._setAclProperty(value);
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
		this._changes.properties[name] = null;
		this._changed = true;
	}

	/**
	 * Saves all changes that have been made since the last save.
	 * @returns {Promise<Schema, SkyGridException>} A promise that resolves to this instance of the schema.
	 * @private
	 */
	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridException('Can only edit schemas when using the master key');
		}

		return this._saveChanges({
			default: {
				schemaId: this.id
			},
			requestName: 'updateDeviceSchema',
			fields: ['name', 'description', 'properties'],
			hasAcl: true
		});
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
		return this._fetch('fetchDeviceSchema', { 
			schemaId: this.id 
		});
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
}