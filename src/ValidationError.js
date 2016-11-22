/**
 * The error class used for all validation errors that are thrown in the SkyGrid SDK.
 */
export default class ValidationError {
	/**
	 * Instantiates a new instance of an error.
	 * @param  {string} data The error description.
	 */
	constructor(data) {
		this.data = data;
		this.message = '';
		this.html = '';

		for (const key in data) {
			for (let i = 0; i < data[key].length; i++) {
				this.message += `${key}: ${data[key][i]}\n`;
				this.html += `${key}: ${data[key][i]}<br />`;
			}
		}

		// Use V8's native method if available, otherwise fallback
		if ('captureStackTrace' in Error) {
			Error.captureStackTrace(this, ValidationError);
		} else {
			/**
			 * Stack trace.
			 * @type {string}
			 */
			this.stack = (new Error()).stack;
		}
	}
}