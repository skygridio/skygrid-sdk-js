/**
 * The error class used for all errors that are thrown in the SkyGrid SDK.
 */
export default class SkyGridException {
	/**
	 * Instantiates a new instance of an error.
	 * @param  {string} message The error description.
	 */
	constructor(message) {
		/**
		 * Error description.
		 * @type {string}
		 */
		this.message = message;
		// Use V8's native method if available, otherwise fallback
		if ('captureStackTrace' in Error) {
			Error.captureStackTrace(this, SkyGridException);
		} else {
			/**
			 * Stack trace.
			 * @type {string}
			 */
			this.stack = (new Error()).stack;
		}
	}
}