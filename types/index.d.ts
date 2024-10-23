import { IncomingMessage, ServerResponse } from "http";

declare module 'http' {
    interface IncomingMessage {
        params: { [key: string]: string };
        body: { [key: string]: any };
    }
}

export type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

export class Router {
    constructor(routers?: Router[]);
    public use(req: IncomingMessage, res: ServerResponse): Promise<void>;
    public addMiddleware(middleware: Handler): void;
    public get(url: string, ...handlers: Handler[]): void;
    public post(url: string, ...handlers: Handler[]): void;
    public put(url: string, ...handlers: Handler[]): void;
    public delete(url: string, ...handlers: Handler[]): void;
    public startServer(port: number): void;
}