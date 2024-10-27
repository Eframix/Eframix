"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  IncomingMessage: () => import_http.IncomingMessage,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_http = require("http");
var http = __toESM(require("http"));
var MATCH_ALL_METHOD = ".*";
var ROOT = "/";
var Router = class _Router {
  constructor() {
    this.bodyParser = (req, res, next) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
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
      req.on("error", () => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ title: "Bad Request", message: "Error processing body" }));
      });
    };
    this.routes = [];
    this.globalMiddlewares = [];
    this.server = http.createServer((req, res) => __async(this, null, function* () {
      req.params = {};
      yield this.handleRequest(req, res);
    }));
  }
  startServer(port, cp) {
    this.server.listen(port, cp);
  }
  use(arg1, arg2) {
    if (typeof arg1 === "string" && arg2) {
      if (arg2 instanceof _Router) {
        this.set(MATCH_ALL_METHOD, arg1, arg2);
      } else {
        this.globalMiddlewares.push(arg2);
        this.set(MATCH_ALL_METHOD, arg1, [arg2]);
      }
    } else if (arg1 instanceof _Router) {
      this.set(MATCH_ALL_METHOD, ROOT, arg1);
    } else if (typeof arg1 === "function") {
      this.globalMiddlewares.push(arg1);
      this.set(MATCH_ALL_METHOD, ROOT, [arg1]);
    }
  }
  set(method, url, handlers) {
    if (url.at(-1) === ROOT) url = url.slice(0, -1);
    this.routes.push({ method, url, handler: handlers });
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
  patch(url, ...handlers) {
    this.set("PATCH", url, handlers);
  }
  runHandlers(handlers, req, res) {
    return __async(this, null, function* () {
      let index = 0;
      const next = () => __async(this, null, function* () {
        if (index < handlers.length) {
          if (res.writableEnded) return;
          const handler = handlers[index++];
          try {
            yield handler(req, res, next);
          } catch (error) {
            console.error("Error in handler:", error);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          }
        } else {
          if (!res.writableEnded) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
          }
        }
      });
      yield next();
    });
  }
  handleRequest(req, res) {
    return __async(this, null, function* () {
      var _a, _b;
      const methodHandlers = [];
      for (const route of this.routes) {
        if (RegExp(route.method).test((_a = req.method) != null ? _a : "GET")) {
          if (this.matchUrl(route.url, req)) {
            if (!(route.handler instanceof _Router)) {
              methodHandlers.push(...this.globalMiddlewares, ...route.handler);
            } else {
              req.url = ((_b = req.url) == null ? void 0 : _b.slice(route.url.length)) || ROOT;
              yield route.handler.handleRequest(req, res);
            }
          }
        }
      }
      if (methodHandlers.length > 0) {
        yield this.runHandlers(methodHandlers, req, res);
      } else {
        if (!res.writableEnded) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        }
      }
    });
  }
  matchUrl(url, req) {
    var _a;
    const urlPath = url.split("/");
    const reqUrlPath = ((_a = req.url) == null ? void 0 : _a.split("/")) || [];
    if (urlPath.length !== reqUrlPath.length) return false;
    for (let i = 0; i < urlPath.length; i++) {
      if (urlPath[i][0] === ":") {
        req.params[urlPath[i].slice(1)] = reqUrlPath[i];
        continue;
      }
      if (urlPath[i] !== reqUrlPath[i]) return false;
    }
    return true;
  }
};
var src_default = Router;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IncomingMessage
});
//# sourceMappingURL=index.js.map