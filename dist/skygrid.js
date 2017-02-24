(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PUBLIC_KEY = '*';

function validateAccessType(accessType) {
	switch (accessType) {
		case 'create':
		case 'read':
		case 'update':
		case 'delete':
		case 'deviceKey':
			return;
	}

	throw new Error('Access type \'' + accessType + '\' invalid, must be one of the following: create, read, update, delete');
}

var Acl = function () {
	function Acl(data) {
		_classCallCheck(this, Acl);

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

	_createClass(Acl, [{
		key: 'setAccess',
		value: function setAccess(userId, accessType, allowed) {
			var _this = this;

			if (typeof accessType === 'string') {
				this._setAccess(userId, accessType, allowed);
			} else if (accessType instanceof Array) {
				accessType.map(function (item) {
					_this._setAccess(userId, item, allowed);
				});
			}
		}
	}, {
		key: 'setPublicAccess',
		value: function setPublicAccess(accessType, allowed) {
			this.setAccess(PUBLIC_KEY, accessType, allowed);
		}
	}, {
		key: 'getAccess',
		value: function getAccess(userId, accessType) {
			return this._getAccess(userId, accessType);
		}
	}, {
		key: 'getPublicAccess',
		value: function getPublicAccess(accessType) {
			return this._getAccess(PUBLIC_KEY, accessType);
		}
	}, {
		key: 'removeAccess',
		value: function removeAccess(userId, accessType) {
			var _this2 = this;

			if (typeof accessType === 'string') {
				this._removeAccess(userId, accessType);
			} else if (accessType instanceof Array) {
				accessType.map(function (item) {
					_this2._removeAccess(userId, item);
				});
			}
		}
	}, {
		key: 'removePublicAccess',
		value: function removePublicAccess(accessType) {
			this.removeAccess(PUBLIC_KEY, accessType);
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return Util.deepClone(this._permissionsById);
		}
	}, {
		key: '_setAccess',
		value: function _setAccess(userId, accessType, allowed) {
			validateAccessType(accessType);

			if (userId.id) {
				userId = userId.id;
			}

			if (typeof userId !== 'string') {
				throw new TypeError('userId must be a string.');
			}

			if (allowed === null) {
				allowed = undefined;
			} else if (typeof allowed !== 'boolean') {
				throw new TypeError('allowed must be either true or false.');
			}

			var permissions = this._permissionsById[userId];
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
	}, {
		key: '_getAccess',
		value: function _getAccess(userId, accessType) {
			validateAccessType(accessType);

			if (userId.id) {
				userId = userId.id;
			}

			var permissions = this._permissionsById[userId];
			if (!permissions) {
				return null;
			}

			return permissions[accessType];
		}
	}, {
		key: '_removeAccess',
		value: function _removeAccess(userId, accessType) {
			var acl = this._permissionsById[userId];
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
	}, {
		key: 'permissions',
		get: function get() {
			return this._permissionsById;
		}
	}, {
		key: 'isEmpty',
		get: function get() {
			return Util.objectEmpty(this._permissionsById);
		}
	}]);

	return Acl;
}();

exports.default = Acl;


},{"./Util":15}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @private
 */
var Api = function (_EventEmitter) {
  _inherits(Api, _EventEmitter);

  function Api() {
    _classCallCheck(this, Api);

    return _possibleConstructorReturn(this, (Api.__proto__ || Object.getPrototypeOf(Api)).apply(this, arguments));
  }

  return Api;
}(_EventEmitter3.default);

exports.default = Api;


},{"./EventEmitter":5}],3:[function(require,module,exports){
(function (global){
'use strict';

var _SkyGrid = require('./SkyGrid');

var _SkyGrid2 = _interopRequireDefault(_SkyGrid);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

var _Acl = require('./Acl');

var _Acl2 = _interopRequireDefault(_Acl);

var _WebSocketApi = require('./WebSocketApi');

var _WebSocketApi2 = _interopRequireDefault(_WebSocketApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//require('es6-promise').polyfill();

global.SkyGrid = _SkyGrid2.default;
global.Acl = _Acl2.default;
global.SkyGridError = _SkyGridError2.default;
global.WebSocketApi = _WebSocketApi2.default;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Acl":1,"./SkyGrid":9,"./SkyGridError":10,"./WebSocketApi":16}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SkyGridObject2 = require('./SkyGridObject');

var _SkyGridObject3 = _interopRequireDefault(_SkyGridObject2);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

var _Acl = require('./Acl');

var _Acl2 = _interopRequireDefault(_Acl);

var _Schema = require('./Schema');

var _Schema2 = _interopRequireDefault(_Schema);

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** 
 * Represents a device in the SkyGrid system.
 */
var Device = function (_SkyGridObject) {
	_inherits(Device, _SkyGridObject);

	/**
  * Create a device instance.  This should NEVER be called by the user.
  * To get actual device instances, use SkyGrid.device() or one of the find() functions.
  * @param {SkyGridApi} api - The API interface used to get device data from the SkyGrid servers.
  * @param {object} data - The data that represents this device.
  * @private
  */
	function Device(api, data) {
		_classCallCheck(this, Device);

		if (!data) {
			throw new Error('No device data/ID supplied');
		}

		var _this = _possibleConstructorReturn(this, (Device.__proto__ || Object.getPrototypeOf(Device)).call(this));

		_this._api = api.api;
		_this._subManager = api.subscriptionManager;
		_this._subCallbacks = {};
		_this._subCount = 0;
		_this._serverSubId = null;

		_this._changeDefaults = { properties: {} };
		_this._fetched = false;
		_this.discardChanges();

		if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
			Util.fixDataDates(data);
			_this._data = data;
			_this._fetched = !!data.properties;
		} else if (typeof data === 'string') {
			_this._data = { id: data, properties: {} };
		}
		return _this;
	}

	/**
  * Gets the name of this device.
  * @returns {string} The name of this device, if a name has been set.  Otherwise returns null.
  */


	_createClass(Device, [{
		key: 'set',


		/**
   * Sets the given property name to the specified value.
   * @param {string} name - The name of the property to set.
   * @param {number|string|boolean} value - The value to set the property to.
   * @returns {void}
   */
		value: function set(name, value) {
			this._changes.properties[name] = value;
			this._changed = true;
		}

		/**
   * Gets the value of the specified property.
   * @param {string} name - The name of the property to get.
   * @returns {number|string|boolean} The value of the specified property.  Returns null if the property does not exist or has not been set.
   */

	}, {
		key: 'get',
		value: function get(name) {
			if (this._changes.properties.hasOwnProperty(name)) {
				return this._changes.properties[name];
			}

			if (this.propertyExists(name)) {
				return this._data.properties[name];
			}

			// TODO: Log warning
			return null;
		}

		/**
   * Returns a value determining whether the specified property exists.
   * @param  {string}   name - The name of the property to check for.
   * @returns {boolean}  A value determining whether the specified property exists.
   */

	}, {
		key: 'propertyExists',
		value: function propertyExists(name) {
			return this._data.properties.hasOwnProperty(name);
		}

		/**
   * Saves the changes that have been made to the device to the SkyGrid server.
   * @param 	{object}	properties 	[An optional table of properties to set when saving.]
   * @returns {Promise<Device, SkyGridError>} A promise that resolves to this instance of the device.
   */

	}, {
		key: 'save',
		value: function save(properties) {
			if (properties) {
				for (var key in properties) {
					this._changes.properties[key] = properties[key];
					this._changed = true;
				}
			}

			return this._saveChanges({
				default: {
					deviceId: this.id
				},
				requestName: 'device.update',
				fields: ['name', 'log', 'properties'],
				hasAcl: true
			});
		}

		/**
   * Fetches the current state of this device.
   * @returns {Promise<Device, SkyGridError>} A promise that resolves to this instance of the device.
   *
   * @example
   * device.fetch().then(() => {
   *	   // Device state has been successfully fetched
   * }).catch(err => {
   *     // Handle errors here
   * });
   */

	}, {
		key: 'fetch',
		value: function fetch() {
			var _this2 = this;

			return this._fetch('device.get', {
				deviceId: this.id
			}).then(function () {
				Util.fixDataDates(_this2._data);
				return _this2;
			});
		}

		/**
   * Retreives the logged history of this device.  Each history record stores the entire
   * state of the device at the time it is logged.
   * 
   * NOTE: The 'log' attribute on this device must be set to true to start logging history.
   * 
   * @param  {Date} 	[start] The start date to retrieve data from.
   * @param  {Date} 	[end]   The end date to retrieve data to.
   * @param  {Number}	[limit] The total numer of records to return.
   * @returns {Promise<object[], SkyGridError>} A promise that resolves to an array of records found within the given constraints.
   *
   * @example
   * device.history(startDate, endDate).then(results => {
   *     results.map(result => {
   *         // result.time
   *         // result.properties
   *     });
   * });
   */

	}, {
		key: 'history',
		value: function history(start, end, limit) {
			var data = { deviceId: this.id };
			var constraints = {};

			if (start) {
				if (typeof start === 'string') {
					start = new Date(start);
				}

				if (start instanceof Date) {
					constraints.time = { $gte: start };
				} else if ((typeof start === 'undefined' ? 'undefined' : _typeof(start)) == 'object') {
					constraints = start;
				}
			}

			if (end) {
				if (typeof end === 'string') {
					end = new Date(end);
				}

				if (end instanceof Date) {
					if (!constraints.time) {
						constraints.time = {};
					}

					constraints.time.$lt = end;
				}
			}

			data.constraints = constraints;

			if (limit) {
				if (typeof limit !== 'number') {
					limit = parseInt(limit);
				}

				data.limit = limit;
			}

			return this._api.request('device.history', data).then(function (res) {
				res.map(function (item) {
					item.time = new Date(item.time);
				});
				return res;
			});
		}

		/**
   * Removes this device from the SkyGrid server.
   * 
   * NOTE: This is permanent and cannot be reversed so use with caution!
   * 
   * @returns {Promise} A promise that resolves when the device has been deleted.
   *
   * @example
   * device.remove().then(() => {
   *     // Device removed
   * }).catch(err => {
   *     // Handle errors here
   * });
   */

	}, {
		key: 'remove',
		value: function remove() {
			return this._api.request('device.delete', { deviceId: this.id });
		}

		/**
   * Subscribes to all changes made to this device via the SkyGrid back end.
   * This function works in 2 ways:
   * - Firstly, the device this is called on is constantly kept up to date with the changes
   *   that it receives.
   * - Secondly, an optional callback can be passed to this method, which gets called
   *   every time a new update is received.
   *   
   * NOTE: Subscribing is currently only available when using socket based communication methods.
   * 
   * @param  {Function} [callback] Optional callback that is raised when an update is received.
   * @returns {Promise<Number, SkyGridError>} A promise that resolves to the ID of the subscription.
   *
   * @example
   * device.subscribe();
   *
   * @example
   * device.subscribe((device, changes) => {
   *     changes.map(change => {
   *         console.log(change, device.get(change));
   *     });
   * });
   *
   * @example
   * function printChanges(device, changes) {
   *     console.log(change, device.get(change));
   * }
   *
   * device.subscribe(printChanges);
   */

	}, {
		key: 'subscribe',
		value: function subscribe(callback) {
			var _this3 = this;

			return Promise.resolve().then(function () {
				if (_this3._serverSubId === null) {
					return _this3._subManager.addSubscription({
						deviceId: _this3.id
					}, function (changes, device) {
						_this3._data = device._data;
						_this3._fetched = true;

						for (var key in _this3._subCallbacks) {
							var subCallback = _this3._subCallbacks[key];
							subCallback(changes, _this3);
						}
					}).then(function (serverSubId) {
						_this3._serverSubId = serverSubId;
					});
				}
			}).then(function () {
				var id = _this3._subCount++;
				_this3._subCallbacks[id] = callback;
				return id;
			});
		}

		/**
   * Unsubscribes the specified ID or callback from this device.
   * If no ID or callback is specified, all subscriptions are removed.
   * @param  {Number|Function} [id] The unique ID returned by subscribe(), or the callback passed to subscribe() 
   * @return {Promise} A promise that resolves once the subscription has been removed.
   */

	}, {
		key: 'unsubscribe',
		value: function unsubscribe(id) {
			var _this4 = this;

			if (id) {
				if (typeof id === 'function') {
					id = this._findSubId(id);
					if (id === null) {
						throw new _SkyGridError2.default('Subscription does not exist');
					}
				}

				if (this._subCallbacks[id] === undefined) {
					throw new _SkyGridError2.default('Subscription does not exist');
				}

				delete this._subCallbacks[id];
			} else {
				this._subCallbacks = {};
			}

			if (Util.objectEmpty(this._subCallbacks)) {
				return this._subManager.removeSubscription(this._serverSubId).then(function () {
					_this4._serverSubId = null;
				});
			}

			return Promise.resolve();
		}

		/**
   * Finds the subscription ID associated with the specified callback function.
   * @param  {Function} 	callback 	The callback function to search for
   * @return {number|null} 	The ID of the subscription.  Returns null if no subscription is found.
   */

	}, {
		key: '_findSubId',
		value: function _findSubId(callback) {
			for (var id in this._subCallbacks) {
				if (this._subCallbacks[id] === callback) {
					return id;
				}
			}

			return null;
		}
	}, {
		key: 'name',
		get: function get() {
			return this._getDataProperty('name');
		}

		/**
   * Sets the name of this device.
   * @param {string} value - The name of the device.
   */
		,
		set: function set(value) {
			this._setDataProperty('name', value);
		}

		/**
   * Gets the Access-Control-List (ACL) associated with this device.
   * @returns {Acl} The ACL associated with this device.
   */

	}, {
		key: 'acl',
		get: function get() {
			if (!this._changes.acl) {
				if (this._data.acl) {
					this._changes.acl = new _Acl2.default(this._data.acl);
				} else {
					this._changes.acl = new _Acl2.default();
				}

				this._changed = true;
			}

			return this._changes.acl;
		}

		/**
   * Sets the Access-Control-List (ACL) associated with this device.
   * @param {object|Acl} value - The ACL object.
   */
		,
		set: function set(value) {
			if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
				if (!(value instanceof _Acl2.default)) {
					value = new _Acl2.default(value);
				}
			}

			this._setDataProperty('acl', value);
		}

		/**
   * Gets a value determining whether logging is enabled for this device.
   * @returns {boolean} True if logging is currently enabled.
   */

	}, {
		key: 'log',
		get: function get() {
			return this._getDataProperty('log');
		}

		/**
   * Sets a value determining whether logging is enabled for this device.
   * @param {boolean} value - True to enable logging.
   */
		,
		set: function set(value) {
			this._setDataProperty('log', value);
		}

		/**
   * Gets the unique ID of the schema related to this device.
   * @returns {id} The ID of the schema.
   */

	}, {
		key: 'schemaId',
		get: function get() {
			return this._data.schemaId;
		}

		/**
   * Gets the schema related to this device
   * @returns {Schema} The schema.
   */

	}, {
		key: 'schema',
		get: function get() {
			return new _Schema2.default(this._api, this.schemaId);
		}

		/**
   * Gets a Map of properties and their values.  This map is a copy of the internal
   * state, and as a result changes will not be reflected on the Device object.
   * @returns {Map<string,any>} A map of properties and their values
   *
   * @example
   * for (let [key, value] of device.properties) {
   *     console.log(key + ' = ' + value);
   * }
   */

	}, {
		key: 'properties',
		get: function get() {
			var ret = new Map();
			for (var key in this._data.properties) {
				ret.set(key, this._data.properties[key]);
			}

			for (var _key in this._changes.properties) {
				ret.set(_key, this._changes.properties[_key]);
			}

			return ret;
		}
	}]);

	return Device;
}(_SkyGridObject3.default);

exports.default = Device;


},{"./Acl":1,"./Schema":8,"./SkyGridError":10,"./SkyGridObject":11,"./Util":15}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = function EventEmitter() {
	_classCallCheck(this, EventEmitter);
};

exports.default = EventEmitter;


},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SubscriptionManager = require('./SubscriptionManager');

var _SubscriptionManager2 = _interopRequireDefault(_SubscriptionManager);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

var _SkyGridObject2 = require('./SkyGridObject');

var _SkyGridObject3 = _interopRequireDefault(_SkyGridObject2);

var _WebSocketApi = require('./WebSocketApi');

var _WebSocketApi2 = _interopRequireDefault(_WebSocketApi);

var _RestApi = require('./RestApi');

var _RestApi2 = _interopRequireDefault(_RestApi);

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _Schema = require('./Schema');

var _Schema2 = _interopRequireDefault(_Schema);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var API_URL = null || 'https://api.skygrid.io';
var SOCKETIO_URL = undefined || 'https://api.skygrid.io:81';

function parseSettings(settings) {
	settings = settings || {};
	if (!settings.api) {
		settings.api = 'websocket';
	}

	if (!settings.address) {
		settings.address = API_URL;
	}

	if (settings.api === 'websocket' && !Util.hasWebSocketsupport()) {
		settings.api = 'rest';
	}

	return settings;
}

/**
 * Represents a project in the SkyGrid system.
 */

var Project = function (_SkyGridObject) {
	_inherits(Project, _SkyGridObject);

	/**
  * Create a project instance.  This should NEVER be called by the user.
  * To get actual project instances, use SkyGrid.project().
  * @param {string} 		projectId 	The ID of the project we wish to interact with.
  * @param {object} 		settings 	The data that represents this device.
  * @private
  */
	function Project(projectId, settings) {
		_classCallCheck(this, Project);

		var _this = _possibleConstructorReturn(this, (Project.__proto__ || Object.getPrototypeOf(Project)).call(this));

		settings = parseSettings(settings);

		switch (settings.api) {
			case 'rest':
				_this._api = new _RestApi2.default(settings.address, projectId);
				break;
			case 'websocket':
				_this._api = new _WebSocketApi2.default(settings.address, projectId);
				break;
			default:
				throw new _SkyGridError2.default('Unsupported api type ' + settings.api);
		}

		_this._projectId = projectId;
		_this._serverTime = 0;

		_this._subManager = new _SubscriptionManager2.default(_this._api);
		_this._subCallbacks = {};
		_this._subCount = 0;
		_this._serverSubId = null;
		_this._user = null;

		_this._data = { id: projectId };

		_this._setupListeners();

		_this._timeInterval = setInterval(function () {
			_this.fetchServerTime();
		}, 30000);
		_this.fetchServerTime();
		return _this;
	}

	/**
  * Gets the name of this project.
  * @returns {string} The name of this project, if a name has been set.  Otherwise returns null.
  */


	_createClass(Project, [{
		key: 'fetchServerTime',


		/**
   * Fetches the current server time from the server.
   * @returns {Promise<Date, SkyGridError>} A promise that resolves to the fetched time.
   */
		value: function fetchServerTime() {
			var _this2 = this;

			return this._api.request('getServerTime').then(function (time) {
				_this2._serverTime = new Date(time);
				_this2._timeOffset = _this2._serverTime - new Date();
				return time;
			});
		}

		/**
   * Logs in as the master (super) user.
   * @param  {string} 	masterKey 	The master key for this project.
   * @returns {Promise<void, SkyGridError>} A promise that resolves once the master user has logged in.
   * @private
   */

	}, {
		key: 'loginMaster',
		value: function loginMaster(masterKey) {
			return this._api.request('session.loginMaster', {
				masterKey: masterKey
			});
		}

		/**
   * Logs in as the specified user.
   * @param  {string} 	email    	Email of the user to log in as
   * @param  {string} 	password 	Password of the user
   * @returns {Promise<void, SkyGridError>} 	A promise that resolves once the user has been logged in.
   */

	}, {
		key: 'login',
		value: function login(email, password) {
			var _this3 = this;

			return this._api.request('session.loginUser', {
				email: email,
				password: password
			}).then(function (userData) {
				_this3._user = {
					email: email,
					id: userData.userId,
					token: userData.token
				};
			});
		}

		/**
   * Logs out the currently logged in user.
   * @returns {Promise<void, SkyGridError>} A promise that resolves once the user has been logged out.
   */

	}, {
		key: 'logout',
		value: function logout() {
			var _this4 = this;

			return this._api.request('session.logout').then(function () {
				_this4._user = null;
			});
		}

		/**
   * Signs up a new user to a project.
   * @param  {string} email    Email address of the user,.
   * @param  {string} password Password of the user.
   * @param  {object} meta     Associated block of meta data to be associated with the user.
   * @returns {Promise<User, SkyGridError>} A promise that resolves to the created User's id.
   */

	}, {
		key: 'signup',
		value: function signup(email, password, meta) {
			return this._api.request('user.add', {
				email: email,
				password: password,
				meta: meta
			}).then(function (data) {
				return data.id;
			});
		}

		/**
   * Gets the user with the specified user ID.
   * @param  {string} userId The unique ID of the user.
   * @returns {User} The user object associated with this ID.
   */

	}, {
		key: 'user',
		value: function user(userId) {
			return new _User2.default(this._api, userId);
		}

		/**
   * Finds users that adhere to the specified constraints.
   * @param  {object}  [constraints] 	The constraints to apply to the search.
   * @param  {Boolean} [fetch]		Determines whether the full user object should be fetched, or just the description.  Defaults to true.
   * @returns {Promise<User[], SkyGridError>} A promise that resolves to an array of all users that were found.
   */

	}, {
		key: 'users',
		value: function users(constraints) {
			var _this5 = this;

			var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			return this._api.request('user.find', {
				constraints: constraints,
				fetch: fetch
			}).then(function (users) {
				return users.map(function (item) {
					return _this5.user(item);
				});
			});
		}

		/**
   * Adds a Schema to the associated project
   * @param {string} name			name of the schema
   * @param {object} properties 	properties of this schema
   */

	}, {
		key: 'addSchema',
		value: function addSchema(name) {
			var _this6 = this;

			var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			return this._api.request('schema.add', {
				name: name,
				properties: properties
			}).then(function (schema) {
				return _this6.schema(schema.id).fetch();
			});
		}

		/**
   * Gets the schema with the specified user ID.
   * @param  {string} schemaId The unique ID of the schema.
   * @returns {Schema} The schema object associated with this ID.
   */

	}, {
		key: 'schema',
		value: function schema(schemaId) {
			return new _Schema2.default(this._api, schemaId);
		}

		/**
   * Finds schemas that adhere to the specified constraints.
   * @param  {object}  [constraints] 	The constraints to apply to the search.
   * @param  {Boolean} [fetch]		Determines whether the full schema object should be fetched, or just the description.  Defaults to true.
   * @returns {Promise<Schema[], SkyGridError>} A promise that resolves to an array of all schemas that were found.
   */

	}, {
		key: 'schemas',
		value: function schemas(constraints) {
			var _this7 = this;

			var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			return this._api.request('schema.find', {
				constraints: constraints,
				fetch: fetch
			}).then(function (schemas) {
				return schemas.map(function (item) {
					return _this7.schema(item);
				});
			});
		}

		/**
   * [addDevice description]
   * @param {string} name	name of the device
   * @param {string, object} 
   * @returns {Promise<Device, SkyGridError>} [description]
   * @private
   */

	}, {
		key: 'addDevice',
		value: function addDevice(name, schema) {
			var _this8 = this;

			if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && typeof schema.id === 'string') {
				schema = schema.id;
			}

			if (typeof schema === 'string') {
				return this._api.request('device.add', {
					name: name,
					schemaId: schema
				}).then(function (device) {
					return _this8.device(device.id).fetch();
				});
			} else {
				throw new _SkyGridError2.default('Invalid schema');
			}
		}

		/**
   * Gets the device with the specified user ID.
   * @param  {string} deviceId The unique ID of the device.
   * @returns {Device} The device object associated with this ID.
   */

	}, {
		key: 'device',
		value: function device(deviceId) {
			return new _Device2.default({
				api: this._api,
				subscriptionManager: this._subManager
			}, deviceId);
		}

		/**
   * Finds devices that adhere to the specified constraints.
   * @param  {object}  [constraints] 	The constraints to apply to the search.
   * @param  {Boolean} [fetch]		Determines whether the full device object should be fetched, or just the description.  Defaults to true.
   * @returns {Promise<Device[], SkyGridError>} A promise that resolves to an array of all devices that were found.
   */

	}, {
		key: 'devices',
		value: function devices(constraints) {
			var _this9 = this;

			var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			return this._api.request('device.find', {
				constraints: constraints,
				fetch: fetch
			}).then(function (devices) {
				return devices.map(function (item) {
					return _this9.device(item);
				});
			});
		}

		/**
   * Fetches the current state of this project.
   * @returns {Promise<Project, SkyGridError>} A promise that resolves to this instance of the project.
   *
   * @example
   * project.fetch().then(() => {
   *	   // Project state has been successfully fetched
   * }).catch(err => {
   *     // Handle errors here
   * });
   */

	}, {
		key: 'fetch',
		value: function fetch() {
			return this._fetch('project.get', {
				projectId: this.id
			});
		}

		/**
   * Saves the changes that have been made to the project to the SkyGrid server.
   * @returns {Promise<Project, SkyGridError>} A promise that resolves to this instance of the project.
   */

	}, {
		key: 'save',
		value: function save() {
			if (!this._api._masterKey) {
				throw new _SkyGridError2.default('Can only edit projects when using the master key');
			}

			return this._saveChanges({
				default: {
					projectId: this.id
				},
				requestName: 'project.update',
				fields: ['allowSignup', 'meta'],
				hasAcl: true
			});
		}

		/**
   * Subscribes to all changes made to devices belonging to this project via the SkyGrid back end.
   *   
   * NOTE: Subscribing is currently only available when using socket based communication methods.
   *
   * @param {object} 		[settings] 	Optional additional settings that determine how the subscription is handled (currently unused).
   * @param {function} 	callback 	Callback that is raised when an update is received.
   * @returns {Promise<Number, SkyGridError>} A promise that resolves to the ID of the subscription.
   *
   * @example
   * device.subscribe();
   *
   * @example
   * project.subscribe((device, changes) => {
   *     changes.map(change => {
   *         console.log(change, device.get(change));
   *     });
   * });
   */

	}, {
		key: 'subscribe',
		value: function subscribe(settings, callback) {
			var _this10 = this;

			if (!callback) {
				callback = settings;
			}

			return Promise.resolve().then(function () {
				if (_this10._serverSubId === null) {
					return _this10._subManager.addSubscription({
						projectId: _this10.id
					}, function (changes, device) {
						for (var key in _this10._subCallbacks) {
							var subCallback = _this10._subCallbacks[key];
							subCallback(changes, device);
						}
					}).then(function (serverSubId) {
						_this10._serverSubId = serverSubId;
					});
				}
			}).then(function () {
				var id = _this10._subCount++;
				_this10._subCallbacks[id] = callback;
				return id;
			});
		}

		/**
   * Unsubscribes the specified ID or callback from this project.
   * If no ID or callback is specified, all subscriptions are removed.
   * @param  {number|function} [id] The unique ID returned by subscribe(), or the callback passed to subscribe() 
   * @return {Promise} A promise that resolves once the subscription has been removed.
   */

	}, {
		key: 'unsubscribe',
		value: function unsubscribe(id) {
			var _this11 = this;

			if (id) {
				if (typeof id === 'function') {
					id = this._findSubId(id);
					if (id === null) {
						throw new _SkyGridError2.default('Subscription does not exist');
					}
				}

				if (this._subCallbacks[id] === undefined) {
					throw new _SkyGridError2.default('Subscription does not exist');
				}

				delete this._subCallbacks[id];
			} else {
				this._subCallbacks = {};
			}

			if (Util.objectEmpty(this._subCallbacks)) {
				return this._subManager.removeSubscription(this._subId).then(function () {
					_this11._subId = null;
				});
			}

			return Promise.resolve();
		}
	}, {
		key: 'unsubscribeAll',
		value: function unsubscribeAll() {
			return this._subManager.removeSubscriptions();
		}
	}, {
		key: 'requestPasswordReset',
		value: function requestPasswordReset(email) {
			return this._api.request('user.requestPasswordReset', {
				email: email
			});
		}
	}, {
		key: 'resetPassword',
		value: function resetPassword(email, resetToken, password) {
			return this._api.request('user.resetPassword', {
				email: email,
				resetToken: resetToken,
				password: password
			});
		}

		/**
   * Closes this project and removes all previously created subscriptions.
   * @return {Promise<void, SkyGridError>} A promises that resolves once the project has been closed.
   */

	}, {
		key: 'close',
		value: function close() {
			var _this12 = this;

			return this.unsubscribeAll().then(function () {
				return _this12._api.close();
			}).then(function () {
				clearInterval(_this12._timeInterval);
				_this12._projectId = null;
				_this12._user = null;
				_this12._timeInterval = null;
				_this12._data = null;
				_this12._changes = null;
			});
		}
	}, {
		key: '_setupListeners',
		value: function _setupListeners() {
			var _this13 = this;

			this._api.on('connect', function () {
				_this13._subManager.requestSubscriptions();
			});

			this._api.on('update', function (message) {
				var device = _this13.device(message.device);
				_this13._subManager.raise(message.id, message.changes, device);
			});

			this._api.on('disconnect', function () {
				_this13._subManager.invalidateSubscriptions();
			});
		}
	}, {
		key: 'name',
		get: function get() {
			return this._getDataProperty('name');
		}

		/** 
   * Gets a value that determines whether this project allows users to sign up.
   * @return {boolean} A value that determines whether users can sign up.
   */

	}, {
		key: 'allowSignup',
		get: function get() {
			return this._getDataProperty('allowSignup');
		}

		/**
   * Sets a value that determines whether this project allows users to sign up.
   * @param  {boolean} 	value 	A value that determines whether users can sign up.
   * @return {void} 	
   */
		,
		set: function set(value) {
			this._setDataProperty('allowSignup', value);
		}

		/**
   * Gets the Access-Control-List (ACL) associated with this project.
   * @returns {Acl} The ACL associated with this project.
   */

	}, {
		key: 'acl',
		get: function get() {
			return this._getAclProperty();
		}

		/**
   * Sets the Access-Control-List (ACL) associated with this project.
   * @param {object|Acl} value - The ACL object.
   */
		,
		set: function set(value) {
			this._setAclProperty(value);
		}

		/**
   * Gets the meta data block for this project.
   * @return {object} The meta data block for this project.
   */

	}, {
		key: 'meta',
		get: function get() {
			return this._getDataProperty('meta');
		}

		/**
   * Sets ths meta data block for this project.
   * @param  {object} value		The meta data block to associate with this project.
   * @return {void}
   */
		,
		set: function set(value) {
			this._setDataProperty('meta', value);
		}

		/**
   * Returns the last fetched server time.
   * @returns {Date} The last fetched server time.
   */

	}, {
		key: 'serverTime',
		get: function get() {
			return this._serverTime;
		}
	}]);

	return Project;
}(_SkyGridObject3.default);

exports.default = Project;


},{"./Device":4,"./RestApi":7,"./Schema":8,"./SkyGridError":10,"./SkyGridObject":11,"./SubscriptionManager":13,"./User":14,"./Util":15,"./WebSocketApi":16}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Api2 = require('./Api');

var _Api3 = _interopRequireDefault(_Api2);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//require('isomorphic-fetch');

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	var error = new Error(response.statusText);
	error.response = response;
	throw error;
}

function parseJSON(response) {
	if (response.status !== 204) {
		return response.json();
	}

	return {};
}

function generateQueryUrl(url, queries) {
	if (queries) {
		url += '?where=' + encodeURIComponent(JSON.stringify(queries));
	}
	return url;
}

/**
 * @private
 */

var RestApi = function (_Api) {
	_inherits(RestApi, _Api);

	function RestApi(address, projectId) {
		_classCallCheck(this, RestApi);

		var _this = _possibleConstructorReturn(this, (RestApi.__proto__ || Object.getPrototypeOf(RestApi)).call(this));

		_this._address = address;
		_this._projectId = projectId;
		_this._masterKey = null;
		_this._token = null;

		_this._endPoints = {
			signup: function signup(data) {
				return _this._fetchJson('/users', { method: 'post', body: data });
			},

			login: function login(data) {
				return _this._fetchJson('/login', {
					method: 'post',
					body: data
				}).then(function (data) {
					_this._token = data.token;
					return data;
				});
			},

			loginMaster: function loginMaster(data) {
				_this._masterKey = data.masterKey;
				return Promise.resolve();
			},

			logout: function logout() {
				return _this._fetchJson('/logout', { method: 'post' });
			},

			fetchUser: function fetchUser(data) {
				return _this._fetchJson('/users/' + data.userId, { method: 'get' });
			},

			findUsers: function findUsers(data) {
				var url = generateQueryUrl('/users', data.constraints);
				return _this._fetchJson(url, { method: 'get' });
			},

			deleteUser: function deleteUser(data) {
				return _this._fetchJson('/users/' + data.userId, { method: 'delete' });
			},

			requestPasswordReset: function requestPasswordReset(data) {
				return _this._fetchJson('/users/requestPasswordReset', { method: 'post', body: data });
			},

			resetPassword: function resetPassword(data) {
				return _this._fetchJson('/users/resetPassword', { method: 'post', body: data });
			},

			fetchProject: function fetchProject(data) {
				return _this._fetchJson('/projects/' + data.projectId, { method: 'get' });
			},

			updateProject: function updateProject(data) {
				return _this._fetchJson('/projects/' + data.projectId, { method: 'put', body: data });
			},

			addDeviceSchema: function addDeviceSchema(data) {
				return _this._fetchJson('/schemas', { method: 'post', body: data });
			},

			findDeviceSchemas: function findDeviceSchemas(data) {
				var url = generateQueryUrl('/schemas', data.constraints);
				return _this._fetchJson(url, { method: 'get' });
			},

			fetchDeviceSchema: function fetchDeviceSchema(data) {
				return _this._fetchJson('/schemas/' + data.schemaId, { method: 'get' });
			},

			updateDeviceSchema: function updateDeviceSchema(data) {
				var schemaId = data.schemaId;
				delete data.schemaId;
				return _this._fetchJson('/schemas/' + schemaId, { method: 'put', body: data });
			},

			deleteDeviceSchema: function deleteDeviceSchema(data) {
				return _this._fetchJson('/schemas/' + data.schemaId, { method: 'delete' });
			},

			findDevices: function findDevices(data) {
				var url = generateQueryUrl('/devices', data.constraints);
				return _this._fetchJson(url, { method: 'get' });
			},

			addDevice: function addDevice(data) {
				return _this._fetchJson('/devices', { method: 'post', body: data });
			},

			fetchDevice: function fetchDevice(data) {
				return _this._fetchJson('/devices/' + data.deviceId, { method: 'get' });
			},

			updateDevice: function updateDevice(data) {
				var deviceId = data.deviceId;
				delete data.deviceId;
				return _this._fetchJson('/devices/' + deviceId, { method: 'put', body: data });
			},

			deleteDevice: function deleteDevice(data) {
				return _this._fetchJson('/devices/' + data.deviceId, { method: 'delete' });
			},

			fetchHistory: function fetchHistory(data) {
				return _this._fetchJson('/history/' + data.deviceId, { method: 'get' });
			},

			getServerTime: function getServerTime() {
				return _this._fetchJson('/time', { method: 'get' });
			}
		};
		return _this;
	}

	_createClass(RestApi, [{
		key: 'close',
		value: function close() {}
	}, {
		key: 'request',
		value: function request(name, data) {
			var ep = this._endPoints[name];
			if (ep) {
				return ep(data);
			}

			throw new _SkyGridError2.default('API end point \'' + name + '\' does not exist on the REST API');
		}
	}, {
		key: '_fetchJson',
		value: function _fetchJson(url, params) {
			if (!params.headers) {
				params.headers = {};
			}

			params.headers['Accept'] = 'application/json';
			params.headers['Content-Type'] = 'application/json';

			if (this._token) {
				params.headers['X-Access-Token'] = this._token;
			} else {
				if (this._masterKey) {
					params.headers['X-Master-Key'] = this._masterKey;
				}

				params.headers['X-Project-ID'] = this._projectId;
			}

			if (params.body) {
				params.body = JSON.stringify(params.body);
			}

			var fullUrl = this._address + url;
			return fetch(fullUrl, params).then(checkStatus).then(parseJSON);
		}
	}]);

	return RestApi;
}(_Api3.default);

exports.default = RestApi;


},{"./Api":2,"./SkyGridError":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SkyGridObject2 = require('./SkyGridObject');

var _SkyGridObject3 = _interopRequireDefault(_SkyGridObject2);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a device schema in the SkyGrid system.
 */
var Schema = function (_SkyGridObject) {
	_inherits(Schema, _SkyGridObject);

	/**
  * Create a schema instance.  This should NEVER be called by the user.
  * To get actual schema instances, use SkyGrid.schema() or one of the find() functions.
  * @param {SkyGridApi} 	api 	The API interface used to get device data from the SkyGrid servers.
  * @param {object} 		data 	The data that represents this device.
  * @private
  */
	function Schema(api, data) {
		_classCallCheck(this, Schema);

		if (!data) {
			throw new Error('No schema data/ID supplied');
		}

		var _this = _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).call(this));

		_this._api = api;
		_this._changeDefaults = { properties: {} };
		_this.discardChanges();

		if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
			_this._data = data;
			_this._fetched = !!data.properties;
		} else if (typeof data === 'string') {
			_this._data = { id: data, properties: {} };
		} else {
			throw new Error('Schema data is of an unknown type');
		}
		return _this;
	}

	/**
  * Sets the name of this schema.
  * @param {string} value - The name of the schema.
  */


	_createClass(Schema, [{
		key: 'addProperty',


		/**
   * Adds a new property to the schema.
   * @param {string} 	name   	The name of the property.
   * @param {object} 	type 	The type that details the content of the property.
   * @param {any} 	def 	The default value of the property.  Must be relational to the type!
   * @returns {void}
   * @private
   */
		value: function addProperty(name, type, def) {
			this._changes.properties[name] = {
				type: type,
				default: def
			};

			this._changed = true;
		}

		/**
   * Updates a property.
   * @param {string} 	name   	The name of the property.
   * @param {object}	type 	The type that details the content of the property.
   * @param {any} 	def 	The default value of the property.  Must be relational to the type!
   * @returns {void}
   * @private
   */

	}, {
		key: 'updateProperty',
		value: function updateProperty(name, type, def) {
			var prop = this._changes[name];
			if (prop) {
				if (type) {
					prop.type = type;
				}

				if (def) {
					prop.default = def;
				}

				this._changed = true;
			} else {
				throw new Error('Property \'' + name + '\' does not exist');
			}
		}

		/**
   * Gets a property.
   * @param  {string} name Name of the property to get.
   * @returns {object} An object containing the property details.
   */

	}, {
		key: 'getProperty',
		value: function getProperty(name) {
			if (this._changes.properties.hasOwnProperty(name)) {
				return this._changes.properties[name];
			}

			if (this._data.properties.hasOwnProperty(name)) {
				return this._data.properties[name];
			}

			// TODO: Log warning
			return null;
		}

		/**
   * Removes a property.
   * @param  {string} name The name of the property to remove
   * @returns {void}
   * @private
   */

	}, {
		key: 'removeProperty',
		value: function removeProperty(name) {
			this._changes.properties[name] = null;
			this._changed = true;
		}

		/**
   * Saves all changes that have been made since the last save.
   * @returns {Promise<Schema, SkyGridError>} A promise that resolves to this instance of the schema.
   * @private
   */

	}, {
		key: 'save',
		value: function save() {
			if (!this._api._masterKey) {
				throw new _SkyGridError2.default('Can only edit schemas when using the master key');
			}

			return this._saveChanges({
				default: {
					schemaId: this.id
				},
				requestName: 'updateDeviceSchema',
				fields: ['name', 'description', 'properties'],
				hasAcl: true
			});
		}

		/**
   * Fetches the schema from the SkyGrid backend.
   * @returns {Promise<Schema, SkyGridError>} A promise that resolves to this instance of the schema.
   *
   * @example
   * schema.fetch().then(() => {
   *	   // Schema state has been successfully fetched
   * }).catch(err => {
   *     // Handle errors here
   * });
   */

	}, {
		key: 'fetch',
		value: function fetch() {
			return this._fetch('fetchDeviceSchema', {
				schemaId: this.id
			});
		}

		/**
   * Removes this schema from the SkyGrid server.  Any devices that make use of this
   * schema will no longer have a schema associated with them.
   * 
   * NOTE: This is permanent and cannot be reversed so use with caution!
   * 
   * @returns {Promise} A promise that resolves when the schema has been deleted.
   *
   * @example
   * schema.remove().then(() => {
   *     // Schema removed
   * }).catch(err => {
   *     // Handle errors here
   * });
   *
   * @private
   */

	}, {
		key: 'remove',
		value: function remove() {
			return this._api.request('deleteDeviceSchema', { schemaId: this.id });
		}
	}, {
		key: 'name',
		get: function get() {
			return this._getDataProperty('name');
		}

		/**
   * Sets the name of this schema.
   * @param {string} value - The name of the schema.
   */
		,
		set: function set(value) {
			this._setDataProperty('name');
		}

		/**
   * Gets the Access-Control-List (ACL) associated with this schema.
   * @returns {Acl} The ACL associated with this schema.
   * @private
   */

	}, {
		key: 'acl',
		get: function get() {
			return this._getAclProperty();
		}

		/**
   * Sets the Access-Control-List (ACL) associated with this schema.
   * @param {object|Acl} value The ACL object.
   */
		,
		set: function set(value) {
			this._setAclProperty(value);
		}

		/**
   * Gets a Map of properties and their descriptors.  This map is a copy of the internal
   * state, and as a result changes will not be reflected on the Schema object.
   * @returns {Map<string,object>} A map of properties and their descriptors.
   *
   * @example
   * for (let [key, desc] of schema.properties) {
   *     console.log(key + " = " + JSON.stringify(desc));
   * }
   */

	}, {
		key: 'properties',
		get: function get() {
			var ret = new Map();
			for (var key in this._data.properties) {
				ret.set(key, this._data.properties[key]);
			}

			for (var _key in this._changes.properties) {
				ret.set(_key, this._changes.properties[_key]);
			}

			return ret;
		}
	}]);

	return Schema;
}(_SkyGridObject3.default);

exports.default = Schema;


},{"./SkyGridError":10,"./SkyGridObject":11}],9:[function(require,module,exports){
'use strict';

var Project = require('./Project');

exports.project = function (projectId, settings) {
	return new Project.default(projectId, settings);
};


},{"./Project":6}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The error class used for all errors that are thrown in the SkyGrid SDK.
 */
var SkyGridError =
/**
 * Instantiates a new instance of an error.
 * @param  {string} message The error description.
 */
function SkyGridError(message) {
	_classCallCheck(this, SkyGridError);

	/**
  * Error description.
  * @type {string}
  */
	this.message = message;
	// Use V8's native method if available, otherwise fallback
	if ('captureStackTrace' in Error) {
		Error.captureStackTrace(this, SkyGridError);
	} else {
		/**
   * Stack trace.
   * @type {string}
   */
		this.stack = new Error().stack;
	}
};

exports.default = SkyGridError;


},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Acl = require('./Acl');

var _Acl2 = _interopRequireDefault(_Acl);

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class for all objects that can be fetched from or persisted to the SkyGrid backend.
 * The fetch() and save() methods are to be overidden by child classes.
 */
var SkyGridObject = function () {
	function SkyGridObject() {
		_classCallCheck(this, SkyGridObject);

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


	_createClass(SkyGridObject, [{
		key: 'discardChanges',


		/**
   * Discards all changes that have been applied since the object was last saved.
   * @returns {void}
   */
		value: function discardChanges() {
			this._changes = Util.deepClone(this._changeDefaults);
			this._changed = false;
		}

		/**
   * Abstract save function to be overidden by child classes.  Saves any changes in this object
   * to the SkyGrid backend.
   * @returns {Promise<SkyGridObject, SkyGridError>} A promise that resolves to this instance of the object.
   * @private
   */

	}, {
		key: 'save',
		value: function save() {
			throw new Error('save not implemented for this object');
		}

		/**
   * Abstract fetch function to be overidden by child classes.  Fetches the current state of this object.
   * @returns {Promise<SkyGridObject, SkyGridError>} A promise that resolves to this instance of the object.
   * @private
   */

	}, {
		key: 'fetch',
		value: function fetch() {
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

	}, {
		key: 'fetchIfNeeded',
		value: function fetchIfNeeded() {
			if (this._fetched !== true) {
				return this.fetch();
			}

			return Promise.resolve(this);
		}
	}, {
		key: '_setDataProperty',
		value: function _setDataProperty(name, value) {
			this._changes[name] = value;
			this._changed = true;
		}
	}, {
		key: '_getDataProperty',
		value: function _getDataProperty(name) {
			if (this._changes.hasOwnProperty(name)) {
				return this._changes[name];
			}

			return this._data[name];
		}
	}, {
		key: '_getAclProperty',
		value: function _getAclProperty() {
			if (!this._changes.acl) {
				if (this._data.acl) {
					this._changes.acl = new _Acl2.default(this._data.acl);
				} else {
					this._changes.acl = new _Acl2.default();
				}

				this._changed = true;
			}

			return this._changes.acl;
		}
	}, {
		key: '_setAclProperty',
		value: function _setAclProperty(value) {
			if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
				if (!(value instanceof _Acl2.default)) {
					value = new _Acl2.default(value);
				}
			}

			this._setDataProperty('acl', value);
		}
	}, {
		key: '_saveChanges',
		value: function _saveChanges(changeDesc) {
			var _this = this;

			if (this._changed === true) {
				var changes = Util.prepareChanges(this._changes, changeDesc.default);

				return this._api.request(changeDesc.requestName, changes).then(function () {
					Util.mergeFields(_this._data, _this._changes, changeDesc.fields);
					if (changeDesc.hasAcl) {
						Util.mergeAcl(_this._data, _this._changes);
					}

					_this.discardChanges();

					return _this;
				});
			}

			return Promise.resolve(this);
		}
	}, {
		key: '_fetch',
		value: function _fetch(request, desc) {
			var _this2 = this;

			return this._api.request(request, desc).then(function (data) {
				_this2._data = data;
				_this2._fetched = true;
			}).then(function () {
				return _this2;
			});
		}
	}, {
		key: 'id',
		get: function get() {
			return this._data.id;
		}

		/**
   * Gets a value deteremining whether unsaved changes have been made to this object.
   * @returns {boolean} True if the object has changes.
   */

	}, {
		key: 'isDirty',
		get: function get() {
			return this._changed === true;
		}

		/**
   * Gets a value deteremining whether this object is complete (has been fetched from the server).
   * @returns {boolean} true if the object is complete, otherwise false.
   */

	}, {
		key: 'isComplete',
		get: function get() {
			return this._fetched === true;
		}
	}]);

	return SkyGridObject;
}();

exports.default = SkyGridObject;


},{"./Acl":1,"./Util":15}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SkyGridWebSocket = function (_EventEmitter) {
	_inherits(SkyGridWebSocket, _EventEmitter);

	function SkyGridWebSocket(address) {
		_classCallCheck(this, SkyGridWebSocket);

		var _this = _possibleConstructorReturn(this, (SkyGridWebSocket.__proto__ || Object.getPrototypeOf(SkyGridWebSocket)).call(this));

		_this._socket = new WebSocket(address);
		_this._reconnect = true;
		_this._requestId = 0;
		_this._requests = {};
		_this._requestQueue = [];

		_this._socket.onopen = function () {
			var len = _this._requestQueue.length;
			for (var i = 0; i < len; i++) {
				_this._requestQueue[i]();
			}

			_this._requestQueue = _this._requestQueue.splice(len, _this._requestQueue.length - len);
			_this.emit('connect');
		};

		_this._socket.onclose = function () {
			_this.emit('disconnect');
		};

		_this._socket.onmessage = function (e) {
			var data = JSON.parse(e.data);

			if (_this._requests.hasOwnProperty(data.requestId)) {
				var request = _this._requests[data.requestId];
				request(data);
				delete _this._requests[data.requestId];
			} else {
				_this.emit('update', data);
			}
		};

		_this._socket.onerror = function (error) {
			throw new Error(error);
		};
		return _this;
	}

	_createClass(SkyGridWebSocket, [{
		key: 'send',
		value: function send(message) {
			switch (this._socket.readyState) {
				case WebSocket.CONNECTING:
					return this._queueMessage(message);
				case WebSocket.CLOSING:
				case WebSocket.CLOSED:
					throw new Error('Websocket is closed');
			}

			return this._handleSend(message);
		}
	}, {
		key: 'close',
		value: function close() {
			this._requestQueue = [];

			this._reconnect = false;
			this._socket.close();
		}
	}, {
		key: '_queueMessage',
		value: function _queueMessage(message) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2._requestQueue.push(function () {
					_this2._handleSend(message).then(resolve).catch(reject);
				});
			});
		}
	}, {
		key: '_handleSend',
		value: function _handleSend(message) {
			var _this3 = this;

			message.requestId = this._requestId++;
			this._socket.send(JSON.stringify(message));

			return new Promise(function (resolve, reject) {
				_this3._requests[message.requestId] = function (response) {
					resolve(response);
				};
			});
		}
	}, {
		key: 'state',
		get: function get() {
			return this._socket.readyState;
		}
	}]);

	return SkyGridWebSocket;
}(_EventEmitter3.default);

exports.default = SkyGridWebSocket;


},{"./EventEmitter":5}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 */
var SubscriptionManager = function () {
	function SubscriptionManager(api) {
		_classCallCheck(this, SubscriptionManager);

		this._api = api;
		this._subscriptions = {};
		this._subscriptionCount = 0;
	}

	_createClass(SubscriptionManager, [{
		key: 'addSubscription',
		value: function addSubscription(settings, callback) {
			if (typeof settings === 'function') {
				callback = settings;
				settings = {};
			}

			settings.subscriptionId = this._subscriptionCount++;

			var sub = {
				settings: settings,
				callback: callback,
				active: false
			};

			return this._requestSubscription(sub);
		}
	}, {
		key: 'removeSubscription',
		value: function removeSubscription(id) {
			if (this._api) {
				return this._api.request('unsubscribe', { subscriptionId: id });
			}

			return Promise.reject();
		}
	}, {
		key: 'raise',
		value: function raise(id, changes, device) {
			var sub = this._subscriptions[id];
			if (sub) {
				sub.callback(changes, device);
			} else {
				throw new _SkyGridError2.default('Subscription not found');
			}
		}
	}, {
		key: 'requestSubscriptions',
		value: function requestSubscriptions() {
			for (var id in this._subscriptions) {
				var sub = this._subscriptions[id];
				if (sub.active === false) {
					this._requestSubscription(sub);
				}
			}
		}
	}, {
		key: 'invalidateSubscriptions',
		value: function invalidateSubscriptions() {
			for (var id in this._subscriptions) {
				this._subscriptions[id].active = false;
			}
		}
	}, {
		key: 'removeSubscriptions',
		value: function removeSubscriptions() {
			var _this = this;

			if (this._api) {
				var promises = [];
				for (var id in this._subscriptions) {
					promises.push(this.removeSubscription(id));
				}

				return Promise.all(promises).then(function () {
					_this._subscriptions = {};
				});
			}

			return Promise.reject();
		}
	}, {
		key: '_requestSubscription',
		value: function _requestSubscription(sub) {
			var _this2 = this;

			return this._api.request('subscribe', sub.settings).then(function () {
				sub.active = true;
				_this2._subscriptions[sub.settings.subscriptionId] = sub;
			}).then(function () {
				return sub.settings.subscriptionId;
			});
		}
	}]);

	return SubscriptionManager;
}();

exports.default = SubscriptionManager;


},{"./SkyGridError":10}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SkyGridObject2 = require('./SkyGridObject');

var _SkyGridObject3 = _interopRequireDefault(_SkyGridObject2);

var _SkyGridError = require('./SkyGridError');

var _SkyGridError2 = _interopRequireDefault(_SkyGridError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var User = function (_SkyGridObject) {
	_inherits(User, _SkyGridObject);

	function User(api, data) {
		_classCallCheck(this, User);

		var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this));

		_this._api = api;

		if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
			_this._data = data;
			_this._fetched = !!data.meta;
		} else if (typeof data === 'string') {
			_this._data = { id: data };
		}
		return _this;
	}

	_createClass(User, [{
		key: 'save',
		value: function save() {
			if (!this._api._masterKey) {
				throw new _SkyGridError2.default('Can only edit users when using the master key');
			}

			return this._saveChanges({
				default: {
					userId: this.id
				},
				requestName: 'updateUser',
				fields: ['email', 'meta']
			});
		}
	}, {
		key: 'fetch',
		value: function fetch() {
			return this._fetch('fetchUser', {
				userId: this.id
			});
		}
	}, {
		key: 'remove',
		value: function remove() {
			return this._api.request('deleteUser', { userId: this.id });
		}
	}, {
		key: 'email',
		get: function get() {
			return this._getDataProperty('email');
		},
		set: function set(value) {
			this._setDataProperty('email', value);
		}
	}, {
		key: 'meta',
		get: function get() {
			return this._getDataProperty('meta');
		},
		set: function set(value) {
			this._setDataProperty('meta', value);
		}
	}, {
		key: 'password',
		set: function set(value) {
			this._setDataProperty('password', value);
		}
	}]);

	return User;
}(_SkyGridObject3.default);

exports.default = User;


},{"./SkyGridError":10,"./SkyGridObject":11}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.objectEmpty = objectEmpty;
exports.deepClone = deepClone;
exports.mergeFields = mergeFields;
exports.mergeAcl = mergeAcl;
exports.prepareChanges = prepareChanges;
exports.fixDataDates = fixDataDates;
exports.hasWebSocketSupport = hasWebSocketSupport;
/**
 * Gets a value determining whether the specified object contains any keys.
 * @param {object} obj The object to check.
 * @returns {boolean} True if the object contains keys.
 * @private
 */
function objectEmpty(obj) {
	for (var key in obj) {
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
function deepClone(obj) {
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
function mergeFields(target, source, fields) {
	fields.map(function (fieldName) {
		var sourceField = source[fieldName];
		if (sourceField !== undefined) {
			if ((typeof sourceField === 'undefined' ? 'undefined' : _typeof(sourceField)) !== 'object') {
				target[fieldName] = sourceField;
			} else {
				var targetField = target[fieldName];
				for (var key in sourceField) {
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
function mergeAcl(data, changes) {
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
function prepareChanges(changes, ret) {
	for (var key in changes) {
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
function fixDataDates(data) {
	if (data.createdAt) {
		data.createdAt = new Date(data.createdAt);
	}

	if (data.updatedAt) {
		data.updatedAt = new Date(data.updatedAt);
	}
}

function hasWebSocketSupport() {
	return 'WebSocket' in window && window.WebSocket.CLOSING === 2;
}


},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SkyGridWebSocket = require('./SkyGridWebSocket');

var _SkyGridWebSocket2 = _interopRequireDefault(_SkyGridWebSocket);

var _Api2 = require('./Api');

var _Api3 = _interopRequireDefault(_Api2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var c_LoginMasterEndpoint = 'session.loginMaster';

var WebSocketApi = function (_Api) {
	_inherits(WebSocketApi, _Api);

	function WebSocketApi(address, projectId) {
		_classCallCheck(this, WebSocketApi);

		var _this = _possibleConstructorReturn(this, (WebSocketApi.__proto__ || Object.getPrototypeOf(WebSocketApi)).call(this, address, projectId));

		_this._address = address;
		_this._projectId = projectId;
		_this._session = false;
		_this._connected = false;
		_this._socket = null;
		_this._masterKey = null;

		_this._socket = new _SkyGridWebSocket2.default(address);
		return _this;
	}

	_createClass(WebSocketApi, [{
		key: 'close',
		value: function close() {
			this._socket.close();
			this._socket = null;

			this._session = false;
			this._connected = false;
			this._masterKey = null;
		}
	}, {
		key: 'request',
		value: function request(name, data) {
			var _this2 = this;

			if (name === c_LoginMasterEndpoint) {
				this._masterKey = data.masterKey;
			}

			if (this._session) {
				return this._makeRequest(name, data);
			}

			return this._makeRequest('session.create', {
				projectId: this._projectId
			}).then(function () {
				_this2._session = true;
				if (name !== c_LoginMasterEndpoint && _this2._masterKey) {
					return _this2._makeRequest(c_LoginMasterEndpoint, { masterKey: _this2._masterKey });
				}
			}).then(function () {
				return _this2._makeRequest(name, data);
			});
		}
	}, {
		key: '_makeRequest',
		value: function _makeRequest(name, data) {
			var request = {
				endpoint: name
			};

			if (data) {
				request.body = data;
			}

			return this._socket.send(request).then(function (response) {
				if (response.code >= 200 && response.code < 300) {
					return response.body || {};
				} else if (typeof response.body === 'string') {
					throw new SkyGridError(response.body);
				}
			});
		}
	}]);

	return WebSocketApi;
}(_Api3.default);

exports.default = WebSocketApi;


},{"./Api":2,"./SkyGridWebSocket":12}]},{},[3]);
