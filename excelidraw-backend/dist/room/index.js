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
const prismaClient_1 = require("../prismaClient");
const middleware_1 = __importDefault(require("../middleware"));
const slugify_1 = __importDefault(require("slugify"));
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
router.post('/roomexists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { slug } = req.body;
        slug = (0, slugify_1.default)(slug, { lower: true });
        const roomId = yield (0, utils_1.slugToRoomId)(slug);
        if (roomId) {
            res.json({ success: true, data: slug });
        }
        else {
            res.json({ success: false, data: "room doesn't exists" });
        }
    }
    catch (error) {
        res.json({ success: false, data: "room doesn't exist" });
    }
}));
router.get(`room/:slug`, middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("create room and join room endpint is hit");
    try {
        let slug = req.params.slug;
        slug = (0, slugify_1.default)(slug, { lower: true });
        const id = Number(req.userId);
        const roomId = yield (0, utils_1.slugToRoomId)(slug);
        if (!slug) {
            throw new Error("empty room slug");
        }
        const existingRoom = yield prismaClient_1.prisma.room.findUnique({
            where: {
                slug
            }
        });
        if (existingRoom) {
            throw new Error("room already exists! try another name");
        }
        const newRoom = yield prismaClient_1.prisma.room.upsert({
            where: { slug },
            update: {}, // No changes if the room exists
            create: { slug, adminId: id },
        });
        const chats = yield prismaClient_1.prisma.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });
        res.json({
            sucess: true,
            data: chats
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}));
router.post(`/createroom`, middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("create room and join room endpint is hit");
    try {
        let { slug } = req.body;
        slug = (0, slugify_1.default)(slug, { lower: true });
        const id = Number(req.userId);
        console.log(id + " userId");
        console.log("step1");
        if (!slug) {
            throw new Error("empty room slug");
        }
        const existingRoom = yield prismaClient_1.prisma.room.findUnique({
            where: {
                slug
            }
        });
        console.log("step 2");
        if (existingRoom) {
            // throw new Error("room already exists! try another name");
            res.json({
                success: false,
                message: "Room already exists"
            });
        }
        const newRoom = yield prismaClient_1.prisma.room.create({
            data: { slug, adminId: id },
        });
        if (!newRoom) {
            console.log("no room created I am returning");
            return;
        }
        console.log("step 3");
        res.json({
            sucess: true,
            message: "Room created successfully",
            data: newRoom
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
