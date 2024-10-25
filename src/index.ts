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
        body: any;
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
    private globalMiddlewares: Handler[];

    constructor() {
        this.routes = [];
        this.globalMiddlewares = [];
        this.server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
            req.params = {};
            await this.handleRequest(req, res);
        });
    }

    public bodyParser: Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            if (body) {
                try {
                    req.body = JSON.parse(body);
                    console.log("Parsed Body:", req.body);
                } catch (error) {
                    console.warn("Invalid JSON, proceeding with empty body");
                    req.body = {};
                }
            } else {
                req.body = {};
            }
            next();
        });

        req.on('error', () => {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ title: "Bad Request", message: "Error processing body" }));
        });
    };

    startServer(port: number, cp?: () => void) {
        this.server.listen(port, cp);
    }

    use(handler: Handler): void;
    use(url: string, handler: Handler): void;
    use(router: Router): void;
    use(url: string, router: Router): void;
    use(arg1: string | Handler | Router, arg2?: Handler | Router): void {
        if (typeof arg1 === 'string' && arg2) {
            if (arg2 instanceof Router) {
                this.set(MATCH_ALL_METHOD, arg1, arg2);
            } else {
                this.globalMiddlewares.push(arg2);
                this.set(MATCH_ALL_METHOD, arg1, [arg2]);
            }
        } else if (arg1 instanceof Router) {
            this.set(MATCH_ALL_METHOD, ROOT, arg1);
        } else if (typeof arg1 === 'function') {
            this.globalMiddlewares.push(arg1);
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
                if (res.writableEnded) return;
                const handler = handlers[index++];
                try {
                    await handler(req, res, next);
                } catch (error) {
                    console.error("Error in handler:", error);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            } else {
               
                if (!res.writableEnded) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        };
        await next();
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse) {
        const methodHandlers: Array<Handler> = [];

        for (const route of this.routes) {
            if (RegExp(route.method).test(req.method ?? "GET")) {
                if (this.matchUrl(route.url, req)) {
                    if (!(route.handler instanceof Router)) {
                        methodHandlers.push(...this.globalMiddlewares, ...route.handler as Array<Handler>);
                    } else {
                        req.url = req.url?.slice(route.url.length) || ROOT;
                        await route.handler.handleRequest(req, res);
                    }
                }
            }
        }

        if (methodHandlers.length > 0) {
            await this.runHandlers(methodHandlers, req, res);
        } else {
            if (!res.writableEnded) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
    }

    private matchUrl(url: string, req: IncomingMessage): boolean {
        const urlPath = url.split("/");
        const reqUrlPath = req.url?.split("/") || [];

        if (urlPath.length !== reqUrlPath.length) return false;

        for (let i = 0; i < urlPath.length; i++) {
            if (urlPath[i][0] === ':') {
                req.params[urlPath[i].slice(1)] = reqUrlPath[i];
                continue;
            }
            if (urlPath[i] !== reqUrlPath[i]) return false;
        }
        return true;
    }
}

export default Router;
export { Handler, IncomingMessage }
