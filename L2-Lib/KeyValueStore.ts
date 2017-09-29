export class KeyValueStore {

    // todo: Have IndexDB backend with fallback to Browser local storage!
    public static open<T>(storeName: string): <T>(keyName: string, value?: T) => Promise<T> {

        let dbPromise = KeyValueStore.createDBAndStore(storeName);

        // TODO: we can eventually use await on createDBAndStore if TS supports async on ES5/ES3  (I believe it already does..perhaps my TS version here is too low)

        return <T>(keyName: string, value?: T): Promise<T> => {

            return new Promise<T>((resolve, reject) => {

                dbPromise.then(db => {

                    if (value !== undefined) {

                        KeyValueStore.setValue<T>(db, keyName, value).then(r => resolve(r)).catch(e => reject(e));;

                    }
                    else {

                        KeyValueStore.getValue<T>(db, keyName).then(r => resolve(r)).catch(e => reject(e));

                    }

                }).catch(e => reject(e));

            });


        };


    }

    private static createDBAndStore(dbName: string): Promise<IDBDatabase> {

        return new Promise<IDBDatabase>((resolve, reject) => {

            var request = indexedDB.open(dbName, 1); // upgrades not currently supported because indexeddb is a stupid API

            request.onerror = (event) => {
                reject(event);

            };

            request.onsuccess = (event) => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event: any) => {
                let db = event.target.result;

                db.onerror = (event) => {
                    reject(event);
                };

                let objectStore = db.createObjectStore("ConfigKey", {});
            };

        });
    }

    private static getValue<T>(db: IDBDatabase, keyName: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            let transaction = db.transaction(["ConfigKey"], "readwrite");
            let objectStore: IDBObjectStore = transaction.objectStore("ConfigKey");

            let getRequest = objectStore.get(keyName);

            transaction.onerror = (ev) => { reject(ev); };
            getRequest.onerror = (ev) => { reject(ev); };

            getRequest.onsuccess = (event: any) => { resolve(event.target.result); }

        });

    }

    private static setValue<T>(db: IDBDatabase, keyName: string, value: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            let transaction = db.transaction(["ConfigKey"], "readwrite");
            let objectStore: IDBObjectStore = transaction.objectStore("ConfigKey");

            let putRequest = objectStore.put(value.toString(), keyName);

            transaction.onerror = (ev) => { reject(ev); };
            putRequest.onerror = (ev) => { reject(ev); };

            putRequest.onsuccess = (event: any) => { resolve(event.target.result); }

        });

    }

    // https://github.com/jakearchibald/idb-keyval/blob/master/idb-keyval.js
           /*
        return withStore('readonly', function (store) {
            // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
            // And openKeyCursor isn't supported by Safari.
            (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
                if (!this.result) return;
                keys.push(this.result.key);
                this.result.continue();
            };
        }).then(function () {
            return keys;
            });


    }
        */


}

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