import SkyGridException from './SkyGridException';

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

		let sub = {
			settings: settings,
			callback: callback,
			active: false
		};

		return this._requestSubscription(sub);
	}

	removeSubscription(id) {

	}

	raise(id, device, changes) {
		let sub = this._subscriptions[id];
		if (sub) {
			sub.callback(device, changes);
		} else {
			throw new SkyGridException('Subscription not found');
		}
	}

	requestSubscriptions() {
		for (let id in this._subscriptions) {
			let sub = this._subscriptions[id];
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
		let promises = [];
		if (this._api) { 
			for (let subId in this._subscriptions) {
				let prom = this._api.request('unsubscribe', { subscriptionId: subId });
				promises.push(prom);
			}
		}

		return Promise.all(promises).then(() => {
			this._subscriptions = {};
		});
	}

	_requestSubscription(sub) {
		return this._api.request('subscribe', sub.settings).then(() => {
			sub.active = true;
			this._subscriptions[sub.settings.subscriptionId] = sub;
		});
	}
}