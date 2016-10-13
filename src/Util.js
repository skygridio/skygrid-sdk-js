/**
 * @private
 */
export function objectEmpty(obj) {
	for (let key in obj) {
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
 * @private
 */
export function mergeFields(target, source, fields) {
	fields.map(fieldName => {
		let sourceField = source[fieldName];
		if (sourceField !== undefined) {
			if (typeof sourceField !== 'object') {
				target[fieldName] = sourceField;
			} else {
				let targetField = target[fieldName];
				for (let key in sourceField) {
					targetField[key] = sourceField[key];
				}
			}
		}
	});
}

/**
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
 * @private
 */
export function prepareChanges(changes, ret) {
	for (let key in changes) {
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