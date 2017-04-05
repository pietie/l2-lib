export class KeyValueStore {

    // todo: Have IndexDB backend with fallback to Browser local storage!
    public static open(storeName: string): KeyValueStoreKV {

        return null;

    }




}

export class KeyValueStoreKV {

    public key<T>(keyName: string, value?: T): T {
        return null;
    }

}
/*
KeyValueStore.open("MyStore").key("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName");
KeyValueStore.open("MyStore").key<Date>("KeyName", new Date());

*/