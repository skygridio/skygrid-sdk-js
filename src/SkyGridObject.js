import Acl from './Acl';
import * as Util from './Util';

/**
 * Base class for all objects that can be fetched from or persisted to the SkyGrid backend.
 * The fetch() and save() methods are to be overidden by child classes.
 */
export default class SkyGridObject {
	constructor() {
		this._data = {};
		this._fetched = false;
		this._changes = {};
		this._changed = false;
		this._changeDefaults = {};
		this._api = null;
	}

	/**
	 * Gets the unique ID of this object.
	 * @returns {string} The unique ID of this object.
	 */
	get id() {
		return this._data.id;
	}

	/**
	 * Gets a value deteremining whether unsaved changes have been made to this object.
	 * @returns {boolean} True if the object has changes.
	 */
	get isDirty() {
		return this._changed === true;
	}

	/**
	 * Gets a value deteremining whether this object is complete (has been fetched from the server).
	 * @returns {boolean} true if the object is complete, otherwise false.
	 */
	get isComplete() {
		return this._fetched === true;
	}

	/**
	 * Discards all changes that have been applied since the object was last saved.
	 * @returns {void}
	 */
	discardChanges() {
		this._changes = Util.deepClone(this._changeDefaults);
		this._changed = false;
	}

	/**
	 * Abstract save function to be overidden by child classes.  Saves any changes in this object
	 * to the SkyGrid backend.
	 * @returns {Promise<SkyGridObject, SkyGridError>} A promise that resolves to this instance of the object.
	 * @private
	 */
	save() {
		throw new Error('save not implemented for this object');
	}

	/**
	 * Abstract fetch function to be overidden by child classes.  Fetches the current state of this object.
	 * @returns {Promise<SkyGridObject, SkyGridError>} A promise that resolves to this instance of the object.
	 * @private
	 */
	fetch() {
		throw new Error('fetch not implemented for this object');
	}

	/**
	 * Fetches the current state of this object if it has not been fetched yet.
	 * 
	 * NOTE: This will only fetch the object if it has not previously been fetched, and
	 * does not take in to account changes that have happened to the object since it was last fetched.
	 * 
	 * @returns {Promise<SkyGridObject, SkyGridError>} A promise that resolves to this instance of the object.
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

	_setDataProperty(name, value) {
		this._changes[name] = value;
		this._changed = true;
	}

	_getDataProperty(name) {
		if (this._changes.hasOwnProperty(name)) {
			return this._changes[name];
		}

		return this._data[name];
	}

	_getAclProperty() {
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

	_setAclProperty(value) {
		if (value && typeof value === 'object') {
			if (!(value instanceof Acl)) {
				value = new Acl(value);
			}
		}

		this._setDataProperty('acl', value);
	}

	_saveChanges(changeDesc) {
		if (this._changed === true) {
			const changes = Util.prepareChanges(this._changes, changeDesc.default);

			return this._api.request(changeDesc.requestName, changes).then(() => {
				Util.mergeFields(this._data, this._changes, changeDesc.fields);
				if (changeDesc.hasAcl) {
					Util.mergeAcl(this._data, this._changes);
				}

				this.discardChanges();
				
				return this;
			});
		}

		return Promise.resolve(this);
	}

	_fetch(request, desc) {
		return this._api.request(request, desc).then(data => {
			this._data = data;
			this._fetched = true;
		}).then(() => {
			return this;
		});
	}
}