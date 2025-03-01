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
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../prismaClient");
const express_1 = require("express");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
router.get('/chats/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    if (!slug) {
        return;
    }
    const roomId = yield (0, utils_1.slugToRoomId)(slug);
    const chats = yield prismaClient_1.prisma.chat.findMany({ where: { roomId } });
    if (!chats) {
        return;
    }
    res.json({
        success: true,
        data: chats
    });
}));
exports.default = router;
