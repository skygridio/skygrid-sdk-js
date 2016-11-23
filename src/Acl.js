//import User from './User';
import * as Util from './Util';

const PUBLIC_KEY = '*';

function validateAccessType(accessType) {
	switch (accessType) {
		case 'create':
		case 'read':
		case 'update':
		case 'delete':
		case 'deviceKey':
			return;
	}

	throw new Error(`Access type '${accessType}' invalid, must be one of the following: create, read, update, delete`);
}

export default class Acl {
	constructor(data) {
		if (data) {
			if (data instanceof Acl) {
				this._permissionsById = Util.deepClone(data._permissionsById);
			} else {
				this._permissionsById = Util.deepClone(data);
			}
		} else {
			this._permissionsById = {};
		}
	}

	get permissions() {
		return this._permissionsById;
	}

	isEmpty() {
		return Util.objectEmpty(this._permissionsById);
	}

	setAccess(userId, accessType, allowed) {
		if (typeof accessType === 'string') {
			this._setAccess(userId, accessType, allowed);
		}
		else if (accessType instanceof Array) {
			accessType.map(item => {
				this._setAccess(userId, item, allowed);
			});
		}	
	}

	setPublicAccess(accessType, allowed) {
		this.setAccess(PUBLIC_KEY, accessType, allowed);
	}

	getAccess(userId, accessType) {
		return this._getAccess(userId, accessType);
	}

	getPublicAccess(accessType) {
		return this._getAccess(PUBLIC_KEY, accessType);
	}

	removeAccess(userId, accessType) {
		if (typeof accessType === 'string') {
			this._removeAccess(userId, accessType);
		}
		else if (accessType instanceof Array) {
			accessType.map(item => {
				this._removeAccess(userId, item);
			});
		}	
	}

	removePublicAccess(accessType) {
		this.removeAccess(PUBLIC_KEY, accessType);
	}

	toJSON() {
		return Util.deepClone(this._permissionsById);
	}

	_setAccess(userId, accessType, allowed) {
		validateAccessType(accessType);

		const User = require('./User');

		if (userId instanceof User) {
			userId = userId.id;
		}// else if (userId instanceof Role) {
			//userId = 'role:' + userId.getName();
		//}

		if (typeof userId !== 'string') {
			throw new TypeError('userId must be a string.');
		}

		if (allowed === null) {
			allowed = undefined;
		} else if (typeof allowed !== 'boolean') {
			throw new TypeError('allowed must be either true or false.');
		}

		let permissions = this._permissionsById[userId];
		if (!permissions) {
			if (allowed === undefined) {
				// The user already doesn't have this permission, so no action is needed
				return;
			} else {
				permissions = {};
				this._permissionsById[userId] = permissions;
			}
		}

		if (allowed !== undefined) {
			permissions[accessType] = allowed;
		} else {
			delete permissions[accessType];

			if (Util.objectEmpty(permissions)) {
				delete this._permissionsById[userId];
			}
		}
	}

	_getAccess(userId, accessType) {
		validateAccessType(accessType);

		const User = require('./User');

		if (userId instanceof User) {
			userId = userId.id;
		}/* else if (userId instanceof Role) {
			userId = 'role:' + userId.getName();
		}*/

		const permissions = this._permissionsById[userId];
		if (!permissions) {
			return null;
		}

		return permissions[accessType];
	}

	_removeAccess(userId, accessType) {
		const acl = this._permissionsById[userId];
		if (acl) {
			if (accessType) {
				validateAccessType(accessType);
				delete acl[accessType];
			}

			if (!accessType || Util.objectEmpty(acl)) {
				delete this._permissionsById[userId];
			}
		}
	}
}