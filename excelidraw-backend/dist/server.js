"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocketServer_1 = require("./websocketServer");
const httpServer_1 = require("./httpServer");
(0, httpServer_1.httpServer)();
(0, websocketServer_1.webSocketServer)();
