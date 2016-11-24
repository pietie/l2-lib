export declare class toastr {
    static info(msg: any, title: any): void;
    static success(msg: any, title: any): void;
    static warning(msg: any, title: any): void;
    static error(msg: any): void;
}
declare module L2 {
    function fetchJson(): void;
    function info(msg: string, title?: string): void;
    function success(msg: string, title?: string): void;
    function exclamation(msg: string, title?: string): void;
    function handleException(error: Error | ExceptionInformation | string, additionalKVs?: Object): void;
    function extend(...any: any[]): {};
    class BrowserStore {
        constructor();
        static local<T>(key: string, value?: T): T;
        static session<T>(key: string, value?: T): T;
        static removeSessionItem: (key: any) => void;
        static removeLocalItem: (key: any) => void;
        private static processRequest<T>(store, key, value, storeName);
    }
}
export default L2;
