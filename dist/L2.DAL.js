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
    var Exec = (function () {
        function Exec() {
        }
        Exec.ExecGlobal = function (exec) {
            return new Promise(function (resolve, reject) {
                // create query string based on routine parameters
                var parmQueryStringArray = exec.mappedParams.map(function (p) {
                    var parmValue = exec.options[p];
                    // serialize Date/moment objects to ISO string format
                    if (typeof (moment) != "undefined" && moment.isMoment(parmValue)) {
                        parmValue = Exec.ConvertDateToISOWithTimeOffset(parmValue.toDate()); //parmValue.toDate().toISOString();
                    }
                    else if (parmValue instanceof Date) {
                        //parmValue = parmValue.toISOString();
                        parmValue = Exec.ConvertDateToISOWithTimeOffset(parmValue);
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
                if (exec.options) {
                    if (exec.options.AutoSetTokenGuid) {
                        tokenGuid = window["TokenGuid"];
                        // TODO: Consider moving this to the custom header array
                        if (tokenGuid)
                            parmQueryStringArray.push("tokenGuid=" + tokenGuid);
                    }
                    // TODO: Consider moving this to the custom header array
                    if (exec.options.$select)
                        parmQueryStringArray.push("$select=" + exec.options.$select);
                    //if (options.$captcha) parmQueryStringArray.push("$captcha=" + options.$captcha);
                    if (exec.options.$captcha) {
                        customHeaders["captcha-val"] = exec.options.$captcha;
                    }
                }
                var parmQueryString = parmQueryStringArray.join("&");
                if (parmQueryString && parmQueryString.length > 0 && parmQueryString != "")
                    parmQueryString = "?" + parmQueryString;
                else
                    parmQueryString = "";
                if (L2_1.jsDALServer.overridingDbSource)
                    exec.dbSource = L2_1.jsDALServer.overridingDbSource;
                if (L2_1.jsDALServer.applicationTitle) {
                    customHeaders["App-Title"] = L2_1.jsDALServer.applicationTitle;
                }
                if (["exec", "execnq", "execScalar", "batch"].indexOf(exec.execFunction) == -1) {
                    throw new Error("Invalid execution method specified: " + exec.execFunction);
                }
                // GET
                if (exec.httpMethod == "GET") {
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
                    var getUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + exec.dbSource + "/" + L2_1.jsDALServer.dbConnection + "/" + exec.schema + "/" + exec.routine + parmQueryString;
                    // endpoint overrides everything else
                    if (L2_1.jsDALServer.endpoint) {
                        getUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + L2_1.jsDALServer.endpoint + "/" + exec.schema + "/" + exec.routine + parmQueryString;
                    }
                    Exec.fetchWrap(getUrl, init, exec.alwaysCBs)
                        .then(function (r) { return Exec.checkHttpStatus(r, exec.options); })
                        .then(Exec.parseJSON)
                        .then(transformResults)
                        .ifthen(exec.options.AutoProcessApiResponse, Exec.processApiResponse)
                        .then(function (r) { return resolve(r); })["catch"](function (r) { reject(Exec.fetchCatch(r, exec.options)); return r; })["catch"](function (e) {
                        if (e instanceof ApiResponseEndThenChain)
                            return;
                        else
                            throw e;
                    });
                }
                else if (exec.httpMethod == "POST") {
                    var bodyContent = {};
                    exec.mappedParams.forEach(function (p) { bodyContent[p] = exec.options[p]; });
                    if (tokenGuid)
                        bodyContent["tokenGuid"] = tokenGuid;
                    var headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    };
                    for (var e in customHeaders) {
                        headers[e] = customHeaders[e];
                    }
                    var postUrl = null;
                    if (exec.execFunction == "batch") {
                        postUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + L2_1.jsDALServer.dbConnection;
                        // endpoint overrides everything else
                        if (L2_1.jsDALServer.endpoint) {
                            postUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + L2_1.jsDALServer.endpoint;
                        }
                    }
                    else {
                        postUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + exec.dbSource + "/" + L2_1.jsDALServer.dbConnection + "/" + exec.schema + "/" + exec.routine;
                        // endpoint overrides everything else
                        if (L2_1.jsDALServer.endpoint) {
                            postUrl = L2_1.jsDALServer.serverUrl + "/api/" + exec.execFunction + "/" + L2_1.jsDALServer.endpoint + "/" + exec.schema + "/" + exec.routine;
                        }
                    }
                    Exec.fetchWrap(postUrl, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(bodyContent)
                    }, exec.alwaysCBs)
                        .then(function (r) { return Exec.checkHttpStatus(r, exec.options); })
                        .then(Exec.parseJSON)
                        .then(transformResults)
                        .ifthen(exec.options.AutoProcessApiResponse, Exec.processApiResponse)
                        .then(function (r) { return resolve(r); })["catch"](function (r) { reject(Exec.fetchCatch(r, exec.options)); })["catch"](function (e) {
                        if (e instanceof ApiResponseEndThenChain)
                            return;
                        else
                            throw e;
                    });
                }
                else
                    throw "Invalid HTTP method: " + exec.httpMethod;
            });
        }; // ExecGlobal
        Exec.ConvertDateToISOWithTimeOffset = function (dt) {
            var timezone_offset_min = dt.getTimezoneOffset(), offset_hrs = parseInt(Math.abs(timezone_offset_min / 60)), offset_min = Math.abs(timezone_offset_min % 60), timezone_standard;
            if (offset_hrs < 10)
                offset_hrs = '0' + offset_hrs;
            if (offset_min < 10)
                offset_min = '0' + offset_min;
            // Add an opposite sign to the offset
            // If offset is 0, it means timezone is UTC
            if (timezone_offset_min < 0)
                timezone_standard = '+' + offset_hrs + ':' + offset_min;
            else if (timezone_offset_min > 0)
                timezone_standard = '-' + offset_hrs + ':' + offset_min;
            else if (timezone_offset_min == 0)
                timezone_standard = 'Z';
            var current_date = dt.getDate(), current_month = dt.getMonth() + 1, current_year = dt.getFullYear(), current_hrs = dt.getHours(), current_mins = dt.getMinutes(), current_secs = dt.getSeconds(), current_datetime;
            // Add 0 before date, month, hrs, mins or secs if they are less than 0
            current_date = current_date < 10 ? '0' + current_date : current_date;
            current_month = current_month < 10 ? '0' + current_month : current_month;
            current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
            current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
            current_secs = current_secs < 10 ? '0' + current_secs : current_secs;
            return current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs + timezone_standard;
        };
        Exec.fetchWrap = function (url, init, alwaysCBs) {
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
                        Exec.callAlwaysCallbacks(r, alwaysCBs);
                    return r;
                });
            });
        };
        Exec.callAlwaysCallbacks = function (result, alwaysCBs) {
            var _this = this;
            if (!alwaysCBs || alwaysCBs.length == 0)
                return result;
            alwaysCBs.forEach(function (cb) {
                if (typeof cb === "function") {
                    cb.call(_this, result);
                }
            });
        };
        Exec.checkHttpStatus = function (response, options) {
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
        };
        Exec.parseJSON = function (response) {
            return response.json().then(function (json) {
                // if still a string after parsing once and it *looks* like json...
                if (typeof (json) === "string" && json.startsWith("{") && json.endsWith("}"))
                    return JSON.parse(json);
                return json;
            });
        };
        Exec.fetchCatch = function (ex, options) {
            if (ex instanceof ApiResponseEndThenChain) {
                ex.handled = true; //?
                // handle special case where we just threw an exception(ApiResponseEndThenChain) to end any remaining 'thens' on the promise.
                // we have to rethrow to prevent any additional '.then' callbacks from being executed
                throw ex;
            }
            else if (ex instanceof TypeError) {
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
        };
        Exec.processApiResponse = function (json) {
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
        };
        return Exec;
    }());
    var Batch = (function () {
        function Batch() {
            var routines = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                routines[_i] = arguments[_i];
            }
            this.isLoading = false;
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
        Batch.prototype.always = function (cb) {
            if (!this._alwaysCallbacks)
                this._alwaysCallbacks = [];
            this._alwaysCallbacks.push(cb);
            return this;
        };
        Batch.prototype.Exec = function (options) {
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
            var startTick = performance.now();
            this.isLoading = true;
            var batch = [];
            for (var ix = 0; ix < this.routineList.length; ix++) {
                batch.push({ Ix: ix, Routine: this.routineList[ix].getExecPacket() });
            }
            var mappedParams = [];
            settings["batch-data"] = batch;
            mappedParams.push("batch-data");
            ///return ExecGlobal("batch", "POST"/*settings.HttpMethod*/, null, null, null, mappedParams, settings, this._alwaysCallbacks)
            return Exec.ExecGlobal({
                execFunction: "batch",
                httpMethod: "POST",
                mappedParams: mappedParams,
                options: settings,
                alwaysCBs: this._alwaysCallbacks
            })
                .then(function (r) {
                _this.lastExecutionTime = performance.now() - startTick;
                _this.isLoading = false;
                for (var ix_1 = 0; ix_1 < _this.routineList.length; ix_1++) {
                    var routine = _this.routineList[ix_1];
                    var transformed = transformResults(r.Data[ix_1]);
                    try {
                        //if (options.AutoProcessApiResponse)
                        Exec.processApiResponse(transformed);
                    }
                    catch (ex) { }
                    routine.deferred.resolve(transformed);
                }
                return r;
            });
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
            ////return ExecGlobal(execFunction, settings.HttpMethod, this.dbSource, this.schema, this.routine, mappedParams, settings, this._alwaysCallbacks)
            ////    .then(r => { this.lastExecutionTime = performance.now() - startTick; this.isLoading = false; this.deferred.resolve(r); return r; });
            return Exec.ExecGlobal({
                execFunction: execFunction,
                httpMethod: settings.HttpMethod,
                dbSource: this.dbSource,
                schema: this.schema,
                routine: this.routine,
                mappedParams: mappedParams,
                options: settings,
                alwaysCBs: this._alwaysCallbacks
            })
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