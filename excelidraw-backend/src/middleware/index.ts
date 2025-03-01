import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("inside meddileware")
    interface decodedUser extends JwtPayload {
        userId: string;
    }
    console.log("step 1");
    console.log(JSON.stringify(req.cookies) + " this is req cookies")
    try {
        const token = req.cookies?.token || req.header("cookie")?.replace("Bearer ", "");
        console.log(token);
        if (!token) {
            throw new Error("Invalid token");
        }
        console.log("step 2")
        console.log(process.env.JWT_SECRET as string)
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as decodedUser;

        if (!decoded.userId) {
            throw new Error("unauthorized access");
        }

        console.log("step 3")
        req.userId = decoded.userId;
        console.log("step 4")
        console.log(token + ' token inside middleware');
        next();
    } catch (error: any) {
        res.json({
            success: false,
            message: error
        })
    }



}

export default middleware;