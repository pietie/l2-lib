"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var L2_1 = require("./L2");
var jsDAL;
(function (jsDAL) {
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
    function ExecGlobal(execFunction, httpMethod, dbSource, schema, routine, mappedParams, options, alwaysCBs) {
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
                if (parmValue != null) {
                    return encodeURIComponent(p) + "=" + encodeURIComponent(parmValue);
                }
                else {
                    return encodeURIComponent(p) + "=$jsDAL$.DBNull";
                }
            });
            var tokenGuid = null;
            var customHeaders = {};
            if (options) {
                if (options.AutoSetTokenGuid) {
                    tokenGuid = window["TokenGuid"];
                    // TODO: Consider moving this to the custom header array
                    if (tokenGuid)
                        parmQueryStringArray.push("tokenGuid=" + tokenGuid);
                }
                // TODO: Consider moving this to the custom header array
                if (options.$select)
                    parmQueryStringArray.push("$select=" + options.$select);
                //if (options.$captcha) parmQueryStringArray.push("$captcha=" + options.$captcha);
                if (options.$captcha) {
                    customHeaders["captcha-val"] = options.$captcha;
                }
            }
            var parmQueryString = parmQueryStringArray.join("&");
            if (parmQueryString && parmQueryString.length > 0 && parmQueryString != "")
                parmQueryString = "?" + parmQueryString;
            else
                parmQueryString = "";
            if (L2_1.jsDALServer.overridingDbSource)
                dbSource = L2_1.jsDALServer.overridingDbSource;
            if (L2_1.jsDALServer.applicationTitle) {
                //parmQueryStringArray.push("$at=" + encodeURIComponent(jsDALServer.applicationTitle));
                customHeaders["AppTitle"] = L2_1.jsDALServer.applicationTitle;
            }
            if (["exec", "execnq", "execScalar"].indexOf(execFunction) == -1) {
                throw new Error("Invalid execution method specified: " + execFunction);
            }
            // GET
            if (httpMethod == "GET") {
                var headers = null;
                if (customHeaders && Object.keys(customHeaders).length > 0) {
                    if (headers == null)
                        headers = {};
                    for (var e in customHeaders) {
                        headers[e] = customHeaders[e];
                    }
                }
                var init = null;
                if (headers) {
                    init = { headers: headers };
                }
                fetchWrap(L2_1.jsDALServer.serverUrl + "/api/" + execFunction + "/" + dbSource + "/" + L2_1.jsDALServer.dbConnection + "/" + schema + "/" + routine + parmQueryString, init, alwaysCBs)
                    .then(function (r) { return checkHttpStatus(r, options); })
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(function (r) { return resolve(r); })["catch"](function (r) { reject(fetchCatch(r, options)); return r; })["catch"](function (e) {
                    if (e instanceof ApiResponseEndThenChain)
                        return;
                    else
                        throw e;
                });
            }
            else if (httpMethod == "POST") {
                var bodyContent = {};
                mappedParams.forEach(function (p) { bodyContent[p] = options[p]; });
                if (tokenGuid)
                    bodyContent["tokenGuid"] = tokenGuid;
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
                for (var e in customHeaders) {
                    headers[e] = customHeaders[e];
                }
                fetchWrap(L2_1.jsDALServer.serverUrl + "/api/" + execFunction + "/" + dbSource + "/" + L2_1.jsDALServer.dbConnection + "/" + schema + "/" + routine, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(bodyContent)
                }, alwaysCBs)
                    .then(function (r) { return checkHttpStatus(r, options); })
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(function (r) { return resolve(r); })["catch"](function (r) { reject(fetchCatch(r, options)); })["catch"](function (e) {
                    if (e instanceof ApiResponseEndThenChain)
                        return;
                    else
                        throw e;
                });
            }
            else
                throw "Invalid HTTP method: " + httpMethod;
        });
    }
    function fetchWrap(url, init, alwaysCBs) {
        return new Promise(function (resolve, reject) {
            if (L2_1.jsDALServer.jwt != null) {
                if (!init)
                    init = {};
                if (!init.headers)
                    init.headers = {};
                init.headers["Authorization"] = "Bearer " + L2_1.jsDALServer.jwt.access_token;
            }
            // iOS prefers undefined over null
            if (init == null)
                init = undefined;
            fetch(url, init).then(function (r) {
                r.fetch = { url: url, init: init };
                resolve(r);
                return r;
            })["catch"](function (err) {
                // TODO: Figure out what to do here...zonejs fucks up any chance of a meaningful error.
                err.fetch = { url: url, init: init };
                reject(err);
                return err;
            }).then(function (r) {
                resolve(r);
                if (alwaysCBs)
                    callAlwaysCallbacks(r, alwaysCBs);
                return r;
            });
        });
    }
    function callAlwaysCallbacks(result, alwaysCBs) {
        var _this = this;
        if (!alwaysCBs || alwaysCBs.length == 0)
            return result;
        alwaysCBs.forEach(function (cb) {
            if (typeof cb === "function") {
                cb.call(_this, result);
                //cb.call
            }
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
    function checkHttpStatus(response, options) {
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
                    L2_1.L2.exclamation(json.Message, "Http status code " + response.status);
                    if (options && options.HandleExceptions) {
                        L2_1.L2.handleException(new Error(JSON.stringify(json)));
                    }
                    throw json;
                });
            }
            else {
                return response.text().then(function (text) {
                    L2_1.L2.exclamation(text, "Http status code 02 " + response.status);
                    if (options && options.HandleExceptions) {
                        L2_1.L2.handleException(new Error(text), { origin: "checkHttpStatus 02", fetch: fetchDetails_1 });
                    }
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
    function fetchCatch(ex, options) {
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
            if (options && options.HandleExceptions) {
                L2_1.L2.handleException(new Error(JSON.stringify(ex)), { origin: "fetchCatch", fetch: fetchDetails });
            }
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
                    L2_1.L2.info(apiResponse.Message);
                    break;
                case ApiResponseType.ExclamationModal:
                    L2_1.L2.exclamation(apiResponse.Message, apiResponse.Title);
                    throw new ApiResponseEndThenChain();
                case ApiResponseType.Exception:
                    L2_1.L2.handleException(apiResponse);
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
                routines[_i] = arguments[_i];
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
                HandleExceptions: true,
                ShowPageLoadingIndicator: true,
                CommandTimeoutInSeconds: 60
            };
            options = options || {};
            settings = L2_1.L2.extend(settings, options);
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
                fetchWrap(L2_1.jsDALServer.serverUrl + "/api/execBatch?batch=" + JSON.stringify(batch) + "&options=" + parmQueryString)
                    .then(function (r) { return checkHttpStatus(r, options); })
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
                    .then(function (r) { return resolve(r); })["catch"](function (r) { fetchCatch(r, options); reject(r); });
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
        function Sproc(schema, routine, params, options) {
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
        Sproc.setExecDefaults = function (def) {
            console.log("CURRENT exec defaults", Sproc._exeDefaults);
            for (var prop in def) {
                this._exeDefaults[prop] = def[prop];
            }
            console.log("NEW exec defaults", Sproc._exeDefaults);
        };
        // something in angular 2 seems to break the instanceof check...not sure what yet
        Sproc.looksLikeADuck = function (val) {
            if (!val)
                return false;
            return typeof (val.ExecQuery) === "function" && typeof (val.routine) === "string" && typeof (val.routineParams) === "object";
        };
        Sproc.prototype.getExecPacket = function () {
            return {
                dbSource: this.dbSource,
                dbConnection: L2_1.jsDALServer.dbConnection,
                schema: this.schema,
                routine: this.routine,
                params: this.constructorOptions,
                $select: this.selectFieldsCsv,
                $captcha: this.captchaVal
            };
        };
        Sproc.prototype.then = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return this.deferred.promise.then.apply(this.deferred.promise, args);
        };
        Sproc.prototype.always = function (cb) {
            if (!this._alwaysCallbacks)
                this._alwaysCallbacks = [];
            this._alwaysCallbacks.push(cb);
            return this;
        };
        Sproc.prototype.ExecRoutine = function (execFunction, options) {
            var _this = this;
            if (!execFunction || execFunction == "")
                throw new Error("'execFunction' must be specified. Consider using the methods ExecQuery or ExecNonQuery.");
            // default settings
            var settings = Sproc._exeDefaults;
            var mappedParams = [];
            options = options || {};
            this.constructorOptions = this.constructorOptions || {};
            options = L2_1.L2.extend(options, this.constructorOptions);
            settings = L2_1.L2.extend(settings, options);
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
            if (this.captchaVal)
                settings.$captcha = this.captchaVal;
            var startTick = performance.now();
            this.isLoading = true;
            return ExecGlobal(execFunction, settings.HttpMethod, this.dbSource, this.schema, this.routine, mappedParams, settings, this._alwaysCallbacks)
                .then(function (r) { _this.lastExecutionTime = performance.now() - startTick; _this.isLoading = false; _this.deferred.resolve(r); return r; });
        };
        Sproc.prototype.ExecQuery = function (options) {
            options = L2_1.L2.extend({ HttpMethod: "GET" }, options); // default to GET for ExecQuery
            return this.ExecRoutine("exec", options);
        };
        Sproc.prototype.ExecNonQuery = function (options) {
            options = L2_1.L2.extend({ HttpMethod: "POST" }, options); // default to POST for ExecNonQuery
            return this.ExecRoutine("execnq", options);
        };
        Sproc.prototype.ExecSingleResult = function (options) {
            options = L2_1.L2.extend({ HttpMethod: "GET" }, options);
            return this.ExecRoutine("exec", options).then(function (r) {
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
        Sproc.prototype.Select = function () {
            var fieldNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fieldNames[_i] = arguments[_i];
            }
            if (fieldNames.length == null)
                return this;
            this.selectFieldsCsv = fieldNames.join(";");
            return this;
        };
        Sproc.prototype.captcha = function (captchaResponseValue) {
            this.captchaVal = captchaResponseValue;
            return this;
        };
        return Sproc;
    }());
    Sproc._exeDefaults = {
        AutoSetTokenGuid: true,
        AutoProcessApiResponse: true,
        HandleExceptions: true,
        ShowPageLoadingIndicator: true,
        CommandTimeoutInSeconds: 60
    };
    jsDAL.Sproc = Sproc;
    var UDF = (function (_super) {
        __extends(UDF, _super);
        function UDF() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        UDF.prototype.Exec = function (options) {
            options = L2_1.L2.extend({ HttpMethod: "GET" }, options);
            return _super.prototype.ExecRoutine.call(this, "execScalar", options).then(function (r) {
                // return the single result value
                if (r.IsDate)
                    return new Date(r.Data);
                return r.Data;
            });
        };
        return UDF;
    }(Sproc));
    jsDAL.UDF = UDF;
    var ServerVariables = (function () {
        function ServerVariables() {
        }
        ServerVariables.ClientIP = function () {
            return ServerVariables.PREFIX_MARKER + ".RemoteClient.IP";
        };
        return ServerVariables;
    }());
    ServerVariables.PREFIX_MARKER = "$jsDAL$";
    jsDAL.ServerVariables = ServerVariables;
})(jsDAL = exports.jsDAL || (exports.jsDAL = {}));
//export default jsDAL;
//# sourceMappingURL=L2.DAL.js.map