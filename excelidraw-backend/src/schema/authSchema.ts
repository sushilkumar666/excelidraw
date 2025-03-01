import { z } from 'zod';

export const createSignupSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string()
})

export const createSigninSchema = z.object({
    email: z.string(),
    password: z.string()
})


export const createRoomSchema = z.object({
    slug: z.string(),
    adminId: z.number()
})