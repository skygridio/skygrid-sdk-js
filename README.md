#SkyGrid
An API for the physical world.

## Installation

NPM:
```
npm install --save skygrid
```

Bower:
```
bower install --save skygrid
```

CDN:
```
https://cdn.skygrid.io/sdk/js/skygrid-0.1.2.min.js
```

The SDK itself makes heavy use of ES6 Promises.  As a result of this to enable support in some browsers requires a polyfill,

## Usage

### Interacting with devices

The Device object allows us to fetch the current state of the device from the SkyGrid backend, to update the state of the device, and subscribe to changes to that device.

```javascript
var skygrid = require('skygrid');

// Get a Project object that lets us interact with a SkyGrid project.
var project = skygrid.project('94hfg93');

// Gets a Device object that lets us interact with a device.
var device = project.device('mjd93ngk');
```

### Fetching data

First we'll cover the fetching of device data.  This is simply done with the fetch() method.  It is an async method that returns a Promise.  If you are unfamiliar with ES6 promises in JavaScript, you can learn more about them here.
```javascript
device.fetch().then(() => {
	// Device state has been successfully fetched
}).catch(err => {
	// Handle errors here
});
```
There is also the fetchIfNeeded() method, which fetches data from the server if it has not yet been fetched.  Please note, however, this does not mean a device state will be fetched if it has previously been fetched and changed on the backend since this time.

### Setting data

Device properties can be set with the set() method, and retrieved with the get() method.  Any change made to a device instance is not pushed to the backend until the save() method is called.  

```javascript
device.set('speed', 100);
device.set('distance', 10);
device.save().then(device => {
	// Successfully saved
});
```
You can also directly set properties in the save method:
```javascript
device.save({
	speed: 100,
	distance: 10
});
```

Note that internally, all device changes are stored as a changeset until they are pushed to the server.  When accessing the Device instance locally, the changes will be returned when querying properties.  Changes can also be discarded any time before save() is called.
```javascript
var device = project.device('9fh9hfws');
device.get('speed'); // 100
device.set('speed', 10);
device.get('speed'); // 10
device.discardChanges();
device.get('speed'); // 100
```
### Subscribing to changes

Subscribing to a device allows us to receive changes in real time as they are received by the SkyGrid backend.  Once subscribe() is called on a device, that particular instance of the device is kept up to date.
```javascript
device.subscribe();
```

We can also pass a function to subscribe() that will get called every time an event is received.
```javascript
function logChanges(device, changes) {
	changes.map(function(change) {
		console.log(change + ': ' + device.get(change));
	});
}

device.subscribe(logChanges);
```
```javascript
var subId = device.subscribe(changes => {
	changes.map(change => {
		console.log(change + ': ' + device.get(change));
	});
});
```

### Removing subscriptions

You can use the unique subscription ID returned by subscribe() to remove a subscription, or you can remove all subscriptions at once.

```javascript
// Remove by function
device.unsubscribe(logChanges);

// Remove by subscription ID
device.unsubscribe(subId);

// Remove all
device.unsubscribe();
```
