"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const httpServer = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/', (req, res) => {
        res.json({
            success: true,
            message: 'test successfull'
        });
    });
    exports.server = app.listen(3000, () => console.log('http server is running on port 3000'));
};
exports.httpServer = httpServer;
