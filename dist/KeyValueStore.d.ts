export declare class KeyValueStore {
    static open(storeName: string): KeyValueStoreKV;
}
export declare class KeyValueStoreKV {
    key<T>(keyName: string, value?: T): T;
}
