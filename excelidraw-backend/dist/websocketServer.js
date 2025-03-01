"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
exports.webSocketServer = webSocketServer;
const ws_1 = require("ws");
const httpServer_1 = require("./httpServer");
function webSocketServer() {
    if (!httpServer_1.server) {
        throw new Error('HTTP server is not initialized before WebSocket!');
    }
    exports.wss = new ws_1.WebSocketServer({ server: httpServer_1.server });
    exports.wss.on('connection', (ws) => {
        console.log('connected to websocket server');
        ws.on('message', (message) => {
            console.log('message ' + message);
        });
        ws.on('close', () => {
            console.log('websocket connection closed');
        });
    });
}
