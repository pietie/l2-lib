export declare module jsDAL {
    interface IExecDefaults {
        AutoSetTokenGuid?: boolean;
        AutoProcessApiResponse?: boolean;
        HandleExceptions?: boolean;
        ShowPageLoadingIndicator?: boolean;
        CommandTimeoutInSeconds?: number;
        $select?: string;
        $captcha?: string;
        HttpMethod?: string;
    }
    function transformResults(r: any): any;
    class Batch {
        private routineList;
        constructor(...routines: Sproc[]);
        ExecQuery(options?: IExecDefaults & IExecDefaults): Promise<any>;
        ExecNonQuery(options?: any): Promise<any>;
    }
    class Deferred {
        promise: Promise<any>;
        resolve: (value?: any | PromiseLike<any>) => void;
        reject: (error?: any) => void;
        constructor();
    }
    class Sproc {
        private static _exeDefaults;
        static setExecDefaults(def: IExecDefaults): void;
        deferred: Deferred;
        protected dbSource: string;
        protected catalog: string;
        private schema;
        private routine;
        private routineParams;
        private constructorOptions;
        private selectFieldsCsv;
        private captchaVal;
        lastExecutionTime: number;
        isLoading: boolean;
        private _alwaysCallbacks;
        static looksLikeADuck(val: any): boolean;
        getExecPacket(): {
            dbSource: string;
            dbConnection: string;
            schema: string;
            routine: string;
            params: string[];
            $select: string;
            $captcha: string;
        };
        constructor(schema: string, routine: string, params?: string[], options?: IExecDefaults);
        then(...args: any[]): any;
        always(cb: (...any) => any): Sproc;
        protected ExecRoutine(execFunction: string, options?: IExecDefaults): Promise<any>;
        ExecQuery(options?: IExecDefaults): Promise<any>;
        ExecNonQuery(options?: IExecDefaults): Promise<any>;
        ExecSingleResult(options?: IExecDefaults): Promise<any>;
        Select(...fieldNames: string[][]): Sproc;
        captcha(captchaResponseValue: string): Sproc;
    }
    class UDF extends Sproc {
        Exec(options?: IExecDefaults): Promise<any>;
    }
    class ServerVariables {
        private static PREFIX_MARKER;
        static ClientIP(): string;
    }
}
