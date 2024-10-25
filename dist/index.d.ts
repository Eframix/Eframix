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
interface Route {
    method: string;
    url: string;
    handler: Router | Array<Handler>;
}
declare class Router {
    private routes;
    private server;
    constructor();
    startServer(port: number, cp?: () => void): void;
    /**
     *
     * @param url: string
     * @param handler: Handler | Router
     */
    use(url: string, handler: Handler): void;
    use(handler: Handler): void;
    use(router: Router): void;
    use(url: string, router: Router): void;
    private set;
    get(url: string, ...handlers: Array<Handler>): void;
    post(url: string, ...handlers: Array<Handler>): void;
    put(url: string, ...handlers: Array<Handler>): void;
    delete(url: string, ...handlers: Array<Handler>): void;
    private runHandlers;
    private matchPrefix;
    private handleRequest;
}

export { type Endpoint, type Handler, type Route, Router as default };
