const fs = require("fs");
const rimraf = require("rimraf");
const { EventEmitter } = require("events");
const DiskArray = require("./../index");

const storagepath = `${__dirname}/tmp`;
const inspectfile = () =>
  JSON.parse(fs.readFileSync(`${storagepath}/data`, "utf-8"));

test("DiskArray with no location", () => {
  const arr = new DiskArray();
  expect(arr.length).toBe(0);
  arr.push("a", "b", "c");
  expect(arr.length).toBe(3);
  expect(arr[1]).toBe("b");
  expect(arr[2]).toBe("c");
  arr.shift();
  expect(arr.length).toBe(2);
  expect(arr[0]).toBe("b");
  expect(arr[1]).toBe("c");
  arr.shift();
  expect(arr.length).toBe(1);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe(undefined);
  arr.push("d", "e");
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  arr.push("f", "g");
  expect(arr.length).toBe(5);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  expect(arr[3]).toBe("f");
  expect(arr[4]).toBe("g");
  arr.deleteLocation();
  expect(arr.length).toBe(5);
});

test("DiskArray with location, no size", () => {
  rimraf.sync(storagepath);

  const arr = new DiskArray(storagepath);
  expect(!!fs.existsSync(storagepath)).toBe(true);
  expect(!!fs.existsSync(`${storagepath}/data`)).toBe(false);
  expect(arr.length).toBe(0);
  arr.push("a", "b", "c");
  expect(!!fs.existsSync(`${storagepath}/data`)).toBe(true);
  expect(arr.length).toBe(3);
  expect(arr[1]).toBe("b");
  expect(arr[2]).toBe("c");
  expect(inspectfile()).toStrictEqual(["a", "b", "c"]);
  arr.shift();
  expect(arr.length).toBe(2);
  expect(arr[0]).toBe("b");
  expect(arr[1]).toBe("c");
  expect(inspectfile()).toStrictEqual(["b", "c"]);
  arr.shift();
  expect(arr.length).toBe(1);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe(undefined);
  expect(inspectfile()).toStrictEqual(["c"]);
  arr.push("d", "e");
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  expect(inspectfile()).toStrictEqual(["c", "d", "e"]);
  arr.push("f", "g");
  expect(arr.length).toBe(5);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  expect(arr[3]).toBe("f");
  expect(arr[4]).toBe("g");
  expect(inspectfile()).toStrictEqual(["c", "d", "e", "f", "g"]);
  arr.deleteLocation();
  expect(!!fs.existsSync(`${storagepath}`)).toBe(false);
  expect(arr.length).toBe(5);
});

test("DiskArray with location, with size", () => {
  rimraf.sync(storagepath);

  const arr = new DiskArray(storagepath, 50);
  expect(!!fs.existsSync(storagepath)).toBe(true);
  expect(!!fs.existsSync(`${storagepath}/data`)).toBe(false);
  expect(arr.length).toBe(0);
  arr.push("a", "b", "c");
  expect(!!fs.existsSync(`${storagepath}/data`)).toBe(true);
  expect(arr.length).toBe(3);
  expect(arr[1]).toBe("b");
  expect(arr[2]).toBe("c");
  expect(inspectfile()).toStrictEqual(["a", "b", "c"]);
  arr.shift();
  expect(arr.length).toBe(2);
  expect(arr[0]).toBe("b");
  expect(arr[1]).toBe("c");
  expect(inspectfile()).toStrictEqual(["b", "c"]);
  arr.shift();
  expect(arr.length).toBe(1);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe(undefined);
  expect(inspectfile()).toStrictEqual(["c"]);
  arr.push("d", "e");
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  expect(inspectfile()).toStrictEqual(["c", "d", "e"]);
  arr.push("f", "g");
  expect(arr.length).toBe(5);
  expect(arr[0]).toBe("c");
  expect(arr[1]).toBe("d");
  expect(arr[2]).toBe("e");
  expect(arr[3]).toBe("f");
  expect(arr[4]).toBe("g");
  expect(inspectfile()).toStrictEqual(["c", "d", "e", "f", "g"]);
  arr.deleteLocation();
  expect(!!fs.existsSync(`${storagepath}`)).toBe(false);
  expect(arr.length).toBe(5);
  arr.deleteLocation();
});

test("smoke test Array specs still work", () => {
  rimraf.sync(storagepath);

  const arr = new DiskArray(storagepath, 50);
  arr.push("a", "b", "c", "d", "e", "f", "g", "h");
  expect(arr.length).toBe(8);
  expect(arr.splice(5)).toStrictEqual(["f", "g", "h"]);
  expect(arr.length).toBe(5);
  expect(arr[0]).toBe("a");
  expect(arr[1]).toBe("b");
  expect(arr[5]).toBe(undefined);
  expect(arr.slice(3)).toStrictEqual(["d", "e"]);
  expect(Array.from(arr)).toStrictEqual(["a", "b", "c", "d", "e"]);
  const arr2 = [...arr];
  expect(arr2).toStrictEqual(["a", "b", "c", "d", "e"]);
  arr.deleteLocation();
});

test("catch emitted error if storage size is exceeded", () => {
  rimraf.sync(storagepath);
  const errorsEmitted = [];
  const storageEmitter = new EventEmitter();
  storageEmitter.on("customErrorEvent", e => {
    errorsEmitted.push(e);
  });

  const arr = new DiskArray(storagepath, 50);
  arr.setEventEmitter(storageEmitter, "customErrorEvent");
  for (let k = 0; k < 21; k += 1) {
    arr.push(k);
  }
  expect(errorsEmitted.length).toBe(2);
  expect(errorsEmitted[0].name).toBe("QUOTA_EXCEEDED_ERR");
  expect([...arr]).toStrictEqual([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20
  ]);
  expect(inspectfile()).toStrictEqual([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18
  ]);
});
