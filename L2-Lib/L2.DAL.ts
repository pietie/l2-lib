import { L2, jsDALServer } from "./L2";

//L2 = window["L2"] || L2;

interface Error {
    response: any;
}



export module jsDAL {



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

    if (typeof ((<any>Promise).prototype.ifthen) == "undefined") {
        (<any>Promise).prototype.ifthen = function (cond, cb) {
            //if (cond) return this.then(cb);  
            return this.then(r => {
                if (cond) return cb(r);
                else return r;
            });
        }
    }

    export interface IExecDefaults {
        AutoSetTokenGuid?: boolean;
        AutoProcessApiResponse?: boolean;
        HandleExceptions?: boolean;
        ShowPageLoadingIndicator?: boolean;
        CommandTimeoutInSeconds?: number; // SQL Command timeout
        $select?: string;
        $captcha?: string;
        HttpMethod?: string;
    }

    function ConvertDateToISOWithTimeOffset(dt: Date): string { // http://usefulangle.com/post/30/javascript-get-date-time-with-offset-hours-minutes
        let timezone_offset_min: number = dt.getTimezoneOffset(),
            offset_hrs: any = parseInt(<any>Math.abs(timezone_offset_min / 60)),
            offset_min: any = Math.abs(timezone_offset_min % 60),
            timezone_standard;

        if (offset_hrs < 10) offset_hrs = '0' + offset_hrs;

        if (offset_min < 10) offset_min = '0' + offset_min;

        // Add an opposite sign to the offset
        // If offset is 0, it means timezone is UTC
        if (timezone_offset_min < 0) timezone_standard = '+' + offset_hrs + ':' + offset_min;
        else if (timezone_offset_min > 0) timezone_standard = '-' + offset_hrs + ':' + offset_min;
        else if (timezone_offset_min == 0) timezone_standard = 'Z';

        let current_date: any = dt.getDate(),
            current_month: any = dt.getMonth() + 1,
            current_year: any = dt.getFullYear(),
            current_hrs: any = dt.getHours(),
            current_mins: any = dt.getMinutes(),
            current_secs: any = dt.getSeconds(),
            current_datetime;

        // Add 0 before date, month, hrs, mins or secs if they are less than 0
        current_date = current_date < 10 ? '0' + current_date : current_date;
        current_month = current_month < 10 ? '0' + current_month : current_month;
        current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
        current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
        current_secs = current_secs < 10 ? '0' + current_secs : current_secs;

        return current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs + timezone_standard;
    }


    function ExecGlobal(execFunction: string, httpMethod, dbSource: string, schema: string, routine: string
        , mappedParams: any[]
        , options: (IExecDefaults)
        , alwaysCBs?: ((res: any) => any)[]

    ): Promise<any> {

        return new Promise((resolve, reject) => {
            // create query string based on routine parameters
            var parmQueryStringArray: any[] = mappedParams.map(p => {
                var parmValue = options[p];

                // serialize Date/moment objects to ISO string format
                if (typeof (moment) != "undefined" && moment.isMoment(parmValue)) {
                    parmValue = ConvertDateToISOWithTimeOffset(parmValue.toDate()); //parmValue.toDate().toISOString();
                }
                else if (parmValue instanceof Date) {
                    //parmValue = parmValue.toISOString();
                    parmValue = ConvertDateToISOWithTimeOffset(parmValue);
                }

                if (parmValue != null) {
                    return encodeURIComponent(p) + "=" + encodeURIComponent(parmValue)
                }
                else {
                    return encodeURIComponent(p) + "=$jsDAL$.DBNull";
                }
            });


            let tokenGuid: string = null;
            let customHeaders: { [key: string]: string } = {};

            if (options) {
                if (options.AutoSetTokenGuid) {
                    tokenGuid = window["TokenGuid"];

                    // TODO: Consider moving this to the custom header array
                    if (tokenGuid) parmQueryStringArray.push("tokenGuid=" + tokenGuid);
                }

                // TODO: Consider moving this to the custom header array
                if (options.$select) parmQueryStringArray.push("$select=" + options.$select);
                //if (options.$captcha) parmQueryStringArray.push("$captcha=" + options.$captcha);
                if (options.$captcha) {
                    customHeaders["captcha-val"] = options.$captcha;
                }

            }

            var parmQueryString = parmQueryStringArray.join("&");

            if (parmQueryString && parmQueryString.length > 0 && parmQueryString != "") parmQueryString = "?" + parmQueryString;
            else parmQueryString = "";

            if (jsDALServer.overridingDbSource) dbSource = jsDALServer.overridingDbSource;

            if (jsDALServer.applicationTitle) {
                //parmQueryStringArray.push("$at=" + encodeURIComponent(jsDALServer.applicationTitle));
                customHeaders["App-Title"] = jsDALServer.applicationTitle;
            }

            if (["exec", "execnq", "execScalar", "batch"].indexOf(execFunction) == -1) {
                throw new Error(`Invalid execution method specified: ${execFunction}`);
            }

            // GET
            if (httpMethod == "GET") {
                let headers = null;

                if (customHeaders && Object.keys(customHeaders).length > 0) {
                    if (headers == null) headers = {};
                    for (let e in customHeaders) {
                        headers[e] = customHeaders[e];
                    }
                }

                let init = null;

                if (headers) {
                    init = { headers: headers };
                }

                fetchWrap(`${jsDALServer.serverUrl}/api/${execFunction}/${dbSource}/${jsDALServer.dbConnection}/${schema}/${routine}${parmQueryString}`, init, alwaysCBs)
                    .then(r => { return checkHttpStatus(r, options); })
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r, options)); return r; })
                ["catch"](function (e) {
                    if (e instanceof ApiResponseEndThenChain) return;
                    else throw e;
                })
                    ;
            }
            else if (httpMethod == "POST") {
                var bodyContent = {};

                mappedParams.forEach(p => { bodyContent[p] = options[p]; });

                if (tokenGuid) bodyContent["tokenGuid"] = tokenGuid;

                let headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };

                for (let e in customHeaders) {
                    headers[e] = customHeaders[e];
                }

                let postUrl: string = null;

                if (execFunction == "batch") {
                    postUrl = `${jsDALServer.serverUrl}/api/${execFunction}/${jsDALServer.dbConnection}`;
                }
                else {
                    postUrl = `${jsDALServer.serverUrl}/api/${execFunction}/${dbSource}/${jsDALServer.dbConnection}/${schema}/${routine}`;
                }
                fetchWrap(postUrl
                    , {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(bodyContent)
                    }, alwaysCBs)
                    .then(r => { return checkHttpStatus(r, options); })
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r, options)); })
                ["catch"](function (e) {
                    if (e instanceof ApiResponseEndThenChain) return;
                    else throw e;
                })
                    ;
            }
            else throw "Invalid HTTP method: " + httpMethod;

        });
    }

    function fetchWrap(url: string | Request
        , init?: RequestInit | any
        , alwaysCBs?: ((res: any) => any)[]): any | Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            if (jsDALServer.jwt != null) {

                if (!init) init = {};
                if (!init.headers) init.headers = {};

                init.headers["Authorization"] = `Bearer ${jsDALServer.jwt.access_token}`;
            }


            // iOS prefers undefined over null
            if (init == null) init = undefined;

            fetch(url, init).then((r: any) => {
                r.fetch = { url: url, init: init };
                resolve(r);
                return r;
            })["catch"](err => {
                // TODO: Figure out what to do here...zonejs fucks up any chance of a meaningful error.
                err.fetch = { url: url, init: init };
                reject(err);
                return err;
            }).then(r => {
                resolve(<any>r);

                if (alwaysCBs) callAlwaysCallbacks(r, alwaysCBs);

                return r;
            });
        });
    }

    function callAlwaysCallbacks(result: any, alwaysCBs?: ((res: any) => any)[]) {

        if (!alwaysCBs || alwaysCBs.length == 0) return result;

        alwaysCBs.forEach(cb => {

            if (typeof cb === "function") {

                cb.call(this, result);
                //cb.call
            }

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

    function checkHttpStatus(response: Response | any, options?: IExecDefaults): any {

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

                    if (options && options.HandleExceptions) {
                        L2.handleException(new Error(JSON.stringify(json)));
                    }

                    throw json;
                });
            } else {
                return response.text().then(function (text) {
                    L2.exclamation(text, "Http status code 02 " + response.status);

                    if (options && options.HandleExceptions) {
                        L2.handleException(new Error(text), { origin: "checkHttpStatus 02", fetch: fetchDetails });
                    }

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

    function fetchCatch(ex: any, options?: IExecDefaults) {
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

            if (options && options.HandleExceptions) {
                L2.handleException(new Error(JSON.stringify(ex)), { origin: "fetchCatch", fetch: fetchDetails });
            }

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

        public lastExecutionTime: number;
        public isLoading: boolean = false;

        private _alwaysCallbacks: ((res: any) => any)[];


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

        public always(cb: (...any) => any): Batch {
            if (!this._alwaysCallbacks) this._alwaysCallbacks = [];

            this._alwaysCallbacks.push(cb);

            return this;
        }

        /*
            Sproc:


        protected ExecRoutine(execFunction: string, options?: IExecDefaults): Promise<any> {

            if (!execFunction || execFunction == "")
                throw new Error(`'execFunction' must be specified. Consider using the methods ExecQuery or ExecNonQuery.`);

            // default settings
            let settings: IExecDefaults = Sproc._exeDefaults;

            var mappedParams: any[] = [];

            options = options || {};
            this.constructorOptions = this.constructorOptions || {};


            options = L2.extend(options, this.constructorOptions);
            settings = L2.extend(settings, options);

            // look for parameters passed in that match the expected routine parameters
            if (options && this.routineParams) {
                mappedParams = this.routineParams.filter(parmName => {
                    return options[parmName] !== undefined;
                });
            }

            if (this.selectFieldsCsv) settings.$select = this.selectFieldsCsv;
            if (this.captchaVal) settings.$captcha = this.captchaVal;

            let startTick = performance.now();
            this.isLoading = true;

            return ExecGlobal(execFunction, settings.HttpMethod, this.dbSource, this.schema, this.routine, mappedParams, settings, this._alwaysCallbacks)
                .then(r => { this.lastExecutionTime = performance.now() - startTick; this.isLoading = false; this.deferred.resolve(r); return r; });
        }
        */

        public Exec(options?: IExecDefaults & IExecDefaults): Promise<any> {
            // default settings
            let settings: IExecDefaults = {
                AutoSetTokenGuid: true,
                AutoProcessApiResponse: true,
                HandleExceptions: true,
                ShowPageLoadingIndicator: true,
                CommandTimeoutInSeconds: 60
            };

            options = options || {};

            settings = L2.extend(settings, options);

            let startTick = performance.now();
            this.isLoading = true;


            let batch = [];

            for (var ix = 0; ix < this.routineList.length; ix++) {
                batch.push({ Ix: ix, Routine: this.routineList[ix].getExecPacket() });
            }

            var mappedParams: any[] = [];

            settings["batch-data"] = batch;
            mappedParams.push("batch-data");

            return ExecGlobal("batch", "POST"/*settings.HttpMethod*/, null, null, null, mappedParams, settings, this._alwaysCallbacks)
                .then(r => {
                    this.lastExecutionTime = performance.now() - startTick;
                    this.isLoading = false;

                    for (let ix = 0; ix < this.routineList.length; ix++) {
                        var routine = this.routineList[ix];

                        var transformed = transformResults(r.Data[ix]);

                        try {
                            //if (options.AutoProcessApiResponse)
                            processApiResponse(transformed);
                        }
                        catch (ex) { /*ignore exceptions*/ }

                        routine.deferred.resolve(transformed);
                    }

                    return r;
                });

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

        private static _exeDefaults: IExecDefaults = {
            AutoSetTokenGuid: true,
            AutoProcessApiResponse: true,
            HandleExceptions: true,
            ShowPageLoadingIndicator: true,
            CommandTimeoutInSeconds: 60
        };

        public static setExecDefaults(def: IExecDefaults) {
            console.log("CURRENT exec defaults", Sproc._exeDefaults);

            for (var prop in def) {
                this._exeDefaults[prop] = def[prop];
            }

            console.log("NEW exec defaults", Sproc._exeDefaults);
        }


        // TODO: turn this into a GET property
        public deferred: Deferred = null;

        protected dbSource: string;
        protected catalog: string;

        private schema: string = null;
        private routine: string = null;
        private routineParams: string[] = null;
        private constructorOptions: any;

        private selectFieldsCsv: string;
        private captchaVal: string;

        public lastExecutionTime: number;
        public isLoading: boolean = false;

        private _alwaysCallbacks: ((res: any) => any)[];


        // something in angular 2 seems to break the instanceof check...not sure what yet
        public static looksLikeADuck(val: any): boolean {
            if (!val) return false;
            return typeof (val.ExecQuery) === "function" && typeof (val.routine) === "string" && typeof (val.routineParams) === "object";
        }

        public getExecPacket(): { dbSource: string, dbConnection: string, schema: string, routine: string, params: string[], $select: string, $captcha: string } {
            return {
                dbSource: this.dbSource,
                dbConnection: jsDALServer.dbConnection,
                schema: this.schema,
                routine: this.routine,
                params: this.constructorOptions,
                $select: this.selectFieldsCsv,
                $captcha: this.captchaVal
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

        public always(cb: (...any) => any): Sproc {
            if (!this._alwaysCallbacks) this._alwaysCallbacks = [];

            this._alwaysCallbacks.push(cb);

            return this;
        }

        protected ExecRoutine(execFunction: string, options?: IExecDefaults): Promise<any> {

            if (!execFunction || execFunction == "")
                throw new Error(`'execFunction' must be specified. Consider using the methods ExecQuery or ExecNonQuery.`);

            // default settings
            let settings: IExecDefaults = Sproc._exeDefaults;

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
            if (this.captchaVal) settings.$captcha = this.captchaVal;

            let startTick = performance.now();
            this.isLoading = true;

            return ExecGlobal(execFunction, settings.HttpMethod, this.dbSource, this.schema, this.routine, mappedParams, settings, this._alwaysCallbacks)
                .then(r => { this.lastExecutionTime = performance.now() - startTick; this.isLoading = false; this.deferred.resolve(r); return r; });
        }

        public ExecQuery(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "GET" }, options); // default to GET for ExecQuery
            return this.ExecRoutine("exec", options);
        }

        public ExecNonQuery(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "POST" }, options); // default to POST for ExecNonQuery
            return this.ExecRoutine("execnq", options);
        }

        public ExecSingleResult(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "GET" }, options);
            return this.ExecRoutine("exec", options).then(r => {

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

        public captcha(captchaResponseValue: string): Sproc {
            this.captchaVal = captchaResponseValue;
            return this;
        }

    }

    export class UDF extends Sproc {
        public Exec(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "GET" }, options);
            return super.ExecRoutine("execScalar", options).then(r => {
                // return the single result value
                if (r.IsDate) return new Date(r.Data);
                return r.Data;
            });
        }
    }


    export class ServerVariables {
        private static PREFIX_MARKER: string = "$jsDAL$";
        static /*get*/ ClientIP(): string {
            return `${ServerVariables.PREFIX_MARKER}.RemoteClient.IP`;
        }
    }
}

//export default jsDAL;

