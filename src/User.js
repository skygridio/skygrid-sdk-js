export default class User {
	constructor(api, data) {
		this._api = api;
		
		this._changes = {};
		this._fetched = false;
		this._changed = false;

		if (typeof data === 'object') {
			this._data = data;
			this._fetched = !!data.meta;
		} 
		else if (typeof data === 'string') {
			this._data = { id: data };
		}
	}

	get id() {
		return this._data.id;
	}

	get email() {
		if (this._changes.email) {
			return this._changes.email;
		}

		return this._data.email;
	}

	set email(value) {
		this._changes.email = value;
		this._changed = true;
	}

	get meta() {
		if (this._changes.meta) {
			return this._changes.meta;
		}

		return this._data.meta;
	}

	set meta(value) {
		this._changes.meta = value;
		this._changed = true;
	}

	set password(value) {
		this._changes.password = value;
		this._changed = true;
	}

	save() {
		if (this._api.usingMasterKey !== true) {
			throw new SkyGridException('Can only edit users when using the master key');
		}

		if (this._changed === true) {
			this._changes.userId = this.id;

			return this._api.request('updateUser', this._changes).then(() => {
				if (this._changes.email) {
					this._data.email = this._changes.email;
				}

				if (this._changes.meta) {
					this._data.meta = this._changes.meta;
				}

				this._changes = {};
				this._changed = false;

				return this;
			});
		}
		
		return Promise.resolve(this);
	}

	fetch() {
		return this._api.request('fetchUser', { 
			userId: this.id 
		}).then(data => {
			this._data = data;
			this._fetched = true;
			return this;
		});
	}

	fetchIfNeeded() {
		if (this._fetched !== true) {
			return this.fetch();
		}

		return Promise.resolve(this);
	}

	remove() {
		return this._api.request('deleteUser', { userId: this.id });
	}

	discardChanges() {
		this._changes = {};
	}
}