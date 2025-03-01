import { Request, Response, Router } from "express";
import { createSignupSchema, createSigninSchema } from "../schema/authSchema";
import { prisma } from "../prismaClient";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { any } from "zod";

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {

    try {

        const parsedData = createSignupSchema.safeParse(req.body);

        if (!parsedData.success) {
            throw new Error('invalid signup data');
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        })

        if (existingUser) {
            throw new Error('user already exists');
        }

        let password = parsedData.data.password;
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);
        parsedData.data.password = hashedPassword;

        const user = await prisma.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: parsedData.data.password
            }
        })

        res.json({
            success: true,
            data: user
        })



    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        })

    }

});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const parsedData = createSigninSchema.safeParse(req.body);

        if (!parsedData.success) {
            throw new Error('Invalid signin data');
        }

        const user = await prisma.user.findUnique({ where: { email: parsedData.data.email } });
        if (!user) {
            throw new Error("user not found");
        }
        const password = parsedData.data.password;

        const verifyPassword = bcrypt.compare(password, user.password);

        if (!verifyPassword) {
            throw new Error("Invalid password");
        }


        const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

        const authOptions = {
            httpOnly: true,
            secure: false,

            sameSite: "lax"
        }
        //@ts-ignore
        res.cookie("token", token, authOptions).json({
            success: true,
            data: user,
            token: token
        })


    } catch (error: any) {
        res.json({
            success: false,
            message: error.message
        })

    }
}
)

export default router

