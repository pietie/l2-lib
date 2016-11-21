export interface JWT {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
}
export declare module jsDAL {
    class Server {
        static serverUrl: string;
        static dbConnection: string;
        static jwt: JWT;
        static configure(options: IDALServerOptions): void;
    }
    interface IDALServerOptions {
        serverUrl?: string;
        dbConnection?: string;
        jwt?: JWT;
    }
    interface IExecDefaults {
        AutoSetTokenGuid?: boolean;
        AutoProcessApiResponse?: boolean;
        ShowPageLoadingIndicator?: boolean;
        CommandTimeoutInSeconds?: number;
        $select?: string;
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
        deferred: Deferred;
        protected dbSource: string;
        protected catalog: string;
        private schema;
        private routine;
        private routineParams;
        private constructorOptions;
        private selectFieldsCsv;
        lastExecutionTime: number;
        isLoading: boolean;
        static looksLikeADuck(val: any): boolean;
        getExecPacket(): {
            dbSource: string;
            dbConnection: string;
            schema: string;
            routine: string;
            params: string[];
            $select: string;
        };
        constructor(schema: string, routine: string, params?: string[], options?: IExecDefaults);
        then(...args: any[]): any;
        protected Exec(method: string, options?: IExecDefaults): Promise<any>;
        ExecQuery(options?: IExecDefaults): Promise<any>;
        ExecNonQuery(options?: IExecDefaults): Promise<any>;
        ExecSingleResult(options?: IExecDefaults): Promise<any>;
        Select(...fieldNames: string[][]): Sproc;
    }
    class UDF extends Sproc {
        Exec(options?: IExecDefaults): Promise<any>;
    }
}
