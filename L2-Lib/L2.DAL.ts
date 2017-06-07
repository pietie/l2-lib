import L2 from "./L2"

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
        public static overridingDbSource: string;
        public static jwt: JWT;

        static configure(options: IDALServerOptions) {

            if (options.dbConnection == "") options.dbConnection = null;

            Server.serverUrl = options.serverUrl;
            Server.dbConnection = options.dbConnection;
            Server.jwt = options.jwt;
            Server.overridingDbSource = options.overridingDbSource;
        }
    }

    export interface IDALServerOptions {
        serverUrl?: string;
        dbConnection?: string;
        overridingDbSource?: string;
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


    (<any>Promise).prototype.ifthen = function (cond, cb) {
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
        $captcha?: string;
        HttpMethod?: string;
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
                    parmValue = parmValue.toDate().toISOString();
                }
                else if (parmValue instanceof Date) {
                    parmValue = parmValue.toISOString();
                }

                if (parmValue != null) return encodeURIComponent(p) + "=" + encodeURIComponent(parmValue)
                else return encodeURIComponent(p) + "=";
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

            if (Server.overridingDbSource) dbSource = Server.overridingDbSource;

            if (["exec", "execnq", "execScalar"].indexOf(execFunction) == -1) {
                throw new Error(`Invalid execution method specified: ${execFunction}`);
            }

            // GET
            if (httpMethod == "GET") {
                let headers = null;

                if (customHeaders && customHeaders.length > 0) {
                    if (headers == null) headers = {};
                    for (let e in customHeaders) {
                        headers[e] = customHeaders[e];
                    }
                }

                fetchWrap(`${Server.serverUrl}/api/${execFunction}/${dbSource}/${Server.dbConnection}/${schema}/${routine}${parmQueryString}`
                    , {
                        headers: headers
                    }, alwaysCBs)
                    .then(checkHttpStatus)
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r)); return r; })
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

                fetchWrap(`${Server.serverUrl}/api/${execFunction}/${dbSource}/${Server.dbConnection}/${schema}/${routine}`
                    , {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(bodyContent)
                    }, alwaysCBs)
                    .then(checkHttpStatus)
                    .then(parseJSON)
                    .then(transformResults)
                    .ifthen(options.AutoProcessApiResponse, processApiResponse)
                    .then(r => resolve(r))
                ["catch"](r => { reject(fetchCatch(r)); })
                ["catch"](function (e) {
                    if (e instanceof ApiResponseEndThenChain) return;
                    else throw e;
                })
                    ;
            }
            //else if (httpMethod == "SCALAR") {
            //    fetchWrap(`${Server.serverUrl}/api/${execFunction}/${dbSource}/${Server.dbConnection}/${schema}/${routine}${parmQueryString}`, {
            //        credentials: 'same-origin'
            //    }, alwaysCBs)
            //        .then(checkHttpStatus)
            //        .then(parseJSON)
            //        .ifthen(options.AutoProcessApiResponse, processApiResponse)
            //        .then(r => resolve(r))
            //    ["catch"](r => { reject(fetchCatch(r)); })
            //    ["catch"](function (e) {
            //        if (e instanceof ApiResponseEndThenChain) return;
            //        else throw e;
            //    })
            //        ;
            //}
            else throw "Invalid HTTP method: " + httpMethod;

        });
    }

    function fetchWrap(url: string | Request
        , init?: RequestInit | any
        , alwaysCBs?: ((res: any) => any)[]): any | Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            if (jsDAL.Server.jwt != null) {

                if (!init) init = {};
                if (!init.headers) init.headers = {};

                init.headers["Authorization"] = `Bearer ${jsDAL.Server.jwt.access_token}`;
            }

            fetch(url, init).then((r: any) => {
                r.fetch = { url: url, init: init };
                resolve(r);
                return r;
            })["catch"](err => {
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

        private static _exeDefaults: IExecDefaults = {
            AutoSetTokenGuid: true,
            AutoProcessApiResponse: true,
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
                dbConnection: Server.dbConnection,
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

        protected Exec(execFunction: string, options?: IExecDefaults): Promise<any> {

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
            return this.Exec("exec", options);
        }

        public ExecNonQuery(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "POST" }, options); // default to POST for ExecNonQuery
            return this.Exec("execnq", options);
        }

        public ExecSingleResult(options?: IExecDefaults): Promise<any> {
            options = L2.extend({ HttpMethod: "GET" }, options);
            return this.Exec("execScalar", options).then(r => {

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
            return super.Exec("SCALAR", options).then(r => {
                // return the single result value
                if (r.IsDate) return new Date(r.Data);
                return r.Data;
            });
        }
    }


    export class ServerVariables {
        private static PREFIX_MARKER: string = "$jsDAL$";
        static get ClientIP(): string {
            return `${ServerVariables.PREFIX_MARKER}.RemoteClient.IP`;
        }
    }
}



export default jsDAL;