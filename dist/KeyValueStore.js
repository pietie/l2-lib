export class KeyValueStore {
    // todo: Have IndexDB backend with fallback to Browser local storage!
    static open(storeName) {
        return null;
    }
}
export class KeyValueStoreKV {
    key(keyName, value) {
        return null;
    }
}
/*
KeyValueStore.open("MyStore").key("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName", new Date());

*/ 
//# sourceMappingURL=KeyValueStore.js.map