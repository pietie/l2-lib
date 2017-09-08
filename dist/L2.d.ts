export interface PromiseL2<R> {
    ifthen(...any: any[]): Promise<R>;
}
export declare class ApiResponseEndThenChain {
    handled?: boolean;
}
export interface IL2OutputMessageHandler {
    info(msg: string, title?: string): any;
    success(msg: string, title?: string): any;
    warning(msg: string, title?: string): any;
    exclamation(msg: string, title?: string): any;
    confirm(msg: string, title?: string): Promise<boolean>;
    prompt(title?: string, fieldName?: string, val?: string, okayButtonLabel?: string): Promise<boolean>;
    handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object): any;
}
export declare class BrowserStore {
    constructor();
    static local<T>(key: string, value?: T): T;
    static session<T>(key: string, value?: T): T;
    static removeSessionItem: (key: any) => void;
    static removeLocalItem: (key: any) => void;
    private static processRequest<T>(store, key, value, storeName);
}
export declare class L2 {
    private static _customOutputMsgHandler;
    static BrowserStore: {
        local<T>(key: string, value?: T): T;
        session<T>(key: string, value?: T): T;
        removeSessionItem: (key: any) => void;
        removeLocalItem: (key: any) => void;
    };
    static registerOutputMessageHandler(handler: IL2OutputMessageHandler): void;
    static info(msg: string, title?: string): void;
    static success(msg: string, title?: string): void;
    static exclamation(msg: string, title?: string): void;
    static confirm(msg: string, title?: string): Promise<boolean>;
    static prompt(title?: string, fieldName?: string, val?: string, okayButtonLabel?: string): Promise<any>;
    static handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object): void;
    static nullToEmpty(val: string): string;
    static extend(...any: any[]): {};
    static clientIP(): Promise<string>;
    private static processApiResponse(json);
    static fetchJson(url: string | Request, init?: RequestInit): Promise<Response>;
    static postJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response>;
    static putJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response>;
    static deleteJson(url: string | Request, init?: RequestInit): Promise<Response> & PromiseL2<Response>;
    private static fetchWrap(url, init?);
    private static fetchCatch(ex);
    private static checkHttpStatus(response);
    private static parseJSON(response);
}
export interface JWT {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
}
export declare class jsDALServer {
    static serverUrl: string;
    static dbConnection: string;
    static overridingDbSource: string;
    static jwt: JWT;
    static configure(options: IDALServerOptions): void;
}
export interface IDALServerOptions {
    serverUrl?: string;
    dbConnection?: string;
    overridingDbSource?: string;
    jwt?: JWT;
}
