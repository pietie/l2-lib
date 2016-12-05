import L2 from "./L2"


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
    Array.prototype.filter = function (fun/*, thisArg*/) {
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


interface Error {
    response: any;
}

export interface JWT {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
}


module jsDAL {

    export class Server {
        //private static _serverUrl: string;
        //private static _dbConnection: string;
        // 30/08/2016, PL: IE8 does not support GET/SET properties
        //static get serverUrl(): string {
        //    return Server._serverUrl;
        //}

        //static get dbConnection(): string {
        //    return Server._dbConnection;
        //}
        public static serverUrl: string;
        public static dbConnection: string;
        public static jwt: JWT;
        static configure(options: IDALServerOptions) {

            if (options.dbConnection == "") options.dbConnection = null;

            Server.serverUrl = options.serverUrl;
            Server.dbConnection = options.dbConnection;
            Server.jwt = options.jwt;
        }
    }

    export interface IDALServerOptions {
        serverUrl?: string;
        dbConnection?: string;
        jwt?: JWT;
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

    class ApiResponseEndThenChain { handled: boolean; }


    Promise.prototype.ifthen = function (cond, cb) {
        //if (cond) return this.then(cb);  
        return this.then(r => {
            if (cond) return cb(r);
            else return r;
        });
    }

    export interface IExecDefaults {
        AutoSetTokenGuid?: boolean;
        AutoProcessApiResponse?: boolean;
        ShowPageLoadingIndicator?: boolean;
        CommandTimeoutInSeconds?: number; // SQL Command timeout
        $select?: string;
    }


    function ExecGlobal(method: string, dbSource: string, schema: string, routine: string, mappedParams: any[], options: (IExecDefaults)): Promise<any> {

        return new Promise((resolve, reject) => {
            // create query string based on routine parameters
            var parmQueryStringArray: any[] = mappedParams.map(p => {
                var parmValue = options[p];

                // serialize Date/moment objects to ISO string format
                if (typeof (moment) != "undefined" && moment.isMoment(parmValue)) {
                    parmValue = parmValue.toDate().toISOString();
                }
                else if (parmValue instanceof Date) {
                    parmValue = parmValue.toISOString();
                }

                return encodeURIComponent(p) + "=" + encodeURIComponent(parmValue)
            });

            var tokenGuid: string = null;

            if (options) {
                if (options.AutoSetTokenGuid) {
                    tokenGuid = window["TokenGuid"];

                    if (tokenGuid) parmQueryStringArray.push("tokenGuid=" + tokenGuid);
                }

                if (options.$select) parmQueryStringArray.push("$select=" + options.$select);

            }

            var parmQueryString = parmQueryStringArray.join("&");

            if (parmQueryString && parmQueryString.length > 0 && parmQueryString != "") parmQueryString = "?" + parmQueryString;
            else parmQueryString = "";

            // GET
            if (method == "GET") {
                fetchWrap(`${Server.serverUrl}/api/exec/${dbSource}/${Server.dbConnection}/${schema}/${routine}${parmQueryString}`)
                    .then(checkHttpStatus)
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r)); return r; })
                    ;
            }
            else if (method == "POST") {
                var bodyContent = {};

                mappedParams.forEach(p => { bodyContent[p] = options[p]; });

                if (tokenGuid) bodyContent["tokenGuid"] = tokenGuid;

                fetchWrap(`${Server.serverUrl}/api/exec/${dbSource}/${Server.dbConnection}/${schema}/${routine}`
                    , {
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
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r)); })
                    ;
            }
            else if (method == "SCALAR") {
                fetchWrap(`${Server.serverUrl}/api/execScalar/${dbSource}/${Server.dbConnection}/${schema}/${routine}${parmQueryString}`, {
                    credentials: 'same-origin'
                })
                    .then(checkHttpStatus)
                    .then(parseJSON)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r)); })
                    ;
            }
            else throw "Invalid method: " + method;

            // Handle result? --> special handling of ApiResponse?!


        });
    }

    function fetchWrap(url: string | Request, init?: RequestInit|any): any | Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            if (jsDAL.Server.jwt != null) {

                if (!init) init = {};
                if (!init.headers) init.headers = {};

                init.headers["Authorization"] = `Bearer ${jsDAL.Server.jwt.access_token}`;
            }

            fetch(url, init).then((r: any) => {
                r.fetch = { url: url, init: init };
                resolve(r);
            })["catch"](err => {
                err.fetch = { url: url, init: init };
                reject(err);
            }).then(r => { resolve(<any>r); });
        });
    }

    export function transformResults(r) {

        if (typeof (r.Data) === "undefined") return r;

        for (var e in r.Data) {

            if (!(e.substring(0, 5) == "Table")) continue;

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

    function checkHttpStatus(response: Response | any): any {

        response.hasReachedResponse = true;
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var contentType = response.headers.get("content-type");

            let fetchDetails: string = null;

            if (response.fetch) fetchDetails = JSON.stringify(response.fetch);

            // look for a json result
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(function (json) {
                    L2.exclamation(json.Message, "Http status code " + response.status);
                    L2.handleException(new Error(JSON.stringify(json)));
                    // TODO:
                    //!window.ICE.LogJavascriptErrorToDb(new Error(JSON.stringify(json)), null, { origin: "checkHttpStatus 01", fetch: fetchDetails });
                    throw json;
                });
            } else {
                return response.text().then(function (text) {
                    L2.exclamation(text, "Http status code 02 " + response.status);
                    L2.handleException(new Error(text), { origin: "checkHttpStatus 02", fetch: fetchDetails });

                    throw response;
                });
            }
        }
    }

    function parseJSON(response) {
        return response.json().then((json) => {
            // if still a string after parsing once and it *looks* like json...
            if (typeof (json) === "string" && (<any>json).startsWith("{") && (<any>json).endsWith("}")) return JSON.parse(json);
            return json;
        });
    }

    function fetchCatch(ex: any) {
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

            if (ex.fetch) fetchDetails = JSON.stringify(ex.fetch);

            L2.handleException(new Error(JSON.stringify(ex)), { origin: "fetchCatch", fetch: fetchDetails });

            var msg = ex;

            if (ex.Message) msg = ex.Message;


            return msg;
        }

        return ex;
    }

    function processApiResponse(json): Response {

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
                    L2.exclamation(apiResponse.Message, apiResponse.Title);
                    throw new ApiResponseEndThenChain();
                case ApiResponseType.Exception:
                    L2.handleException(apiResponse);
                    throw new ApiResponseEndThenChain();
            }


            return apiResponse;
        }
        else {
            return json;
        }

    }

    export class Batch {

        private routineList: Sproc[];

        constructor(...routines: Sproc[]) {
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

        public ExecQuery(options?: IExecDefaults & IExecDefaults): Promise<any> {
            // default settings
            let settings: IExecDefaults = {
                AutoSetTokenGuid: true,
                AutoProcessApiResponse: true,
                ShowPageLoadingIndicator: true,
                CommandTimeoutInSeconds: 60
            };

            options = options || {};

            settings = L2.extend(settings, options);

            return new Promise((resolve, reject) => {

                var batch = [];

                for (var ix = 0; ix < this.routineList.length; ix++) {
                    var r = this.routineList[ix];

                    batch.push({ Ix: ix, Routine: r.getExecPacket() });
                }

                // create query string based on routine parameters
                var optionsQueryStringArray: any[] = [];

                if (settings) {
                    if (settings.AutoSetTokenGuid) {
                        var tg = window["TokenGuid"];

                        if (tg) optionsQueryStringArray.push("tokenGuid=" + tg);
                    }
                }

                var parmQueryString = optionsQueryStringArray.join("&");

                fetchWrap(`${Server.serverUrl}/api/execBatch?batch=${JSON.stringify(batch)}&options=${parmQueryString}`)
                    .then(checkHttpStatus)
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => {
                        //console.dir(r);
                        for (var ix = 0; ix < this.routineList.length; ix++) {
                            var routine = this.routineList[ix];

                            var transformed = transformResults(r.Data[ix]);

                            try {
                                //if (options.AutoProcessApiResponse)
                                processApiResponse(transformed);
                            }
                            catch (ex) { /*ignore exceptions*/ }

                            routine.deferred.resolve(transformed);
                        }

                    })
                    .then(r => resolve(r))
                ["catch"](r => { fetchCatch(r); reject(r) })
                    ;

            });
        }

        public ExecNonQuery(options?: any): Promise<any> {
            return null;
        }
    }

    export class Deferred {
        public promise: Promise<any>;
        public resolve: (value?: any | PromiseLike<any>) => void;
        public reject: (error?: any) => void;

        constructor() {
            this.promise = new Promise((resolve, reject) => {
                this.reject = reject
                this.resolve = resolve
            })
        }
    }

    export class Sproc /*implements Thenable<any>*/ {

        // TODO: turn this into a GET property
        public deferred: Deferred = null;

        protected dbSource: string;
        protected catalog: string;

        private schema: string = null;
        private routine: string = null;
        private routineParams: string[] = null;
        private constructorOptions: any;

        private selectFieldsCsv: string;

        public lastExecutionTime: number;
        public isLoading: boolean = false;


        // something in angular 2 seems to break the instanceof check...not sure what yet
        public static looksLikeADuck(val: any): boolean {
            if (!val) return false;
            return typeof (val.ExecQuery) === "function" && typeof (val.routine) === "string" && typeof (val.routineParams) === "object";
        }

        public getExecPacket(): { dbSource: string, dbConnection: string, schema: string, routine: string, params: string[], $select: string } {
            return {
                dbSource: this.dbSource,
                dbConnection: Server.dbConnection,
                schema: this.schema,
                routine: this.routine,
                params: this.constructorOptions,
                $select: this.selectFieldsCsv
            };
        }

        constructor(schema: string, routine: string, params?: string[], options?: IExecDefaults) {
            this.deferred = new Deferred();

            this.schema = schema;
            this.routine = routine;
            this.routineParams = params;
            this.constructorOptions = options;
        }

        public then(...args) {
            return this.deferred.promise.then.apply(this.deferred.promise, args);
        }

        protected Exec(method: string, options?: IExecDefaults): Promise<any> {

            if (!method || method == "")
                throw `'method' must be specified. Consider using the methods ExecQuery or ExecNonQuery.`;


            // default settings
            let settings: IExecDefaults = {
                AutoSetTokenGuid: true,
                AutoProcessApiResponse: true,
                ShowPageLoadingIndicator: true,
                CommandTimeoutInSeconds: 60
            };

            var mappedParams: any[] = [];

            options = options || {};
            this.constructorOptions = this.constructorOptions || {};


            options = L2.extend(options, this.constructorOptions);
            settings = L2.extend(settings, options);
            // TODO: can we just assume TypeScript's __extends exists?

            //?__extends(options, this.constructorOptions);
            //?__extends(settings, options);

            // look for parameters passed in that match the expected routine parameters
            if (options && this.routineParams) {
                mappedParams = this.routineParams.filter(parmName => {
                    return options[parmName] !== undefined;
                });
            }

            if (this.selectFieldsCsv) settings.$select = this.selectFieldsCsv;
            let startTick = performance.now();
            this.isLoading = true;

            return ExecGlobal(method, this.dbSource, this.schema, this.routine, mappedParams, settings).then(r => { this.lastExecutionTime = performance.now() - startTick; this.isLoading = false; this.deferred.resolve(r); return r; });
        }

        public ExecQuery(options?: IExecDefaults): Promise<any> {
            return this.Exec("GET", options);
        }

        public ExecNonQuery(options?: IExecDefaults): Promise<any> {
            return this.Exec("POST", options);
        }

        public ExecSingleResult(options?: IExecDefaults): Promise<any> {
            return this.Exec("GET", options).then(r => {

                if (r && typeof (r.Data) !== "undefined" && typeof (r.Data.Table0) !== "undefined") {

                    var r1 = null;
                    var op = r.Data.OutputParms;
                    // take the first row of the first table in the result
                    if (r.Data.Table0.length > 0) r1 = r.Data.Table0[0];

                    // clean up existing Data object
                    delete r.Data;

                    r.Data = { OutputParms: op, Result: r1 };

                    return r;
                }

                return r;

            });
        }


        // Limits the return
        // Tables are split by ; (semi-colon)
        // Columns are split by , (comma)
        public Select(...fieldNames: string[][]): Sproc {
            if (fieldNames.length == null) return this;

            this.selectFieldsCsv = fieldNames.join(";");
            return this;
        }


    }

    export class UDF extends Sproc {
        public Exec(options?: IExecDefaults): Promise<any> {
            return super.Exec("SCALAR", options).then(r => {
                // return the single result value
                if (r.IsDate) return new Date(r.Data);
                return r.Data;
            });
        }
    }


    export class ServerVariables {
        private static PREFIX_MARKER:string = "$jsDAL$";
        static get ClientIP(): string {
            return `${ServerVariables.PREFIX_MARKER}.RemoteClient.IP`;
        }
    }
}



export default jsDAL;