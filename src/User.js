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
		this._getProperty('email');
	}

	set email(value) {
		this._setProperty('email', value);
	}

	get meta() {
		this._getProperty('meta');
	}

	set meta(value) {
		this._setProperty('meta', value);
	}

	set password(value) {
		this._setProperty('password', value);
	}

	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridException('Can only edit users when using the master key');
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