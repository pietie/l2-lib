System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var L2;
    return {
        setters:[],
        execute: function() {
            // TODO: Implement DI-based messaging service?
            (function (L2) {
                function fetchJson() {
                    // TODO!!!
                }
                L2.fetchJson = fetchJson;
                function info(msg, title) {
                    toastr.info(msg, title);
                }
                L2.info = info;
                function success(msg, title) {
                    toastr.success(msg, title);
                }
                L2.success = success;
                function exclamation(msg, title) {
                    toastr.warning(msg, title);
                }
                L2.exclamation = exclamation;
                function handleException(error, additionalKVs) {
                    toastr.error(error.toString());
                    console.error(error); // TODO: Log to DB
                    //alert("TODO: error log!..." + error); // TODO: implement
                }
                L2.handleException = handleException;
                // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
                // Pass in the objects to merge as arguments.
                // For a deep extend, set the first argument to `true`.
                function extend() {
                    var any = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        any[_i - 0] = arguments[_i];
                    }
                    var extended = {};
                    var deep = false;
                    var i = 0;
                    var length = arguments.length;
                    // Check if a deep merge
                    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                        deep = arguments[0];
                        i++;
                    }
                    // Merge the object into the extended object
                    var merge = function (obj) {
                        for (var prop in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                                // If deep merge and property is an object, merge properties
                                if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                                    extended[prop] = this.extend(true, extended[prop], obj[prop]);
                                }
                                else {
                                    extended[prop] = obj[prop];
                                }
                            }
                        }
                    };
                    // Loop through each object and conduct a merge
                    for (; i < length; i++) {
                        var obj = arguments[i];
                        merge(obj);
                    }
                    return extended;
                }
                L2.extend = extend;
                ;
                var BrowserStore = (function () {
                    function BrowserStore() {
                    }
                    BrowserStore.local = function (key, value) {
                        return BrowserStore.processRequest(window.localStorage, key, value, "Local");
                    };
                    BrowserStore.session = function (key, value) {
                        return BrowserStore.processRequest(window.sessionStorage, key, value, "Session");
                    };
                    BrowserStore.processRequest = function (store, key, value, storeName) {
                        var obj;
                        // if value is not specified at all assume we are doing a get.
                        if (value === undefined) {
                            try {
                                // GET
                                obj = store.getItem(key);
                                return StorageObject.deserialize(obj);
                            }
                            catch (ex) {
                                L2.handleException(ex);
                            }
                        }
                        else {
                            try {
                                //if (value === BrowserStore.removeItemVal) {
                                //    store.removeItem(key);
                                //    return;
                                //}
                                // SET
                                obj = new StorageObject(value);
                                store.setItem(key, JSON.stringify(obj));
                            }
                            catch (ex) {
                                L2.handleException(ex);
                            }
                        }
                    };
                    //    private static removeItemVal = {};
                    BrowserStore.removeSessionItem = function (key) {
                        window.sessionStorage.removeItem(key);
                    };
                    BrowserStore.removeLocalItem = function (key) {
                        window.localStorage.removeItem(key);
                    };
                    return BrowserStore;
                }());
                L2.BrowserStore = BrowserStore;
                var StorageObject = (function () {
                    function StorageObject(val) {
                        this.isValueAndObject = (typeof val === "object");
                        this.value = val;
                    }
                    StorageObject.deserialize = function (val) {
                        if (!val || typeof (val) === "undefined")
                            return null;
                        var obj = JSON.parse(val);
                        //!if (obj.IsValueAnObject) return $.parseJSON(obj.Value);
                        return obj.value;
                    };
                    return StorageObject;
                }());
            })(L2 || (L2 = {}));
            exports_1("L2", L2);
        }
    }
});
//# sourceMappingURL=L2.js.map