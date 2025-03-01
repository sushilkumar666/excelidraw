"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomSchema = exports.createSigninSchema = exports.createSignupSchema = void 0;
const zod_1 = require("zod");
exports.createSignupSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string(),
    password: zod_1.z.string()
});
exports.createSigninSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string()
});
exports.createRoomSchema = zod_1.z.object({
    slug: zod_1.z.string(),
    adminId: zod_1.z.number()
});
