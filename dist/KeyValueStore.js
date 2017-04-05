export var KeyValueStore = (function () {
    function KeyValueStore() {
    }
    // todo: Have IndexDB backend with fallback to Browser local storage!
    KeyValueStore.open = function (storeName) {
        return null;
    };
    return KeyValueStore;
}());
export var KeyValueStoreKV = (function () {
    function KeyValueStoreKV() {
    }
    KeyValueStoreKV.prototype.key = function (keyName, value) {
        return null;
    };
    return KeyValueStoreKV;
}());
/*
KeyValueStore.open("MyStore").key("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName", new Date());

*/ 
//# sourceMappingURL=KeyValueStore.js.map