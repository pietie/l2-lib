"use strict";
exports.__esModule = true;
var KeyValueStore = /** @class */ (function () {
    function KeyValueStore() {
    }
    // todo: Have IndexDB backend with fallback to Browser local storage!
    KeyValueStore.open = function (storeName) {
        var dbPromise = KeyValueStore.createDBAndStore(storeName);
        // TODO: we can eventually use await on createDBAndStore if TS supports async on ES5/ES3  (I believe it already does..perhaps my TS version here is too low)
        return function (keyName, value) {
            return new Promise(function (resolve, reject) {
                dbPromise.then(function (db) {
                    if (value !== undefined) {
                        KeyValueStore.setValue(db, keyName, value).then(function (r) { return resolve(r); })["catch"](function (e) { return reject(e); });
                        ;
                    }
                    else {
                        KeyValueStore.getValue(db, keyName).then(function (r) { return resolve(r); })["catch"](function (e) { return reject(e); });
                    }
                })["catch"](function (e) { return reject(e); });
            });
        };
    };
    KeyValueStore.createDBAndStore = function (dbName) {
        return new Promise(function (resolve, reject) {
            var request = indexedDB.open(dbName, 1); // upgrades not currently supported because indexeddb is a stupid API
            request.onerror = function (event) {
                reject(event);
            };
            request.onsuccess = function (event) {
                resolve(request.result);
            };
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                db.onerror = function (event) {
                    reject(event);
                };
                var objectStore = db.createObjectStore("ConfigKey", {});
            };
        });
    };
    KeyValueStore.getValue = function (db, keyName) {
        return new Promise(function (resolve, reject) {
            var transaction = db.transaction(["ConfigKey"], "readwrite");
            var objectStore = transaction.objectStore("ConfigKey");
            var getRequest = objectStore.get(keyName);
            transaction.onerror = function (ev) { reject(ev); };
            getRequest.onerror = function (ev) { reject(ev); };
            getRequest.onsuccess = function (event) { resolve(event.target.result); };
        });
    };
    KeyValueStore.setValue = function (db, keyName, value) {
        return new Promise(function (resolve, reject) {
            var transaction = db.transaction(["ConfigKey"], "readwrite");
            var objectStore = transaction.objectStore("ConfigKey");
            var putRequest = objectStore.put(value.toString(), keyName);
            transaction.onerror = function (ev) { reject(ev); };
            putRequest.onerror = function (ev) { reject(ev); };
            putRequest.onsuccess = function (event) { resolve(event.target.result); };
        });
    };
    return KeyValueStore;
}());
exports.KeyValueStore = KeyValueStore;
//export class KeyValueStoreKV {
//    public key<T>(keyName: string, value?: T): T {
//        return null;
//    }
//}
/*
KeyValueStore.open("MyStore")<Date>("").
KeyValueStore.open("MyStore").key("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName", new Date());

*/ 
//# sourceMappingURL=KeyValueStore.js.map