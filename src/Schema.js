import SkyGridObject from './SkyGridObject';
import SkyGridError from './SkyGridError';

/**
 * Represents a device schema in the SkyGrid system.
 */
export default class Schema extends SkyGridObject {
	/**
	 * Create a schema instance.  This should NEVER be called by the user.
	 * To get actual schema instances, use SkyGrid.schema() or one of the find() functions.
	 * @param {SkyGridApi} 	api 	The API interface used to get device data from the SkyGrid servers.
	 * @param {object} 		data 	The data that represents this device.
	 * @private
	 */
	constructor(api, data) {
		if (!data) {
			throw new Error('No schema data/ID supplied');
		}

		super();

		this._api = api;
		this._changeDefaults = { properties: {} };
		this.discardChanges();

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
		return this._getDataProperty('name');
	}

	/**
	 * Sets the name of this schema.
	 * @param {string} value - The name of the schema.
	 */
	set name(value) {
		this._setDataProperty('name');
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
	 * Gets a Map of properties and their descriptors.  This map is a copy of the internal
	 * state, and as a result changes will not be reflected on the Schema object.
	 * @returns {Map<string,object>} A map of properties and their descriptors.
	 *
	 * @example
	 * for (let [key, desc] of schema.properties) {
	 *     console.log(key + " = " + JSON.stringify(desc));
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
	 * Adds a new property to the schema.
	 * @param {string} 	name   	The name of the property.
	 * @param {object} 	type 	The type that details the content of the property.
	 * @param {any} 	def 	The default value of the property.  Must be relational to the type!
	 * @returns {void}
	 * @private
	 */
	addProperty(name, type, def) {
		this._changes.properties[name] = {
			type: type,
			default: def
		};

		this._changed = true;
	}

	/**
	 * Updates a property.
	 * @param {string} 	name   	The name of the property.
	 * @param {object}	type 	The type that details the content of the property.
	 * @param {any} 	def 	The default value of the property.  Must be relational to the type!
	 * @returns {void}
	 * @private
	 */
	updateProperty(name, type, def) {
		const prop = this._changes[name];
		if (prop) {
			if (type) {
				prop.type = type;
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
	 * @returns {Promise<Schema, SkyGridError>} A promise that resolves to this instance of the schema.
	 * @private
	 */
	save() {
		if (!this._api._masterKey) {
			throw new SkyGridError('Can only edit schemas when using the master key');
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
	 * @returns {Promise<Schema, SkyGridError>} A promise that resolves to this instance of the schema.
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