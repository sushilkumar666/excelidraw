import { Router, Request, Response } from "express";
import { prisma } from "../prismaClient";
import middleware from "../middleware";
import slugify from "slugify";
import { slugToRoomId } from "../utils";


const router = Router();


router.post('/roomexists', async (req: Request, res: Response) => {
    try {
        let { slug } = req.body;
        slug = slugify(slug, { lower: true });
        const roomExists = await prisma.room.findFirst({ where: { slug: slug } });

        if (roomExists) {
            res.json({ success: true, data: slug });
        } else {
            res.json({ success: false, data: "room doesn't exists" });
        }
    } catch (error) {
        res.json({ success: false, data: "room doesn't exist" });
    }

})


router.get(`room/:slug`, middleware, async (req: Request, res: Response) => {
    console.log("create room and join room endpint is hit")
    try {
        let slug = req.params.slug;
        slug = slugify(slug, { lower: true });
        const id = Number(req.userId);

        const roomId = await slugToRoomId(slug);

        if (!slug) {
            throw new Error("empty room slug")
        }

        const existingRoom = await prisma.room.findUnique({
            where: {
                slug
            }
        })

        if (existingRoom) {
            throw new Error("room already exists! try another name");
        }

        const newRoom = await prisma.room.upsert({
            where: { slug },
            update: {}, // No changes if the room exists
            create: { slug, adminId: id },
        });

        const chats = await prisma.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })


        res.json({
            sucess: true,
            data: chats
        })
    } catch (error: any) {
        res.json({
            success: false,
            message: error.message
        })
    }

})


router.post(`/createroom`, middleware, async (req: Request, res: Response) => {
    console.log("create room and join room endpint is hit");
    try {
        let { slug } = req.body;
        slug = slugify(slug, { lower: true });
        const id = Number(req.userId);
        console.log(id + " userId")
        console.log("step1")
        if (!slug) {
            throw new Error("empty room slug")
        }

        const existingRoom = await prisma.room.findUnique({
            where: {
                slug
            }
        })

        console.log("step 2")

        if (existingRoom) {
            // throw new Error("room already exists! try another name");
            res.json({
                success: false,
                message: "Room already exists"
            })
        }

        const newRoom = await prisma.room.create({
            data: { slug, adminId: id },
        });

        if (!newRoom) {
            console.log("no room created I am returning")
            return;
        }
        console.log("step 3")

        res.json({
            success: true,
            message: "Room created successfully",
            data: newRoom
        })
    } catch (error: any) {
        res.json({
            success: false,
            message: error.message
        })
    }

})



export default router;





