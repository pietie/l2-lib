export declare class toastr {
    static info(msg: any, title: any): void;
    static success(msg: any, title: any): void;
    static warning(msg: any, title: any): void;
    static error(msg: any): void;
}
export interface IL2OutputMessageHandler {
    info(msg: string, title?: string): any;
    success(msg: string, title?: string): any;
    warning(msg: string, title?: string): any;
    exclamation(msg: string, title?: string): any;
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
export default class L2 {
    private static _customOutputMsgHandler;
    static readonly BrowserStore: BrowserStore;
    static registerOutputMessageHandler(handler: IL2OutputMessageHandler): void;
    static info(msg: string, title?: string): void;
    static success(msg: string, title?: string): void;
    static exclamation(msg: string, title?: string): void;
    static handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object): void;
    static extend(...any: any[]): {};
    static clientIP(): Promise<string>;
}
