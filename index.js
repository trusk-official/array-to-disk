const { LocalStorage } = require("node-localstorage");

function ArrayToDisk(location, size) {
  const loc = location ? location.toString() : null;
  const sizeint = parseInt(size, 10);
  const sz = Number.isInteger(sizeint) ? sizeint : 50000;
  let k = 0;
  Array.call(this);
  if (loc) {
    this.storage = new LocalStorage(loc, sz);
    const data = JSON.parse(this.storage.getItem("data") || "[]");
    for (k; k < data.length; k += 1) {
      this[this.length + k] = data[k];
    }
    this.length = this.length + data.length;
  }
}

ArrayToDisk.prototype = Object.create(Array.prototype, {
  shift: {
    value() {
      if (this.storage) {
        const data = JSON.parse(this.storage.getItem("data") || "[]");
        data.shift();
        this.storage.setItem("data", JSON.stringify(data));
      }
      return this.length ? this.splice(0, 1)[0] : undefined;
    },
    writable: true,
    enumerable: true,
    configurable: true
  },
  push: {
    value(...args) {
      if (this.storage) {
        const data = JSON.parse(this.storage.getItem("data") || "[]");
        let k = 0;
        for (k; k < args.length; k += 1) {
          data.push(args[k]);
        }
        this.storage.setItem("data", JSON.stringify(data));
      }
      let i = 0;
      for (i; i < args.length; i += 1) {
        let len = this.length;
        this[len] = args[i];
        len += 1;
        this.length = len;
      }
      return this.length;
    },
    writable: true,
    enumerable: true,
    configurable: true
  },
  deleteLocation: {
    value() {
      if (this.storage) {
        this.storage._deleteLocation(); // eslint-disable-line no-underscore-dangle
        delete this.storage;
      }
    },
    writable: true,
    enumerable: true,
    configurable: true
  }
});

ArrayToDisk.prototype.constructor = ArrayToDisk;

module.exports = ArrayToDisk;
