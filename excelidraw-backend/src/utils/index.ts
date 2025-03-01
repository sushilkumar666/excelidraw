import { prisma } from "../prismaClient";


export async function slugToRoomId(slug: string) {
    if (!slug) return;
    const room = await prisma.room.findUnique({ where: { slug: slug } });
    return room?.id;
}