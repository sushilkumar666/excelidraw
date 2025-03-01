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
exports.wss = void 0;
exports.webSocketServer = webSocketServer;
const ws_1 = require("ws");
const httpServer_1 = require("./httpServer");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prismaClient_1 = require("../prismaClient");
const utils_1 = require("../utils");
const httpServer_2 = require("./httpServer");
const url_1 = require("url");
httpServer_2.app.use((0, cookie_parser_1.default)());
const users = [];
function webSocketServer() {
    if (!httpServer_1.server) {
        throw new Error('HTTP server is not initialized before WebSocket!');
    }
    exports.wss = new ws_1.WebSocketServer({ server: httpServer_1.server });
    exports.wss.on('connection', (ws, req) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { query } = (0, url_1.parse)(req.url, true);
            const token = query.token;
            if (!token) {
                ws.close();
                return;
            }
            //@ts-ignore
            const decoded = yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log(JSON.stringify(decoded) + " decoded data");
            if (!decoded.userId) {
                ws.close();
                return;
            }
            const rooms = [];
            users.push({ userId: Number(decoded.userId), ws, rooms });
            console.log('connected to websocket server');
            ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('message ' + message);
                const parsedData = JSON.parse(message.toString());
                const userData = users.find(user => user.ws === ws);
                const userId = userData === null || userData === void 0 ? void 0 : userData.userId;
                if (parsedData.type === 'join_room') {
                    console.log(JSON.stringify(parsedData));
                    const slug = parsedData.slug;
                    console.log("slug is comming " + slug);
                    const roomId = yield (0, utils_1.slugToRoomId)(slug);
                    console.log("join room message at least hittingthis point");
                    // const roomId = req.url?.split("/")[1];
                    if (!roomId) {
                        console.log("room does not exist");
                        return;
                    }
                    const user = users.find((user) => user.ws === ws);
                    user === null || user === void 0 ? void 0 : user.rooms.push(Number(roomId));
                    // console.log(JSON.stringify(users) + " user data data after room joining");
                    console.log("user joined room susccessuflly");
                }
                if (parsedData.type === 'leave_room') {
                    if (!userData) {
                        return;
                    }
                    const slug = parsedData.slug;
                    const roomId = yield (0, utils_1.slugToRoomId)(slug);
                    userData.rooms = userData.rooms.filter((room) => room !== roomId);
                    console.log(JSON.stringify(users) + " users data after leaving the room");
                }
                if (parsedData.type === 'eraser') {
                    const slug = parsedData.slug;
                    console.log("inside eraser ");
                    const shape = parsedData.shape;
                    const message = parsedData.message;
                    console.log(message + " this is inside eraser ");
                    const roomId = yield (0, utils_1.slugToRoomId)(slug);
                    if (!roomId) {
                        console.log("no roomId i am returning");
                        return;
                    }
                    users.forEach((user) => {
                        if (user.rooms.includes(roomId)) {
                            // console.log("i ma seingding mssages...")
                            user.ws.send(JSON.stringify({ type: 'eraser', shape: shape, message: message }));
                        }
                    });
                }
                if (parsedData.type === 'eraseBackend') {
                    console.log(parsedData + " this is inside eraserVackedns");
                    let message = JSON.stringify(Object.assign({ type: parsedData.shape }, parsedData.message[0]));
                    const slug = parsedData.slug;
                    const roomId = (0, utils_1.slugToRoomId)(slug);
                    if (parsedData.shape === 'pencil') {
                        let deletePencilShapes = yield prismaClient_1.prisma.chat.deleteMany({
                            //@ts-ignore
                            where: { roomId }
                        });
                        return;
                    }
                    console.log(message + " this is my stingiyfy message");
                    const chatToDelete = yield prismaClient_1.prisma.chat.findFirst({
                        where: { message: message },
                    });
                    console.log(chatToDelete + " this is chat to delte");
                    let deletedChat;
                    if (chatToDelete) {
                        deletedChat = yield prismaClient_1.prisma.chat.delete({
                            where: { id: chatToDelete.id } // 👈 Ab ID se delete kar rahe hain
                        });
                    }
                    console.log(deletedChat + " this is deleted chat");
                }
                if (parsedData.type === 'chat') {
                    const slug = parsedData.slug;
                    const roomId = yield (0, utils_1.slugToRoomId)(slug);
                    if (!roomId) {
                        return;
                    }
                    const message = JSON.stringify(parsedData.message);
                    if (!userId) {
                        return;
                    }
                    try {
                        console.log("tyring to create chat in backend");
                        const chat = yield prismaClient_1.prisma.chat.create({
                            data: {
                                userId,
                                roomId,
                                message
                            }
                        });
                        console.log("chat created");
                        if (chat) {
                            console.log(chat);
                        }
                        users.forEach((user) => {
                            if (user.rooms.includes(roomId)) {
                                user.ws.send(JSON.stringify({ type: 'chat', roomId: roomId, message: message }));
                            }
                        });
                    }
                    catch (error) {
                        console.log("error while creating chat " + error);
                    }
                }
            }));
            ws.on('close', () => {
                console.log('websocket connection closed');
            });
        }
        catch (error) {
            console.log("error " + error);
            ws.close();
        }
    }));
}
