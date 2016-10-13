/**
 * @private
 */
export default function ValidationException(data) {
	this.data = data;
	this.message = '';
	this.html = '';

	for (let key in data) {
		for (var i = 0; i < data[key].length; i++) {
			this.message += `${key}: ${data[key][i]}\n`;
			this.html += `${key}: ${data[key][i]}<br />`;
		}
	}

	// Use V8's native method if available, otherwise fallback
	if ('captureStackTrace' in Error) {
		Error.captureStackTrace(this, ValidationException);
	} else {
		this.stack = (new Error()).stack;
	}
}

ValidationException.prototype = Object.create(Error.prototype);
ValidationException.prototype.name = 'ValidationException';
ValidationException.prototype.constructor = ValidationException;