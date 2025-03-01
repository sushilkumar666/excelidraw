"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authSchema_1 = require("../schema/authSchema");
const prismaClient_1 = require("../prismaClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = authSchema_1.createSignupSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw new Error('invalid signup data');
        }
        const existingUser = yield prismaClient_1.prisma.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        });
        if (existingUser) {
            throw new Error('user already exists');
        }
        let password = parsedData.data.password;
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        parsedData.data.password = hashedPassword;
        const user = yield prismaClient_1.prisma.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: parsedData.data.password
            }
        });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = authSchema_1.createSigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw new Error('Invalid signin data');
        }
        const user = yield prismaClient_1.prisma.user.findUnique({ where: { email: parsedData.data.email } });
        if (!user) {
            throw new Error("user not found");
        }
        const password = parsedData.data.password;
        const verifyPassword = bcryptjs_1.default.compare(password, user.password);
        if (!verifyPassword) {
            throw new Error("Invalid password");
        }
        const token = yield jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const authOptions = {
            httpOnly: true
        };
        res.cookie("token", token, authOptions).json({
            success: true,
            data: user,
            token: token
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}));
exports.default = router;
