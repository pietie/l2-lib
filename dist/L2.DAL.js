System.register(["./L2"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var L2_1;
    var jsDAL;
    return {
        setters:[
            function (L2_1_1) {
                L2_1 = L2_1_1;
            }],
        execute: function() {
            // TODO: Clean-up the polyfills below - rather include the necessary dependency refs?
            // Production steps of ECMA-262, Edition 5, 15.4.4.14
            // Reference: http://es5.github.io/#x15.4.4.14
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (searchElement, fromIndex) {
                    var k;
                    // 1. Let o be the result of calling ToObject passing
                    //    the this value as the argument.
                    if (this == null) {
                        throw new TypeError('"this" is null or not defined');
                    }
                    var o = Object(this);
                    // 2. Let lenValue be the result of calling the Get
                    //    internal method of o with the argument "length".
                    // 3. Let len be ToUint32(lenValue).
                    var len = o.length >>> 0;
                    // 4. If len is 0, return -1.
                    if (len === 0) {
                        return -1;
                    }
                    // 5. If argument fromIndex was passed let n be
                    //    ToInteger(fromIndex); else let n be 0.
                    var n = +fromIndex || 0;
                    if (Math.abs(n) === Infinity) {
                        n = 0;
                    }
                    // 6. If n >= len, return -1.
                    if (n >= len) {
                        return -1;
                    }
                    // 7. If n >= 0, then Let k be n.
                    // 8. Else, n<0, Let k be len - abs(n).
                    //    If k is less than 0, then let k be 0.
                    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                    // 9. Repeat, while k < len
                    while (k < len) {
                        // a. Let Pk be ToString(k).
                        //   This is implicit for LHS operands of the in operator
                        // b. Let kPresent be the result of calling the
                        //    HasProperty internal method of o with argument Pk.
                        //   This step can be combined with c
                        // c. If kPresent is true, then
                        //    i.  Let elementK be the result of calling the Get
                        //        internal method of o with the argument ToString(k).
                        //   ii.  Let same be the result of applying the
                        //        Strict Equality Comparison Algorithm to
                        //        searchElement and elementK.
                        //  iii.  If same is true, return k.
                        if (k in o && o[k] === searchElement) {
                            return k;
                        }
                        k++;
                    }
                    return -1;
                };
            }
            // Production steps of ECMA-262, Edition 5, 15.4.4.19
            // Reference: http://es5.github.io/#x15.4.4.19
            if (!Array.prototype.map) {
                Array.prototype.map = function (callback, thisArg) {
                    var T, A, k;
                    if (this == null) {
                        throw new TypeError(' this is null or not defined');
                    }
                    // 1. Let O be the result of calling ToObject passing the |this| 
                    //    value as the argument.
                    var O = Object(this);
                    // 2. Let lenValue be the result of calling the Get internal 
                    //    method of O with the argument "length".
                    // 3. Let len be ToUint32(lenValue).
                    var len = O.length >>> 0;
                    // 4. If IsCallable(callback) is false, throw a TypeError exception.
                    // See: http://es5.github.com/#x9.11
                    if (typeof callback !== 'function') {
                        throw new TypeError(callback + ' is not a function');
                    }
                    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length > 1) {
                        T = thisArg;
                    }
                    // 6. Let A be a new array created as if by the expression new Array(len) 
                    //    where Array is the standard built-in constructor with that name and 
                    //    len is the value of len.
                    A = new Array(len);
                    // 7. Let k be 0
                    k = 0;
                    // 8. Repeat, while k < len
                    while (k < len) {
                        var kValue, mappedValue;
                        // a. Let Pk be ToString(k).
                        //   This is implicit for LHS operands of the in operator
                        // b. Let kPresent be the result of calling the HasProperty internal 
                        //    method of O with argument Pk.
                        //   This step can be combined with c
                        // c. If kPresent is true, then
                        if (k in O) {
                            // i. Let kValue be the result of calling the Get internal 
                            //    method of O with argument Pk.
                            kValue = O[k];
                            // ii. Let mappedValue be the result of calling the Call internal 
                            //     method of callback with T as the this value and argument 
                            //     list containing kValue, k, and O.
                            mappedValue = callback.call(T, kValue, k, O);
                            // iii. Call the DefineOwnProperty internal method of A with arguments
                            // Pk, Property Descriptor
                            // { Value: mappedValue,
                            //   Writable: true,
                            //   Enumerable: true,
                            //   Configurable: true },
                            // and false.
                            // In browsers that support Object.defineProperty, use the following:
                            // Object.defineProperty(A, k, {
                            //   value: mappedValue,
                            //   writable: true,
                            //   enumerable: true,
                            //   configurable: true
                            // });
                            // For best browser support, use the following:
                            A[k] = mappedValue;
                        }
                        // d. Increase k by 1.
                        k++;
                    }
                    // 9. return A
                    return A;
                };
            }
            if (!Array.prototype.filter) {
                Array.prototype.filter = function (fun /*, thisArg*/) {
                    'use strict';
                    if (this === void 0 || this === null) {
                        throw new TypeError();
                    }
                    var t = Object(this);
                    var len = t.length >>> 0;
                    if (typeof fun !== 'function') {
                        throw new TypeError();
                    }
                    var res = [];
                    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
                    for (var i = 0; i < len; i++) {
                        if (i in t) {
                            var val = t[i];
                            // NOTE: Technically this should Object.defineProperty at
                            //       the next index, as push can be affected by
                            //       properties on Object.prototype and Array.prototype.
                            //       But that method's new, and collisions should be
                            //       rare, so use the more-compatible alternative.
                            if (fun.call(thisArg, val, i, t)) {
                                res.push(val);
                            }
                        }
                    }
                    return res;
                };
            }
            (function (jsDAL) {
                var Server = (function () {
                    function Server() {
                    }
                    Server.configure = function (options) {
                        if (options.dbConnection == "")
                            options.dbConnection = null;
                        Server.serverUrl = options.serverUrl;
                        Server.dbConnection = options.dbConnection;
                        Server.jwt = options.jwt;
                    };
                    return Server;
                }());
                jsDAL.Server = Server;
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
                var ApiResponseEndThenChain = (function () {
                    function ApiResponseEndThenChain() {
                    }
                    return ApiResponseEndThenChain;
                }());
                Promise.prototype.ifthen = function (cond, cb) {
                    //if (cond) return this.then(cb);  
                    return this.then(function (r) {
                        if (cond)
                            return cb(r);
                        else
                            return r;
                    });
                };
                function ExecGlobal(method, dbSource, schema, routine, mappedParams, options) {
                    return new Promise(function (resolve, reject) {
                        // create query string based on routine parameters
                        var parmQueryStringArray = mappedParams.map(function (p) {
                            var parmValue = options[p];
                            // serialize Date/moment objects to ISO string format
                            if (typeof (moment) != "undefined" && moment.isMoment(parmValue)) {
                                parmValue = parmValue.toDate().toISOString();
                            }
                            else if (parmValue instanceof Date) {
                                parmValue = parmValue.toISOString();
                            }
                            return encodeURIComponent(p) + "=" + encodeURIComponent(parmValue);
                        });
                        var tokenGuid = null;
                        if (options) {
                            if (options.AutoSetTokenGuid) {
                                tokenGuid = window["TokenGuid"];
                                if (tokenGuid)
                                    parmQueryStringArray.push("tokenGuid=" + tokenGuid);
                            }
                            if (options.$select)
                                parmQueryStringArray.push("$select=" + options.$select);
                        }
                        var parmQueryString = parmQueryStringArray.join("&");
                        if (parmQueryString && parmQueryString.length > 0 && parmQueryString != "")
                            parmQueryString = "?" + parmQueryString;
                        else
                            parmQueryString = "";
                        // GET
                        if (method == "GET") {
                            fetchWrap(Server.serverUrl + "/api/exec/" + dbSource + "/" + Server.dbConnection + "/" + schema + "/" + routine + parmQueryString)
                                .then(checkHttpStatus)
                                .then(parseJSON)
                                .then(transformResults)
                                .ifthen(options.AutoProcessApiResponse, processApiResponse)
                                .then(function (r) { return resolve(r); })["catch"](function (r) { reject(fetchCatch(r)); return r; });
                        }
                        else if (method == "POST") {
                            var bodyContent = {};
                            mappedParams.forEach(function (p) { bodyContent[p] = options[p]; });
                            if (tokenGuid)
                                bodyContent["tokenGuid"] = tokenGuid;
                            fetchWrap(Server.serverUrl + "/api/exec/" + dbSource + "/" + Server.dbConnection + "/" + schema + "/" + routine, {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(bodyContent)
                            })
                                .then(checkHttpStatus)
                                .then(parseJSON)
                                .then(transformResults)
                                .ifthen(options.AutoProcessApiResponse, processApiResponse)
                                .then(function (r) { return resolve(r); })["catch"](function (r) { reject(fetchCatch(r)); });
                        }
                        else if (method == "SCALAR") {
                            fetchWrap(Server.serverUrl + "/api/execScalar/" + dbSource + "/" + Server.dbConnection + "/" + schema + "/" + routine + parmQueryString, {
                                credentials: 'same-origin'
                            })
                                .then(checkHttpStatus)
                                .then(parseJSON)
                                .ifthen(options.AutoProcessApiResponse, processApiResponse)
                                .then(function (r) { return resolve(r); })["catch"](function (r) { reject(fetchCatch(r)); });
                        }
                        else
                            throw "Invalid method: " + method;
                        // Handle result? --> special handling of ApiResponse?!
                    });
                }
                function fetchWrap(url, init) {
                    return new Promise(function (resolve, reject) {
                        if (jsDAL.Server.jwt != null) {
                            if (!init)
                                init = {};
                            if (!init.headers)
                                init.headers = {};
                            init.headers["Authorization"] = "Bearer " + jsDAL.Server.jwt.access_token;
                        }
                        fetch(url, init).then(function (r) {
                            r.fetch = { url: url, init: init };
                            resolve(r);
                        })["catch"](function (err) {
                            err.fetch = { url: url, init: init };
                            reject(err);
                        }).then(function (r) { resolve(r); });
                    });
                }
                function transformResults(r) {
                    if (typeof (r.Data) === "undefined")
                        return r;
                    for (var e in r.Data) {
                        if (!(e.substring(0, 5) == "Table"))
                            continue;
                        var dt = r.Data[e];
                        var transformed = [];
                        for (var rowIx = 0; rowIx < dt.Data.length; rowIx++) {
                            var newRowObject = {};
                            for (var colIx = 0; colIx < dt.Data[rowIx].length; colIx++) {
                                // TODO: Add support for DateTime fields?
                                newRowObject[dt.Fields[colIx].name] = dt.Data[rowIx][colIx];
                            }
                            transformed.push(newRowObject);
                        }
                        r.Data[e] = transformed;
                    }
                    return r;
                }
                jsDAL.transformResults = transformResults;
                function checkHttpStatus(response) {
                    response.hasReachedResponse = true;
                    if (response.status >= 200 && response.status < 300) {
                        return response;
                    }
                    else {
                        var contentType = response.headers.get("content-type");
                        var fetchDetails_1 = null;
                        if (response.fetch)
                            fetchDetails_1 = JSON.stringify(response.fetch);
                        // look for a json result
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return response.json().then(function (json) {
                                L2_1.default.exclamation(json.Message, "Http status code " + response.status);
                                L2_1.default.handleException(new Error(JSON.stringify(json)));
                                // TODO:
                                //!window.ICE.LogJavascriptErrorToDb(new Error(JSON.stringify(json)), null, { origin: "checkHttpStatus 01", fetch: fetchDetails });
                                throw json;
                            });
                        }
                        else {
                            return response.text().then(function (text) {
                                L2_1.default.exclamation(text, "Http status code 02 " + response.status);
                                L2_1.default.handleException(new Error(text), { origin: "checkHttpStatus 02", fetch: fetchDetails_1 });
                                throw response;
                            });
                        }
                    }
                }
                function parseJSON(response) {
                    return response.json().then(function (json) {
                        // if still a string after parsing once and it *looks* like json...
                        if (typeof (json) === "string" && json.startsWith("{") && json.endsWith("}"))
                            return JSON.parse(json);
                        return json;
                    });
                }
                function fetchCatch(ex) {
                    //console.log("fetch...");
                    //console.info(ex);
                    if (ex instanceof ApiResponseEndThenChain) {
                        ex.handled = true; //?
                        // handle special case where we just threw an exception(ApiResponseEndThenChain) to end any remaining 'thens' on the promise.
                        // we have to rethrow to prevent any additional '.then' callbacks from being executed
                        throw ex;
                    }
                    if (typeof (ex.hasReachedResponse) == "undefined" || !ex.hasReachedResponse) {
                        // we get here if no response was received from the fetch call, so the catch handler was called before checkHttpStatus. Mostly likely a network related problem.
                        var fetchDetails = null;
                        if (ex.fetch)
                            fetchDetails = JSON.stringify(ex.fetch);
                        L2_1.default.handleException(new Error(JSON.stringify(ex)), { origin: "fetchCatch", fetch: fetchDetails });
                        var msg = ex;
                        if (ex.Message)
                            msg = ex.Message;
                        return msg;
                    }
                    return ex;
                }
                function processApiResponse(json) {
                    // if the result is a string, test for ApiResponse
                    if (typeof (json) === "object" && typeof (json.ApiResponseVer) !== "undefined") {
                        var apiResponse = json;
                        switch (apiResponse.Type) {
                            case ApiResponseType.Success:
                                return apiResponse;
                            case ApiResponseType.InfoMsg:
                                L2_1.default.info(apiResponse.Message);
                                break;
                            case ApiResponseType.ExclamationModal:
                                L2_1.default.exclamation(apiResponse.Message, apiResponse.Title);
                                throw new ApiResponseEndThenChain();
                            case ApiResponseType.Exception:
                                L2_1.default.handleException(apiResponse);
                                throw new ApiResponseEndThenChain();
                        }
                        return apiResponse;
                    }
                    else {
                        return json;
                    }
                }
                var Batch = (function () {
                    function Batch() {
                        var routines = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            routines[_i - 0] = arguments[_i];
                        }
                        if (routines.length == 0) {
                            throw "You have to specify at least one routine to execute.";
                        }
                        for (var e in routines) {
                            if (!(routines[e] instanceof jsDAL.Sproc)) {
                                throw "All arguments must derive from jsDAL.Sproc.";
                            }
                        }
                        this.routineList = routines;
                    }
                    Batch.prototype.ExecQuery = function (options) {
                        var _this = this;
                        // default settings
                        var settings = {
                            AutoSetTokenGuid: true,
                            AutoProcessApiResponse: true,
                            ShowPageLoadingIndicator: true,
                            CommandTimeoutInSeconds: 60
                        };
                        options = options || {};
                        settings = L2_1.default.extend(settings, options);
                        return new Promise(function (resolve, reject) {
                            var batch = [];
                            for (var ix = 0; ix < _this.routineList.length; ix++) {
                                var r = _this.routineList[ix];
                                batch.push({ Ix: ix, Routine: r.getExecPacket() });
                            }
                            // create query string based on routine parameters
                            var optionsQueryStringArray = [];
                            if (settings) {
                                if (settings.AutoSetTokenGuid) {
                                    var tg = window["TokenGuid"];
                                    if (tg)
                                        optionsQueryStringArray.push("tokenGuid=" + tg);
                                }
                            }
                            var parmQueryString = optionsQueryStringArray.join("&");
                            fetchWrap(Server.serverUrl + "/api/execBatch?batch=" + JSON.stringify(batch) + "&options=" + parmQueryString)
                                .then(checkHttpStatus)
                                .then(parseJSON)
                                .then(transformResults)
                                .ifthen(options.AutoProcessApiResponse, processApiResponse)
                                .then(function (r) {
                                //console.dir(r);
                                for (var ix = 0; ix < _this.routineList.length; ix++) {
                                    var routine = _this.routineList[ix];
                                    var transformed = transformResults(r.Data[ix]);
                                    try {
                                        //if (options.AutoProcessApiResponse)
                                        processApiResponse(transformed);
                                    }
                                    catch (ex) { }
                                    routine.deferred.resolve(transformed);
                                }
                            })
                                .then(function (r) { return resolve(r); })["catch"](function (r) { fetchCatch(r); reject(r); });
                        });
                    };
                    Batch.prototype.ExecNonQuery = function (options) {
                        return null;
                    };
                    return Batch;
                }());
                jsDAL.Batch = Batch;
                var Deferred = (function () {
                    function Deferred() {
                        var _this = this;
                        this.promise = new Promise(function (resolve, reject) {
                            _this.reject = reject;
                            _this.resolve = resolve;
                        });
                    }
                    return Deferred;
                }());
                jsDAL.Deferred = Deferred;
                var Sproc /*implements Thenable<any>*/ = (function () {
                    function Sproc /*implements Thenable<any>*/(schema, routine, params, options) {
                        // TODO: turn this into a GET property
                        this.deferred = null;
                        this.schema = null;
                        this.routine = null;
                        this.routineParams = null;
                        this.isLoading = false;
                        this.deferred = new Deferred();
                        this.schema = schema;
                        this.routine = routine;
                        this.routineParams = params;
                        this.constructorOptions = options;
                    }
                    // something in angular 2 seems to break the instanceof check...not sure what yet
                    Sproc /*implements Thenable<any>*/.looksLikeADuck = function (val) {
                        if (!val)
                            return false;
                        return typeof (val.ExecQuery) === "function" && typeof (val.routine) === "string" && typeof (val.routineParams) === "object";
                    };
                    Sproc /*implements Thenable<any>*/.prototype.getExecPacket = function () {
                        return {
                            dbSource: this.dbSource,
                            dbConnection: Server.dbConnection,
                            schema: this.schema,
                            routine: this.routine,
                            params: this.constructorOptions,
                            $select: this.selectFieldsCsv
                        };
                    };
                    Sproc /*implements Thenable<any>*/.prototype.then = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        return this.deferred.promise.then.apply(this.deferred.promise, args);
                    };
                    Sproc /*implements Thenable<any>*/.prototype.Exec = function (method, options) {
                        var _this = this;
                        if (!method || method == "")
                            throw "'method' must be specified. Consider using the methods ExecQuery or ExecNonQuery.";
                        // default settings
                        var settings = {
                            AutoSetTokenGuid: true,
                            AutoProcessApiResponse: true,
                            ShowPageLoadingIndicator: true,
                            CommandTimeoutInSeconds: 60
                        };
                        var mappedParams = [];
                        options = options || {};
                        this.constructorOptions = this.constructorOptions || {};
                        options = L2_1.default.extend(options, this.constructorOptions);
                        settings = L2_1.default.extend(settings, options);
                        // TODO: can we just assume TypeScript's __extends exists?
                        //?__extends(options, this.constructorOptions);
                        //?__extends(settings, options);
                        // look for parameters passed in that match the expected routine parameters
                        if (options && this.routineParams) {
                            mappedParams = this.routineParams.filter(function (parmName) {
                                return options[parmName] !== undefined;
                            });
                        }
                        if (this.selectFieldsCsv)
                            settings.$select = this.selectFieldsCsv;
                        var startTick = performance.now();
                        this.isLoading = true;
                        return ExecGlobal(method, this.dbSource, this.schema, this.routine, mappedParams, settings).then(function (r) { _this.lastExecutionTime = performance.now() - startTick; _this.isLoading = false; _this.deferred.resolve(r); return r; });
                    };
                    Sproc /*implements Thenable<any>*/.prototype.ExecQuery = function (options) {
                        return this.Exec("GET", options);
                    };
                    Sproc /*implements Thenable<any>*/.prototype.ExecNonQuery = function (options) {
                        return this.Exec("POST", options);
                    };
                    Sproc /*implements Thenable<any>*/.prototype.ExecSingleResult = function (options) {
                        return this.Exec("GET", options).then(function (r) {
                            if (r && typeof (r.Data) !== "undefined" && typeof (r.Data.Table0) !== "undefined") {
                                var r1 = null;
                                var op = r.Data.OutputParms;
                                // take the first row of the first table in the result
                                if (r.Data.Table0.length > 0)
                                    r1 = r.Data.Table0[0];
                                // clean up existing Data object
                                delete r.Data;
                                r.Data = { OutputParms: op, Result: r1 };
                                return r;
                            }
                            return r;
                        });
                    };
                    // Limits the return
                    // Tables are split by ; (semi-colon)
                    // Columns are split by , (comma)
                    Sproc /*implements Thenable<any>*/.prototype.Select = function () {
                        var fieldNames = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            fieldNames[_i - 0] = arguments[_i];
                        }
                        if (fieldNames.length == null)
                            return this;
                        this.selectFieldsCsv = fieldNames.join(";");
                        return this;
                    };
                    return Sproc /*implements Thenable<any>*/;
                }());
                jsDAL.Sproc /*implements Thenable<any>*/ = Sproc /*implements Thenable<any>*/;
                var UDF = (function (_super) {
                    __extends(UDF, _super);
                    function UDF() {
                        _super.apply(this, arguments);
                    }
                    UDF.prototype.Exec = function (options) {
                        return _super.prototype.Exec.call(this, "SCALAR", options).then(function (r) {
                            // return the single result value
                            if (r.IsDate)
                                return new Date(r.Data);
                            return r.Data;
                        });
                    };
                    return UDF;
                }(Sproc));
                jsDAL.UDF = UDF;
            })(jsDAL || (jsDAL = {}));
            exports_1("default",jsDAL);
        }
    }
});
//# sourceMappingURL=L2.DAL.js.map