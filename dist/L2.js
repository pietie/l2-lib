"use strict";
//import { jsDAL } from "./L2.DAL";
exports.__esModule = true;
if (typeof (Promise.prototype.ifthen) == "undefined") {
    Promise.prototype.ifthen = function (cond, cb) {
        //if (cond) return this.then(cb);  
        return this.then(function (r) {
            if (cond)
                return cb(r);
            else
                return r;
        });
    };
}
// TODO: There is now a lot of overlap between L2 and L2.DAL. Make L2.DAL call L2 where overlap occurs? 
var ApiResponseEndThenChain = (function () {
    function ApiResponseEndThenChain() {
    }
    return ApiResponseEndThenChain;
}());
exports.ApiResponseEndThenChain = ApiResponseEndThenChain;
var ApiResponseType;
(function (ApiResponseType) {
    ApiResponseType[ApiResponseType["Unknown"] = 0] = "Unknown";
    ApiResponseType[ApiResponseType["Success"] = 1] = "Success";
    ApiResponseType[ApiResponseType["InfoMsg"] = 10] = "InfoMsg";
    ApiResponseType[ApiResponseType["ExclamationModal"] = 20] = "ExclamationModal";
    ApiResponseType[ApiResponseType["Error"] = 30] = "Error";
    ApiResponseType[ApiResponseType["Exception"] = 40] = "Exception";
})(ApiResponseType || (ApiResponseType = {}));
var ApiResponse = (function () {
    function ApiResponse() {
    }
    return ApiResponse;
}());
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
                //ICE.HandleJavascriptError(ex, null, { Src: "ProcessRequest::Get", Store: storeName, Key: key, Progress: progress, RemainingSpace: store.remainingSpace/*(only supported by IE)*/ });
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
                //ICE.HandleJavascriptError(ex, null, { Src: "ProcessRequest::Set", Store: storeName, Key: key, Value: value, Progress: progress, RemainingSpace: store.remainingSpace/*(only supported by IE)*/ });
            }
        }
    };
    return BrowserStore;
}());
//    private static removeItemVal = {};
BrowserStore.removeSessionItem = function (key) {
    window.sessionStorage.removeItem(key);
};
BrowserStore.removeLocalItem = function (key) {
    window.localStorage.removeItem(key);
};
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
    L2.registerOutputMessageHandler = function (handler) {
        L2._customOutputMsgHandler = handler;
    };
    L2.info = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.info.apply(L2._customOutputMsgHandler, arguments);
    };
    L2.success = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.success.apply(L2._customOutputMsgHandler, arguments);
    };
    L2.exclamation = function (msg, title) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.warning.apply(L2._customOutputMsgHandler, arguments);
    };
    L2.confirm = function (msg, title) {
        var args = arguments;
        if (L2._customOutputMsgHandler) {
            return L2._customOutputMsgHandler.confirm.apply(L2._customOutputMsgHandler, args);
        }
        return new Promise(function (resolve, reject) {
            reject(false); // currenly no default implementation
        });
    };
    L2.prompt = function (title, fieldName, val, okayButtonLabel) {
        var args = arguments;
        if (L2._customOutputMsgHandler) {
            return L2._customOutputMsgHandler.prompt.apply(L2._customOutputMsgHandler, args);
        }
        return new Promise(function (resolve, reject) {
            reject(false); // currenly no default implementation
        });
    };
    L2.handleException = function (error, additionalKVs) {
        if (L2._customOutputMsgHandler)
            L2._customOutputMsgHandler.handleException.apply(L2._customOutputMsgHandler, arguments);
        else {
            throw error;
        }
    };
    L2.nullToEmpty = function (val) {
        if (val == null || val == undefined)
            return '';
        else
            return val;
    };
    // https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    // Pass in the objects to merge as arguments.
    // For a deep extend, set the first argument to `true`.
    L2.extend = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
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
            fetch(jsDALServer.serverUrl + "/api/util/clientip")
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
            })["catch"](function (e) { return resolve(null); });
        });
    };
    L2.processApiResponse = function (json) {
        // if the result is a string, test for ApiResponse
        if (typeof (json) === "object" && typeof (json.ApiResponseVer) !== "undefined") {
            var apiResponse = json;
            switch (apiResponse.Type) {
                case ApiResponseType.Success:
                    return apiResponse;
                case ApiResponseType.InfoMsg:
                    L2.info(apiResponse.Message);
                    break;
                case ApiResponseType.ExclamationModal:
                    {
                        L2.exclamation(apiResponse.Message);
                        throw new ApiResponseEndThenChain();
                    }
                case ApiResponseType.Exception:
                    {
                        L2.exclamation(apiResponse.Message);
                        throw new ApiResponseEndThenChain();
                    }
            }
            return apiResponse;
        }
        else {
            return json;
        }
    };
    L2.fetchJson = function (url, init) {
        return L2.fetchWrap(url, init)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .ifthen(true, L2.processApiResponse)["catch"](L2.fetchCatch);
    };
    L2.postJson = function (url, init) {
        var defaults = {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        var settings = L2.extend(defaults, init);
        return L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .ifthen(true, L2.processApiResponse)["catch"](L2.fetchCatch);
    };
    L2.putJson = function (url, init) {
        var defaults = {
            method: "put",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        var settings = L2.extend(defaults, init);
        return L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .then(L2.processApiResponse)["catch"](L2.fetchCatch);
    };
    L2.deleteJson = function (url, init) {
        var defaults = {
            method: "delete",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        var settings = L2.extend(defaults, init);
        return L2.fetchWrap(url, settings)
            .then(L2.checkHttpStatus)
            .then(L2.parseJSON)
            .then(L2.processApiResponse)["catch"](L2.fetchCatch);
    };
    L2.fetchWrap = function (url, init) {
        return new Promise(function (resolve, reject) {
            // PL: Temp hack when we are running with ng serve
            if (window.location.port == '4200')
                url = 'http://localhost:9086' + url;
            var jwt = BrowserStore.session("jwt");
            // if  a JWT exists, use it
            if (jwt != null) {
                if (!init)
                    init = {};
                if (!init.headers)
                    init.headers = {};
                init.headers["x-access-token"] = jwt.token; // can eventually be removed if we only run on the jsdal-core version
                init.headers["Authorization"] = "Bearer " + jwt.token;
            }
            if (!init)
                init = {};
            init.mode = 'cors';
            fetch(url, init).then(function (r) {
                r.fetch = { url: url, init: init };
                resolve(r);
            })["catch"](function (err) {
                err.fetch = { url: url, init: init };
                reject(err);
            }).then(function (r) { resolve(r); });
        });
    };
    L2.fetchCatch = function (ex) {
        if (ex instanceof ApiResponseEndThenChain) {
            ex.handled = true; //?
            // handle special case where we just threw and exception(ApiResponseEndThenChain) to end any remaining 'thens' on the promise.
            // we have to rethrow to prevent any additional '.then' callbacks from being executed
            throw ex;
        }
        // TODO: Improve error here - look for specific type of failures (eg. network related)
        //MsgDialog.exclamation(L2.dialog, "fetch failed", ex.toString());
        // 02/11/2017, PL: I think this needs to be a THROW otherwise we end up going to the next then instead of the next catch handler
        return ex;
    };
    L2.checkHttpStatus = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        else {
            var error = new Error(response.statusText);
            error.response = response;
            // MsgDialog.exclamation(L2.dialog, "HTTP " + response.status, error.toString());
            throw error;
            //throw new ApiResponseEndThenChain();
        }
    };
    L2.parseJSON = function (response) {
        return response.json().then(function (json) {
            // if still a string after parsing once...
            if (typeof (json) === "string" && json.startsWith("{"))
                return JSON.parse(json);
            return json;
        });
    };
    return L2;
}());
exports.L2 = L2;
var jsDALServer = (function () {
    function jsDALServer() {
    }
    jsDALServer.configure = function (options) {
        if (options.dbConnection == "")
            options.dbConnection = null;
        jsDALServer.serverUrl = options.serverUrl;
        jsDALServer.dbConnection = options.dbConnection;
        jsDALServer.jwt = options.jwt;
        jsDALServer.overridingDbSource = options.overridingDbSource;
    };
    return jsDALServer;
}());
exports.jsDALServer = jsDALServer;
delete L2.BrowserStore;
L2.BrowserStore = BrowserStore; // don't know the correct TS way
//# sourceMappingURL=L2.js.map