import { prisma } from "../prismaClient";
import { Router, Request, Response } from "express";
import { slugToRoomId } from "../utils";

const router = Router();


router.get('/chats/:slug', async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
        return
    }

    const roomId = await slugToRoomId(slug);
    const chats = await prisma.chat.findMany({ where: { roomId } });
    if (!chats) {
        return;
    }

    res.json({
        success: true,
        data: chats
    })

})

export default router;