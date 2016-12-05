"use strict";
var L2_DAL_1 = require("./L2.DAL");
// TODO: Implement DI-based messaging service?
var toastr = (function () {
    function toastr() {
    }
    toastr.info = function (msg, title) {
        alert("info:" + msg);
    };
    toastr.success = function (msg, title) {
        alert("success:" + msg);
    };
    toastr.warning = function (msg, title) {
        alert("warning:" + msg);
    };
    toastr.error = function (msg) {
        alert("error:" + msg);
    };
    return toastr;
}());
exports.toastr = toastr;
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
exports.BrowserStore = BrowserStore;
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
var L2 = (function () {
    function L2() {
    }
    Object.defineProperty(L2, "BrowserStore", {
        get: function () {
            return BrowserStore;
        },
        enumerable: true,
        configurable: true
    });
    L2.registerOutputMessageHandler = function (handler) {
        L2._customOutputMsgHandler = handler;
    };
    L2.info = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.info.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.info(msg, title);
    };
    L2.success = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.success.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.success(msg, title);
    };
    L2.exclamation = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.warning.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.warning(msg, title);
    };
    L2.handleException = function (error, additionalKVs) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.handleException.apply(L2._customOutputMsgHandler, arguments);
        else {
            toastr.error(error.toString());
            console.error(error); // TODO: Log to DB
        }
    };
    // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    // Pass in the objects to merge as arguments.
    // For a deep extend, set the first argument to `true`.
    L2.extend = function () {
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
    };
    ;
    L2.clientIP = function () {
        return new Promise(function (resolve, reject) {
            fetch(L2_DAL_1.default.Server.serverUrl + "/api/util/clientip")
                .then(function (r) {
                if (r.status >= 200 && r.status < 300) {
                    return r;
                }
                else {
                    resolve(null);
                }
            })
                .then(function (r) {
                resolve(r);
            }).catch(function (e) { return resolve(null); });
        });
    };
    return L2;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = L2;
//# sourceMappingURL=L2.js.map