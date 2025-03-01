import { WebSocket, WebSocketServer } from 'ws'
import { server } from './httpServer';
import cookie from 'cookie'
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { prisma } from '../prismaClient';
import { slugToRoomId } from '../utils';
import { app } from './httpServer';
import { parse } from "url";
import { any, number } from 'zod';

export let wss: WebSocketServer;
app.use(cookieParser());

interface User {
    ws: WebSocket,
    rooms: number[],
    userId: number
}

const users: User[] = [];

export function webSocketServer() {

    interface DecodedToken extends JwtPayload {
        userId: string;
    }

    if (!server) {
        throw new Error('HTTP server is not initialized before WebSocket!');
    }
    wss = new WebSocketServer({ server });

    wss.on('connection', async (ws, req) => {

        try {


            const { query } = parse(req.url!, true);
            const token = query.token;

            if (!token) {
                ws.close();
                return;
            }

            //@ts-ignore
            const decoded = await jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
            console.log(JSON.stringify(decoded) + " decoded data");
            if (!decoded.userId) {
                ws.close();
                return;
            }
            const rooms: number[] = [];
            users.push({ userId: Number(decoded.userId), ws, rooms });

            console.log('connected to websocket server');

            ws.on('message', async (message) => {
                console.log('message ' + message);

                const parsedData = JSON.parse(message.toString());
                const userData = users.find(user => user.ws === ws);
                const userId = userData?.userId;

                if (parsedData.type === 'join_room') {
                    console.log(JSON.stringify(parsedData))
                    const slug = parsedData.slug;
                    console.log("slug is comming " + slug)
                    const roomId = await slugToRoomId(slug);
                    console.log("join room message at least hittingthis point")

                    // const roomId = req.url?.split("/")[1];
                    if (!roomId) {
                        console.log("room does not exist");
                        return;
                    }
                    const user = users.find((user) => user.ws === ws);
                    user?.rooms.push(Number(roomId));
                    // console.log(JSON.stringify(users) + " user data data after room joining");
                    console.log("user joined room susccessuflly")
                }

                if (parsedData.type === 'leave_room') {
                    if (!userData) {
                        return;
                    }

                    const slug = parsedData.slug;
                    const roomId = await slugToRoomId(slug);

                    userData.rooms = userData.rooms.filter((room) => room !== roomId);

                    console.log(JSON.stringify(users) + " users data after leaving the room");
                }


                if (parsedData.type === 'eraser') {
                    const slug = parsedData.slug;
                    console.log("inside eraser ")
                    const shape = parsedData.shape;
                    const message = parsedData.message;
                    console.log(message + " this is inside eraser ");
                    const roomId = await slugToRoomId(slug);
                    if (!roomId) {
                        console.log("no roomId i am returning")
                        return;
                    }

                    users.forEach((user) => {
                        if (user.rooms.includes(roomId)) {
                            // console.log("i ma seingding mssages...")
                            user.ws.send(JSON.stringify({ type: 'eraser', shape: shape, message: message }))
                        }
                    })
                }

                if (parsedData.type === 'eraseBackend') {
                    console.log(parsedData + " this is inside eraserVackedns")
                    let message = JSON.stringify({ type: parsedData.shape, ...parsedData.message[0] });
                    const slug = parsedData.slug;
                    const roomId = slugToRoomId(slug);


                    if (parsedData.shape === 'pencil') {
                        let deletePencilShapes = await prisma.chat.deleteMany({
                            //@ts-ignore
                            where: { roomId }
                        });
                        return;
                    }

                    console.log(message + " this is my stingiyfy message");

                    const chatToDelete = await prisma.chat.findFirst({

                        where: { message: message },

                    });
                    console.log(chatToDelete + " this is chat to delte");
                    let deletedChat;
                    if (chatToDelete) {
                        deletedChat = await prisma.chat.delete({
                            where: { id: chatToDelete.id } // 👈 Ab ID se delete kar rahe hain
                        });
                    }
                    console.log(deletedChat + " this is deleted chat");
                }

                if (parsedData.type === 'chat') {
                    const slug = parsedData.slug;

                    const roomId = await slugToRoomId(slug);
                    if (!roomId) {
                        return;
                    }
                    const message = JSON.stringify(parsedData.message);
                    if (!userId) {
                        return;
                    }
                    try {
                        console.log("tyring to create chat in backend")
                        const chat = await prisma.chat.create({
                            data: {
                                userId,
                                roomId,
                                message
                            }
                        })
                        console.log("chat created")

                        if (chat) {
                            console.log(chat);
                        }

                        users.forEach((user) => {
                            if (user.rooms.includes(roomId)) {
                                user.ws.send(JSON.stringify({ type: 'chat', roomId: roomId, message: message }))
                            }
                        })

                    }
                    catch (error: any) {
                        console.log("error while creating chat " + error);
                    }

                }
            })

            ws.on('close', () => {
                console.log('websocket connection closed');
            })

        }
        catch (error) {
            console.log("error " + error);
            ws.close();
        }
    })
}


