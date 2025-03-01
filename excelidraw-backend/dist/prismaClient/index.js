"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
let prismaClient;
const getPrismaClient = () => {
    if (!prismaClient) {
        prismaClient = new client_1.PrismaClient();
    }
    return prismaClient;
};
exports.prisma = getPrismaClient();
