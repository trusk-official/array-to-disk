# array-to-disk

- save an array to disk using the localstorage API
- restores the array state if initialized on an existing storage
- ⚠️ this only works for push and shift operations
- ⚠️ you should not be using multiple array instances on the same storage

```js
const array = new DiskArray("/storage/location/path", size);
```

## Usecase

- persist a pending list of `amqp` messages on disk in case of unexpected crash/reboot of a service while the `amqp` channel is not available (see [amqp connection manager](https://www.npmjs.com/package/amqp-connection-manager)).
