declare var JWT: any;
declare var moment: any;

//declare class IteratorResult<T> { }

//interface Thenable<T> {
//    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
//    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
//}

//declare class Promise<T> implements Thenable<T> {
//    constructor(callback: (resolve: (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => void);
//    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
//    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;
//    ifthen(...any): any;
//    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
//}

//declare namespace Promise {
//    function resolve<T>(value?: T | Thenable<T>): Promise<T>;
//    function reject(error: any): Promise<any>;
//    function reject<T>(error: T): Promise<T>;
//    function all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>, T10 | Thenable<T10>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
//    function all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
//    function all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
//    function all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>]): Promise<[T1, T2, T3, T4, T5, T6, T7]>;
//    function all<T1, T2, T3, T4, T5, T6>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>]): Promise<[T1, T2, T3, T4, T5, T6]>;
//    function all<T1, T2, T3, T4, T5>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>]): Promise<[T1, T2, T3, T4, T5]>;
//    function all<T1, T2, T3, T4>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>]): Promise<[T1, T2, T3, T4]>;
//    function all<T1, T2, T3>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]): Promise<[T1, T2, T3]>;
//    function all<T1, T2>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>]): Promise<[T1, T2]>;
//    function all<T>(values: (T | Thenable<T>)[]): Promise<T[]>;

//    function race<T>(promises: (T | Thenable<T>)[]): Promise<T>;
//}


/*
interface ReadableStreamSource {
    start?(controller: ReadableStreamDefaultController): void | Promise<void>;
    pull?(controller: ReadableStreamDefaultController): void | Promise<void>;
    cancel?(reason: string): void | Promise<void>;
}

interface ReadableByteStreamSource {
    start?(controller: ReadableByteStreamController): void | Promise<void>;
    pull?(controller: ReadableByteStreamController): void | Promise<void>;
    cancel?(reason: string): void | Promise<void>;

    type: "bytes";
}

interface QueuingStrategy {
    highWaterMark?: number;
    size?(chunk: ArrayBufferView): number;
}

declare class ReadableStream {
    constructor(underlyingSource?: ReadableStreamSource, strategy?: QueuingStrategy);
    constructor(underlyingSource?: ReadableByteStreamSource, strategy?: QueuingStrategy);

    locked: boolean;

    cancel(reason: string): Promise<void>;
    getReader(): ReadableStreamDefaultReader;
    getReader({ mode }: { mode: "byob" }): ReadableStreamBYOBReader;
    pipeThrough<T extends ReadableStream>({ writable, readable }: { writable: WritableStream, readable: T }): T;
    pipeTo(dest: WritableStream, { preventClose, preventAbort, preventCancel }: { preventClose?: boolean, preventAbort?: boolean, preventCancel?: boolean }): Promise<void>;
    tee(): [ReadableStream, ReadableStream];
}

declare class ReadableStreamDefaultReader {
    constructor(stream: ReadableStream);

    closed: Promise<void>;

    cancel(reason: string): Promise<void>;
    read(): Promise<IteratorResult<ArrayBufferView>>;
    releaseLock(): void;
}

declare class ReadableStreamBYOBReader {
    constructor(stream: ReadableStream);

    closed: Promise<boolean>;

    cancel(reason: string): Promise<void>;
    read(view: ArrayBufferView): Promise<IteratorResult<ArrayBufferView>>;
    releaseLock(): void;
}

declare class ReadableStreamDefaultController {
    constructor(stream: ReadableStream, underlyingSource: ReadableStreamSource, size: number, highWaterMark: number);

    desiredSize: number;

    close(): void;
    enqueue(chunk: ArrayBufferView): number;
    error(e: any): void;
}

declare class ReadableByteStreamController {
    constructor(stream: ReadableStream, underlyingSource: ReadableStreamSource, highWaterMark: number);

    byobRequest: ReadableStreamBYOBRequest;
    desiredSize: number;

    close(): void;
    enqueue(chunk: ArrayBufferView): number;
    error(e: any): void;
}

declare class ReadableStreamBYOBRequest {
    constructor(controller: ReadableByteStreamController, view: ArrayBufferView);

    view: ArrayBufferView;

    respond(bytesWritten: number): void;
    respondWithNewView(view: ArrayBufferView): void;
}

interface WritableStreamSink {
    start?(controller: WritableStreamDefaultController): void | Promise<void>;
    write?(chunk: any): void | Promise<void>;
    close?(): void | Promise<void>;
    abort?(reason: string): void | Promise<void>;
}

declare class WritableStream {
    constructor(underlyingSink?: WritableStreamSink, strategy?: QueuingStrategy);

    locked: boolean;

    abort(reason: string): Promise<void>;
    getWriter(): WritableStreamDefaultWriter;
}

declare class WritableStreamDefaultWriter {
    constructor(stream: WritableStream);

    closed: Promise<void>;
    desiredSize: number;
    ready: Promise<void>;

    abort(reason: string): Promise<void>;
    close(): Promise<void>;
    releaseLock(): void;
    write(chunk: any): Promise<void>;
}

declare class WritableStreamDefaultController {
    constructor(stream: WritableStream, underlyingSink: WritableStreamSink, size: number, highWaterMark: number);

    error(e: any): void;
}

declare class ByteLengthQueuingStrategy {
    constructor({ highWaterMark }: { highWaterMark: number });

    size(chunk: ArrayBufferView): number;
}

declare class CountQueuingStrategy {
    constructor({ highWaterMark }: { highWaterMark: number });

    size(): number; // 1;
}

interface Window {
    fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
}
declare var fetch: typeof window.fetch;

declare type HeadersInit = Headers | string[][] | { [key: string]: string };
declare class Headers {
    constructor(init?: HeadersInit);

    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string; // | null; (TS 2.0 strict null check)
    has(name: string): boolean;
    set(name: string, value: string): void;

    ////// WebIDL pair iterator: iterable<ByteString, ByteString>
    ////entries(): IterableIterator<[string, string]>;
    ////forEach(callback: (value: string, index: number, headers: Headers) => void, thisArg?: any): void;
    ////keys(): IterableIterator<string>;
    ////values(): IterableIterator<string>;
    ////[Symbol.iterator](): IterableIterator<[string, string]>;
}

declare type BodyInit = Blob | ArrayBufferView | ArrayBuffer | FormData  | string;
interface Body {
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json(): Promise<any>;
    text(): Promise<string>;
}

declare type RequestInfo = Request | string;
interface Request extends Body {
    method: string;
    url: string;
    headers: Headers;

    type: RequestType
    destination: RequestDestination;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    mode: RequestMode;
    credentials: RequestCredentials;
    cache: RequestCache;
    redirect: RequestRedirect;
    integrity: string;

    clone(): Request;
}
interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    integrity?: string;
    window?: any;
}
interface RequestConstructor {
    new (input: RequestInfo, init?: RequestInit): Request;
}
declare var Request: RequestConstructor;

type RequestType = "" | "audio" | "font" | "image" | "script" | "style" | "track" | "video";
type RequestDestination = "" | "document" | "embed" | "font" | "image" | "manifest" | "media" | "object" | "report" | "script" | "serviceworker" | "sharedworker" | "style" | "worker" | "xslt";
type RequestMode = "navigate" | "same-origin" | "no-cors" | "cors";
type RequestCredentials = "omit" | "same-origin" | "include";
type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
type RequestRedirect = "follow" | "error" | "manual";
type ReferrerPolicy = "" | "no-referrer" | "no-referrer-when-downgrade" | "same-origin" | "origin" | "strict-origin" | "origin-when-cross-origin" | "strict-origin-when-cross-origin" | "unsafe-url";

interface Response extends Body {
    type: ResponseType;
    url: string;
    redirected: boolean;
    status: number;
    ok: boolean;
    statusText: string;
    headers: Headers;
    body: ReadableStream; // | null;
    trailer: Promise<Headers>;

    clone(): Response;
}
interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
}
interface ResponseConstructor {
    new (body?: BodyInit, init?: ResponseInit): Response;

    error(): Response;
    redirect(url: string, status?: number): Response;
}
declare var Response: ResponseConstructor;

type ResponseType = "basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect";
*/