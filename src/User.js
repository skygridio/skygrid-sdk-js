import SkyGridObject from './SkyGridObject';

export default class User extends SkyGridObject {
	constructor(api, data) {
		super();

		this._api = api;

		if (typeof data === 'object') {
			this._data = data;
			this._fetched = !!data.meta;
		} 
		else if (typeof data === 'string') {
			this._data = { id: data };
		}
	}

	get email() {
		return this._getDataProperty('email');
	}

	set email(value) {
		this._setDataProperty('email', value);
	}

	get meta() {
		return this._getDataProperty('meta');
	}

	set meta(value) {
		this._setDataProperty('meta', value);
	}

	set password(value) {
		this._setDataProperty('password', value);
	}

	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridError('Can only edit users when using the master key');
		}

		return this._saveChanges({
			default: {
				userId: this.id
			},
			requestName: 'updateUser',
			fields: ['email', 'meta'],
		});
	}

	fetch() {
		return this._fetch('fetchUser', { 
			userId: this.id 
		});
	}

	remove() {
		return this._api.request('deleteUser', { userId: this.id });
	}
}