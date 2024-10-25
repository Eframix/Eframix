import { IncomingMessage, ServerResponse } from "http";
import * as http from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

export interface Endpoint {
    url: string;
    handlers: Array<Handler>;
}

declare module 'http' {
    interface IncomingMessage {
        params: { [key: string]: string };
        body: { [key: string]: any };
    }
}

export interface Route {
    method: string;
    url: string;
    handler: Router | Array<Handler>;
}

const MATCH_ALL_METHOD = ".*";
const ROOT = '/';

class Router {
    private routes: Route[];
    private server: http.Server;

    constructor() {
        this.routes = [];
        this.server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
            req.params = {};
            this.handleRequest(req, res);
        });
    }

    startServer(port: number, cp?: () => void) {
        this.server.listen(port, cp);
    }

    /**
     * 
     * @param url: string
     * @param handler: Handler | Router
     */
    use(url: string, handler: Handler): void;
    use(handler: Handler): void;
    use(router: Router): void;
    use(url: string, router: Router): void;
    use(arg1: string | Handler | Router, arg2?: Handler | Router): void {
        if (typeof arg1 === 'string' && arg2) {
            if (arg2 instanceof Router) {
                this.set(MATCH_ALL_METHOD, arg1, arg2);
            }
            else {
                this.set(MATCH_ALL_METHOD, arg1, [arg2]);
            }
        } else if (arg1 instanceof Router) {
            this.set(MATCH_ALL_METHOD, ROOT, arg1);
        } else if (typeof arg1 === 'function') {
            this.set(MATCH_ALL_METHOD, ROOT, [arg1]);
        }
    }

    private set(method: string, url: string, handlers: Router | Array<Handler>): void {
        if (url.at(-1) === ROOT) url = url.slice(0, -1);
        this.routes.push({ method, url, handler: handlers });
    }

    get(url: string, ...handlers: Array<Handler>): void {
        this.set("GET", url, handlers);
    }

    post(url: string, ...handlers: Array<Handler>): void {
        this.set("POST", url, handlers);
    }

    put(url: string, ...handlers: Array<Handler>): void {
        this.set("PUT", url, handlers);
    }

    delete(url: string, ...handlers: Array<Handler>): void {
        this.set("DELETE", url, handlers);
    }

    private async runHandlers(handlers: Array<Handler>, req: IncomingMessage, res: ServerResponse) {
        let index = 0;
        const next = async () => {
            if (index < handlers.length) {
                const handler = handlers[index++];
                await handler(req, res, next);
            }
        };
        await next();
    }

    private matchPrefix(routeUrl: string, req: IncomingMessage): boolean {
        const routeUrlPath = routeUrl.split("/");
        const reqUrlPath = req.url?.split("/") || [];

        if (routeUrlPath.length > reqUrlPath.length) return false;

        for (let i = 0; i < routeUrlPath.length; i++) {
            if (routeUrlPath[i][0] === ':') {
                req.params[routeUrlPath[i].slice(1)] = reqUrlPath[i];
                continue;
            }
            if (routeUrlPath[i] !== reqUrlPath[i]) return false;
        }
        return true;
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse) {
        this.routes.forEach(async (route) => {
            if (RegExp(route.method).test(req.method ?? "GET") && this.matchPrefix(route.url, req)) {
                if (route.handler instanceof Router) {
                    req.url = req.url?.slice(route.url.length) || ROOT;
                    await route.handler.handleRequest(req, res);
                }
                else {
                    await this.runHandlers(route.handler, req, res);
                }
            }
        });
    }
}

export default Router;
export {Handler, IncomingMessage}