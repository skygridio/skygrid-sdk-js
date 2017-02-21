/**
 * Gets a value determining whether the specified object contains any keys.
 * @param {object} obj The object to check.
 * @returns {boolean} True if the object contains keys.
 * @private
 */
export function objectEmpty(obj) {
	for (const key in obj) {
		return false;
	}

	return true;
}

/**
 * Creates a deep clone of the specified object.
 * NOTE: Does not correctly clone dates (they will be turned in to strings)
 * @param  {object} obj The object to clone
 * @return {object} The cloned instance of the object.
 * @private
 */
export function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * [mergeFields description]
 * @param  {[type]} target [description]
 * @param  {[type]} source [description]
 * @param  {[type]} fields [description]
 * @return {[type]}        [description]
 * @private
 */
export function mergeFields(target, source, fields) {
	fields.map(fieldName => {
		const sourceField = source[fieldName];
		if (sourceField !== undefined) {
			if (typeof sourceField !== 'object') {
				target[fieldName] = sourceField;
			} else {
				const targetField = target[fieldName];
				for (const key in sourceField) {
					targetField[key] = sourceField[key];
				}
			}
		}
	});
}

/**
 * [mergeAcl description]
 * @param  {[type]} data    [description]
 * @param  {[type]} changes [description]
 * @return {[type]}         [description]
 * @private
 */
export function mergeAcl(data, changes) {
	if (changes.acl !== undefined) {
		if (changes.acl !== null && !changes.acl.isEmpty()) {
			data.acl = changes.acl;
		} else {
			delete data.acl;
		}
	}
}

/**
 * [prepareChanges description]
 * @param  {[type]} changes [description]
 * @param  {[type]} ret     [description]
 * @return {[type]}         [description]
 * @private
 */
export function prepareChanges(changes, ret) {
	for (const key in changes) {
		if (key !== 'acl') {
			ret[key] = changes[key];
		} else if (changes.acl !== null) {
			ret.acl = changes.acl.toJSON();
		} else {
			ret.acl = null;
		}
	}

	return ret;
}

/**
 * [fixDataDates description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 * @private
 */
export function fixDataDates(data) {
	if (data.createdAt) {
		data.createdAt = new Date(data.createdAt);
	}

	if (data.updatedAt) {
		data.updatedAt = new Date(data.updatedAt);
	}
}

export function hasWebSocketSupport() {
	return 'WebSocket' in window && window.WebSocket.CLOSING === 2;
}