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
    this.routes = [];
    this.server = http.createServer((req, res) => __async(this, null, function* () {
      req.params = {};
      this.handleRequest(req, res);
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
        this.set(MATCH_ALL_METHOD, arg1, [arg2]);
      }
    } else if (arg1 instanceof _Router) {
      this.set(MATCH_ALL_METHOD, ROOT, arg1);
    } else if (typeof arg1 === "function") {
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
  runHandlers(handlers, req, res) {
    return __async(this, null, function* () {
      let index = 0;
      const next = () => __async(this, null, function* () {
        if (index < handlers.length) {
          const handler = handlers[index++];
          yield handler(req, res, next);
        }
      });
      yield next();
    });
  }
  matchPrefix(routeUrl, req) {
    var _a;
    const routeUrlPath = routeUrl.split("/");
    const reqUrlPath = ((_a = req.url) == null ? void 0 : _a.split("/")) || [];
    if (routeUrlPath.length > reqUrlPath.length) return false;
    for (let i = 0; i < routeUrlPath.length; i++) {
      if (routeUrlPath[i][0] === ":") {
        req.params[routeUrlPath[i].slice(1)] = reqUrlPath[i];
        continue;
      }
      if (routeUrlPath[i] !== reqUrlPath[i]) return false;
    }
    return true;
  }
  handleRequest(req, res) {
    return __async(this, null, function* () {
      this.routes.forEach((route) => __async(this, null, function* () {
        var _a, _b;
        if (RegExp(route.method).test((_a = req.method) != null ? _a : "GET") && this.matchPrefix(route.url, req)) {
          if (route.handler instanceof _Router) {
            req.url = ((_b = req.url) == null ? void 0 : _b.slice(route.url.length)) || ROOT;
            yield route.handler.handleRequest(req, res);
          } else {
            yield this.runHandlers(route.handler, req, res);
          }
        }
      }));
    });
  }
};
var src_default = Router;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IncomingMessage
});
//# sourceMappingURL=index.js.map