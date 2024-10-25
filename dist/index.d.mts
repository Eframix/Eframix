import { IncomingMessage, ServerResponse } from 'http';
export { IncomingMessage } from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
interface Endpoint {
    url: string;
    handlers: Array<Handler>;
}
declare module 'http' {
    interface IncomingMessage {
        params: {
            [key: string]: string;
        };
        body: {
            [key: string]: any;
        };
    }
}
declare class Router {
    private routes;
    constructor(routers?: Router[]);
    use(req: IncomingMessage, res: ServerResponse): Promise<void>;
    addMiddleware(middleware: Handler): void;
    private runHandlers;
    private match;
    private set;
    get(url: string, ...handlers: Array<Handler>): void;
    post(url: string, ...handlers: Array<Handler>): void;
    put(url: string, ...handlers: Array<Handler>): void;
    delete(url: string, ...handlers: Array<Handler>): void;
    startServer(port: number): void;
}

export { type Endpoint, type Handler, Router as default };
