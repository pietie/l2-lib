export declare class KeyValueStore {
    static open<T>(storeName: string): <T>(keyName: string, value?: T) => Promise<T>;
    private static createDBAndStore(dbName);
    private static getValue<T>(db, keyName);
    private static setValue<T>(db, keyName, value);
}
