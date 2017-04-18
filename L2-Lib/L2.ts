import jsDAL from "./L2.DAL"


// TODO: Implement DI-based messaging service?

export interface PromiseL2<R> {
    ifthen(...any): Promise<R>
}

// TODO: There is now a lot of overlap between L2 and L2.DAL. Make L2.DAL call L2 where overlap occurs? 

export class ApiResponseEndThenChain {
    handled?: boolean;
}

enum ApiResponseType {
    Unknown = 0,
    Success = 1,
    InfoMsg = 10,
    ExclamationModal = 20,
    Error = 30,
    Exception = 40
}

class ApiResponse {
    Message: string;
    Title: string;
    Type: ApiResponseType;
    Data: any;
}


export interface IL2OutputMessageHandler {
    info(msg: string, title?: string);
    success(msg: string, title?: string);
    warning(msg: string, title?: string);
    exclamation(msg: string, title?: string);

    confirm(msg: string, title?: string): Promise<boolean>;
    prompt(title?: string, fieldName?: string, val?: string, okayButtonLabel?: string): Promise<boolean>;

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
        removeSessionItem: (key: any) => void,
        removeLocalItem: (key: any) => void
    };

    static registerOutputMessageHandler(handler: IL2OutputMessageHandler) {
        L2._customOutputMsgHandler = handler;
    }

    static info(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.info.apply(L2._customOutputMsgHandler, arguments);
    }

    static success(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.success.apply(L2._customOutputMsgHandler, arguments);
    }

    static exclamation(msg: string, title?: string) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.warning.apply(L2._customOutputMsgHandler, arguments);
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

    public static prompt(title?: string, fieldName?: string, val?: string, okayButtonLabel?: string): Promise<any> {
        let args = arguments;
        if (L2._customOutputMsgHandler) {
            return L2._customOutputMsgHandler.prompt.apply(L2._customOutputMsgHandler, args); 
        }
        

        return new Promise<boolean>((resolve, reject) => {
            reject(false); // currenly no default implementation
        });
    }

    static handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object) {
        if (L2._customOutputMsgHandler) L2._customOutputMsgHandler.handleException.apply(L2._customOutputMsgHandler, arguments);
        else {

            throw error;
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


    private static processApiResponse(json): Response {
        // if the result is a string, test for ApiResponse
        if (typeof (json) === "object" && typeof (json.ApiResponseVer) !== "undefined") {

            let apiResponse = json;

            switch (apiResponse.Type) {
                case ApiResponseType.Success:
                    return apiResponse;
                case ApiResponseType.InfoMsg:
                    L2.info(apiResponse.Message);
                    break;
                case ApiResponseType.ExclamationModal:

                    //MsgDialog.exclamation(L2.dialog, apiResponse.Title ? apiResponse.Title : "", apiResponse.Message);

                    throw new ApiResponseEndThenChain();
                case ApiResponseType.Exception:
                    //MsgDialog.exclamation(L2.dialog, "Application error occured", apiResponse.Message);

                    throw new ApiResponseEndThenChain();


            }


            return apiResponse;
        }
        else {
            return json;
        }

    }


    static fetchJson(url: string | Request, init?: RequestInit): Promise<Response> {

        return (<any>L2.fetchWrap(url, init)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
        )
            .ifthen(true, L2.processApiResponse)
            .catch(L2.fetchCatch);
    }


    static postJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response> {

        var defaults = {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        var settings = L2.extend(defaults, init);

        return (<any>L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON))
            .ifthen(true, L2.processApiResponse)
            .catch(L2.fetchCatch)

            ;
    }

    static putJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response> {

        var defaults = {
            method: "put",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        var settings = L2.extend(defaults, init);

        return <any>L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .then(L2.processApiResponse)
            //!.ifthen(true, processApiResponse)
            .catch(L2.fetchCatch)
            ;
    }

    static deleteJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response> {

        var defaults = {
            method: "delete",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        var settings = L2.extend(defaults, init);

        return <any>L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .then(L2.processApiResponse)
            //!.ifthen(true, processApiResponse)
            .catch(L2.fetchCatch)

            ;

    }

    private static fetchWrap(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response> {

        return <any>new Promise<Response>((resolve, reject) => {

            // PL: Temp hack when we are running with ng serve
            if (window.location.port == '4200') url = 'http://localhost:9086' + url;

            var jwt = BrowserStore.session<any>("jwt");

            // if  a JWT exists, use it
            if (jwt != null) {

                if (!init) init = {};
                if (!init.headers) init.headers = {};

                init.headers["x-access-token"] = jwt.token;
            }

            if (!init) init = {};

            init.mode = 'cors';


            fetch(url, init).then((r: any) => {
                r.fetch = { url: url, init: init };
                resolve(r);
            })["catch"](err => {
                err.fetch = { url: url, init: init };
                reject(err);
            }).then(r => { resolve(<any>r); });
        });
    }


    private static fetchCatch(ex) {
        if (ex instanceof ApiResponseEndThenChain) {
            ex.handled = true; //?
            // handle special case where we just threw and exception(ApiResponseEndThenChain) to end any remaining 'thens' on the promise.
            // we have to rethrow to prevent any additional '.then' callbacks from being executed
            throw ex;
        }


        // TODO: Improve error here - look for specific type of failures (eg. network related)
        //MsgDialog.exclamation(L2.dialog, "fetch failed", ex.toString());

        return ex;
    }

    private static checkHttpStatus(response: Response): Response | any {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            let error: Error & { response?: any } = new Error(response.statusText)

            error.response = response;

           // MsgDialog.exclamation(L2.dialog, "HTTP " + response.status, error.toString());

            throw error;

            //throw new ApiResponseEndThenChain();
        }
    }


    private static parseJSON(response) {

        return response.json().then((json) => {
            // if still a string after parsing once...
            if (typeof (json) === "string" && json.startsWith("{")) return JSON.parse(json);

            return json;
        });
    }


}

delete L2.BrowserStore;
(<any>L2).BrowserStore = BrowserStore; // don't know the correct TS way