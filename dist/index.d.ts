import { IncomingMessage, ServerResponse } from "http";
type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
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
export default Router;
