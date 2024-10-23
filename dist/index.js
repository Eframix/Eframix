var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as http from 'http';
class Router {
    constructor(routers = []) {
        const flatRoutes = routers.flatMap(router => [...router.routes.entries()]);
        this.routes = new Map(flatRoutes);
    }
    use(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const methodRoutes = this.routes.get(req.method || "");
            if (methodRoutes) {
                for (const endPoint of methodRoutes) {
                    if (this.match(endPoint.url, req)) {
                        yield this.runHandlers(endPoint.handlers, req, res);
                        return;
                    }
                }
            }
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({ title: "Not Found", message: "Route Not Found" }));
            res.end();
        });
    }
    addMiddleware(middleware) {
        for (const route of this.routes) {
            if (route[0] === "GET")
                continue;
            route[1].forEach((endPoint) => {
                endPoint.handlers.unshift(middleware);
            });
        }
    }
    runHandlers(handlers, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let index = 0;
            const next = () => __awaiter(this, void 0, void 0, function* () {
                if (index < handlers.length) {
                    const handler = handlers[index++];
                    yield handler(req, res, next);
                }
            });
            yield next();
        });
    }
    match(url, req) {
        var _a;
        const urlPath = url.split("/");
        const reqUrlPath = ((_a = req.url) === null || _a === void 0 ? void 0 : _a.split("/")) || [];
        if (urlPath.length !== reqUrlPath.length)
            return false;
        for (let i = 0; i < urlPath.length; i++) {
            if (urlPath[i][0] === ':') {
                req.params[urlPath[i].slice(1)] = reqUrlPath[i];
                continue;
            }
            if (urlPath[i] !== reqUrlPath[i])
                return false;
        }
        return true;
    }
    set(method, url, handlers) {
        if (!this.routes.has(method)) {
            this.routes.set(method, []);
        }
        this.routes.get(method).push({ url, handlers });
    }
    get(url, ...handlers) {
        this.set("GET", url, handlers);
    }
    post(url, ...handlers) {
        this.set("POST", url, handlers);
    }
    put(url, ...handlers) {
        this.set("PUT", url, handlers);
    }
    delete(url, ...handlers) {
        this.set("DELETE", url, handlers);
    }
    startServer(port) {
        const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            req.params = {};
            yield this.use(req, res);
        }));
        server.listen(port, () => {
            console.log(`Server started on port: ${port}`);
        });
    }
}
export default Router;
