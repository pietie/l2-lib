import jsDAL from "./L2.DAL";
// TODO: Implement DI-based messaging service?
export class toastr {
    static info(msg, title) {
        alert("info:" + msg);
    }
    static success(msg, title) {
        alert("success:" + msg);
    }
    static warning(msg, title) {
        alert("warning:" + msg);
    }
    static error(msg) {
        alert("error:" + msg);
    }
}
export class BrowserStore {
    constructor() {
    }
    static local(key, value) {
        return BrowserStore.processRequest(window.localStorage, key, value, "Local");
    }
    static session(key, value) {
        return BrowserStore.processRequest(window.sessionStorage, key, value, "Session");
    }
    static processRequest(store, key, value, storeName) {
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
    }
}
//    private static removeItemVal = {};
BrowserStore.removeSessionItem = function (key) {
    window.sessionStorage.removeItem(key);
};
BrowserStore.removeLocalItem = function (key) {
    window.localStorage.removeItem(key);
};
class StorageObject {
    constructor(val) {
        this.isValueAndObject = (typeof val === "object");
        this.value = val;
    }
    static deserialize(val) {
        if (!val || typeof (val) === "undefined")
            return null;
        var obj = JSON.parse(val);
        //!if (obj.IsValueAnObject) return $.parseJSON(obj.Value);
        return obj.value;
    }
}
export default class L2 {
    static registerOutputMessageHandler(handler) {
        L2._customOutputMsgHandler = handler;
    }
    static info(msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.info.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.info(msg, title);
    }
    static success(msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.success.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.success(msg, title);
    }
    static exclamation(msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.warning.apply(L2._customOutputMsgHandler, arguments);
        else
            toastr.warning(msg, title);
    }
    static confirm(msg, title) {
        let args = arguments;
        if (L2._customOutputMsgHandler) {
            return L2._customOutputMsgHandler.confirm.apply(L2._customOutputMsgHandler, args);
        }
        return new Promise((resolve, reject) => {
            reject(false); // currenly no default implementation
        });
    }
    static handleException(error, additionalKVs) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.handleException.apply(L2._customOutputMsgHandler, arguments);
        else {
            toastr.error(error.toString());
            console.error(error); // TODO: Log to DB
        }
    }
    // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    // Pass in the objects to merge as arguments.
    // For a deep extend, set the first argument to `true`.
    static extend(...any) {
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
    ;
    static clientIP() {
        return new Promise((resolve, reject) => {
            fetch(`${jsDAL.Server.serverUrl}/api/util/clientip`)
                .then((r) => {
                if (r.status >= 200 && r.status < 300) {
                    return r;
                }
                else {
                    resolve(null);
                }
            })
                .then((r) => {
                resolve(r);
            }).catch(e => resolve(null));
        });
    }
}
delete L2.BrowserStore;
L2.BrowserStore = BrowserStore; // don't know the correct TS way
//# sourceMappingURL=L2.js.map