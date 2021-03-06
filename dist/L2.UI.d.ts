declare namespace DataTables {
    interface Settings {
        columns?: any;
    }
}
interface JQuery {
}
declare module DAL {
    interface Sproc {
    }
    interface UDF {
    }
}
export { DataTables, JQuery, DAL };
export declare class UI {
    private static IsNullOrEmpty(val);
    static A: (options?: AnchorOptions) => any;
    static NewGrid: (options?: NewGridOptions & DataTables.Settings) => void;
    static NewCbo(options?: NewCboOptions): any;
}
export interface NewCboOptions {
    id?: string;
    name?: string;
    chosen?: boolean;
    target?: string | HTMLElement | JQuery;
    sproc?: DAL.Sproc | DAL.UDF;
    data?: any;
    txt?: string;
    val?: string;
    attr?: any[];
    defaultItemText?: string;
    defaultItemValue?: any;
    selectedValue?: any;
    autoDestroy?: boolean;
    multiSelect?: boolean;
}
export interface NewGridOptions {
    target?: string | HTMLElement | JQuery | any;
    sproc?: DAL.Sproc | DAL.UDF;
    data?: any;
    retrieve?: boolean;
    paging?: boolean;
    searching?: boolean;
    info?: boolean;
    autoGenerateColumns?: boolean;
    autoDestroy?: boolean;
    callBack?: () => void;
}
export interface AnchorOptions {
    text?: string;
    href?: string | Object;
    visible?: boolean;
    cssClass?: string;
    target?: string | HTMLElement | JQuery;
}
