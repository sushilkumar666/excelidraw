"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../auth"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const room_1 = __importDefault(require("../room"));
const chat_1 = __importDefault(require("../chat"));
const cors_1 = __importDefault(require("cors"));
exports.app = (0, express_1.default)();
const httpServer = () => {
    exports.app.use((0, cookie_parser_1.default)());
    exports.app.use(express_1.default.json());
    exports.app.use((0, cors_1.default)({
        origin: "http://localhost:5173", // Allow requests from this origin
        credentials: true, // Allow cookies & authentication headers
    }));
    exports.app.use('/api', auth_1.default);
    exports.app.use('/api', room_1.default);
    exports.app.use('/api', chat_1.default);
    exports.app.post("/login", (req, res) => {
        res.cookie("token", "sample_token", {
            httpOnly: true,
            secure: false, // `true` in production with HTTPS
            sameSite: "strict",
            path: "/"
        });
        res.json({ message: "Cookie set!" });
    });
    // Checking cookies middleware
    exports.app.get("/check-cookies", (req, res) => {
        var _a;
        console.log("Cookies:", req.cookies);
        res.json({ cookies: (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token });
    });
    exports.server = exports.app.listen(3000, () => console.log('http server is running on port 3000'));
};
exports.httpServer = httpServer;
