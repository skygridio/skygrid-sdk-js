import SkyGridError from './SkyGridError';

/**
 * @private
 */
export default class SubscriptionManager {
	constructor(api) {
		this._api = api;
		this._subscriptions = {};
		this._subscriptionCount = 0;
	}

	addSubscription(settings, callback) {
		if (typeof settings === 'function') {
			callback = settings;
			settings = {};
		}

		settings.subscriptionId = this._subscriptionCount++;

		const sub = {
			settings: settings,
			callback: callback,
			active: false
		};

		return this._requestSubscription(sub);
	}

	removeSubscription(id) {
		if (this._api) { 
			return this._api.request('unsubscribe', { subscriptionId: id });
		}

		return Promise.reject();
	}

	raise(id, changes, device) {
		const sub = this._subscriptions[id];
		if (sub) {
			sub.callback(changes, device);
		} else {
			throw new SkyGridError('Subscription not found');
		}
	}

	requestSubscriptions() {
		for (let id in this._subscriptions) {
			const sub = this._subscriptions[id];
			if (sub.active === false) {
				this._requestSubscription(sub);
			}
		}
	}

	invalidateSubscriptions() {
		for (let id in this._subscriptions) {
			this._subscriptions[id].active = false;
		}
	}

	removeSubscriptions() {
		if (this._api) { 
			const promises = [];
			for (let id in this._subscriptions) {
				promises.push(this.removeSubscription(subId));
			}

			return Promise.all(promises).then(() => {
				this._subscriptions = {};
			});
		}

		return Promise.reject();
	}

	_requestSubscription(sub) {
		return this._api.request('subscribe', sub.settings).then(() => {
			sub.active = true;
			this._subscriptions[sub.settings.subscriptionId] = sub;
		}).then(() => {
			return sub.settings.subscriptionId;
		});
	}
}