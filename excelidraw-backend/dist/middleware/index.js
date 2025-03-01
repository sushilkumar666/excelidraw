"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware = (req, res, next) => {
    var _a, _b;
    console.log("inside meddileware");
    console.log("step 1");
    console.log(JSON.stringify(req.cookies) + " this is req cookies");
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req.header("cookie")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        console.log(token);
        if (!token) {
            throw new Error("Invalid token");
        }
        console.log("step 2");
        console.log(process.env.JWT_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            throw new Error("unauthorized access");
        }
        console.log("step 3");
        req.userId = decoded.userId;
        console.log("step 4");
        console.log(token + ' token inside middleware');
        next();
    }
    catch (error) {
        res.json({
            success: false,
            message: error
        });
    }
};
exports.default = middleware;
