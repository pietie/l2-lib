declare var toastr: any;

// TODO: Implement DI-based messaging service?

module L2 {
    export function fetchJson() {
        // TODO!!!
    }

    export function info(msg: string, title?: string) {
        toastr.info(msg, title);
    }

    export function success(msg: string, title?: string) {
        toastr.success(msg, title);
    }

    export function exclamation(msg: string, title?: string) {
        toastr.warning(msg, title);
    }

    export function handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object) {
        toastr.error(error.toString());
        console.error(error); // TODO: Log to DB
        //alert("TODO: error log!..." + error); // TODO: implement

    }

    // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    // Pass in the objects to merge as arguments.
    // For a deep extend, set the first argument to `true`.
    export function extend(...any) {
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

        static removeSessionItem = function (key) {
            window.sessionStorage.removeItem(key);
        }
        static removeLocalItem = function (key) {
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

}

export { L2 }