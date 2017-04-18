import jsDAL from "./L2.DAL"

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

export interface IL2OutputMessageHandler {
    info(msg: string, title?: string);

    success(msg: string, title?: string);

    warning(msg: string, title?: string);

    exclamation(msg: string, title?: string);

    confirm(msg: string, title?: string) : Promise<boolean>;

    handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object);

}

export class BrowserStore {
    constructor() {

    }

    public static local<T>(key: string, value?: T): T {
        return BrowserStore.processRequest<T>(window.localStorage, key, value, "Local");
    }

    public static session<T>(key: string, value?: T): T {
        return BrowserStore.processRequest<T>(window.sessionStorage, key, value, "Session");
    }

    //    private static removeItemVal = {};

    public static removeSessionItem = function (key) {
        window.sessionStorage.removeItem(key);
    }
    public static removeLocalItem = function (key) {
        window.localStorage.removeItem(key);
    }

    private static processRequest<T>(store: Storage, key: string, value: T, storeName: string): T {

        var obj: any;

        // if value is not specified at all assume we are doing a get.
        if (value === undefined) {
            try {
                // GET
                obj = store.getItem(key);
                return StorageObject.deserialize<T>(obj);
            }
            catch (ex) {
                L2.handleException(ex);
                //ICE.HandleJavascriptError(ex, null, { Src: "ProcessRequest::Get", Store: storeName, Key: key, Progress: progress, RemainingSpace: store.remainingSpace/*(only supported by IE)*/ });
            }
        } else {
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
                //ICE.HandleJavascriptError(ex, null, { Src: "ProcessRequest::Set", Store: storeName, Key: key, Value: value, Progress: progress, RemainingSpace: store.remainingSpace/*(only supported by IE)*/ });
            }
        }

    }


}

class StorageObject {

    private isValueAndObject: boolean;
    private value: any;

    constructor(val: any) {
        this.isValueAndObject = (typeof val === "object");
        this.value = val;
    }

    public static deserialize<T>(val: any): T {
        if (!val || typeof (val) === "undefined") return null;

        var obj = JSON.parse(val);
        //!if (obj.IsValueAnObject) return $.parseJSON(obj.Value);
        return obj.value;
    }

}



export default class L2 {

    private static _customOutputMsgHandler: IL2OutputMessageHandler;

    public static BrowserStore: {
        local<T>(key: string, value?: T): T,
        session<T>(key: string, value?: T): T,
        removeSessionItem: (key: any) => void;
        removeLocalItem: (key: any) => void;
    };

    static registerOutputMessageHandler(handler: IL2OutputMessageHandler) {
        L2._customOutputMsgHandler = handler;
    }

    static info(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.info.apply(L2._customOutputMsgHandler, arguments);
        else toastr.info(msg, title);
    }

    static success(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.success.apply(L2._customOutputMsgHandler, arguments);
        else toastr.success(msg, title);
    }

    static exclamation(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.warning.apply(L2._customOutputMsgHandler, arguments);
        else toastr.warning(msg, title);
    }

    static confirm(msg: string, title?: string): Promise<boolean> {
        let args = arguments;
        if (L2._customOutputMsgHandler) {
            return L2._customOutputMsgHandler.confirm.apply(L2._customOutputMsgHandler, args);
        }

        return new Promise<boolean>((resolve, reject) => {
            reject(false); // currenly no default implementation
        });
    }

    static handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.handleException.apply(L2._customOutputMsgHandler, arguments);
        else {
            toastr.error(error.toString());
            console.error(error); // TODO: Log to DB
        }

    }

    static nullToEmpty(val: string) {
        if (val == null || val == undefined) return '';
        else return val;
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
                    } else {
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


    static clientIP(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(`${jsDAL.Server.serverUrl}/api/util/clientip`)
                .then((r) => {
                    if (r.status >= 200 && r.status < 300) { return r; }
                    else { resolve(null); }
                })
                .then((r: any) => {
                    resolve(r);
                }).catch(e => resolve(null));
        });
    }
}

delete L2.BrowserStore;
(<any>L2).BrowserStore = BrowserStore; // don't know the correct TS way