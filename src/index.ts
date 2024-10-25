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

class Router {
    private routes: Map<string, Endpoint[]>;

    constructor(routers: Router[] = []) {
        const flatRoutes = routers.flatMap(router => [...router.routes.entries()]);
        this.routes = new Map(flatRoutes);
    }

    public async use(req: IncomingMessage, res: ServerResponse) {
        const methodRoutes = this.routes.get(req.method || "");
        if (methodRoutes) {
            for (const endPoint of methodRoutes) {
                if (this.match(endPoint.url, req)) {
                    await this.runHandlers(endPoint.handlers, req, res);
                    return;
                }
            }
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ title: "Not Found", message: "Route Not Found" }));
        res.end();
    }

    public addMiddleware(middleware: Handler) {
        for (const route of this.routes) {
            route[1].forEach((endPoint) => {
                endPoint.handlers.unshift(middleware);
            });
        }
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

    private match(url: string, req: IncomingMessage): boolean {
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

    private set(method: string, url: string, handlers: Array<Handler>): void {
        if (!this.routes.has(method)) {
            this.routes.set(method, []);
        }
        this.routes.get(method)!.push({ url, handlers });
    }

    public get(url: string, ...handlers: Array<Handler>): void {
        this.set("GET", url, handlers);
    }

    public post(url: string, ...handlers: Array<Handler>): void {
        this.set("POST", url, handlers);
    }

    public put(url: string, ...handlers: Array<Handler>): void {
        this.set("PUT", url, handlers);
    }

    public delete(url: string, ...handlers: Array<Handler>): void {
        this.set("DELETE", url, handlers);
    }

    public startServer(port: number) {
        const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
            req.params = {};

            await this.use(req, res);
        });

        server.listen(port, () => {
            console.log(`Server started on port: ${port}`);
        });
    }
}

export default Router;
export {Handler, IncomingMessage}