import express from 'express';
import { Server, ServerResponse } from 'http';
import authencticatedRoutes from '../auth';
import cookieParser from 'cookie-parser';
import roomRoutes from '../room'
import chatroutes from '../chat';
import cors from 'cors';

export let server: Server;
export const app = express();
export const httpServer = () => {
    app.use(cookieParser());
    app.use(express.json());
    app.use(
        cors({
            origin: "http://localhost:5173", // Allow requests from this origin
            credentials: true, // Allow cookies & authentication headers
        })
    );

    app.use('/api', authencticatedRoutes);

    app.use('/api', roomRoutes);
    app.use('/api', chatroutes);



    app.post("/login", (req, res) => {
        res.cookie("token", "sample_token", {
            httpOnly: true,
            secure: false, // `true` in production with HTTPS
            sameSite: "strict",
            path: "/"
        });
        res.json({ message: "Cookie set!" });
    });

    // Checking cookies middleware
    app.get("/check-cookies", (req, res) => {
        console.log("Cookies:", req.cookies);
        res.json({ cookies: req.cookies?.token });
    });




    server = app.listen(3000, () => console.log('http server is running on port 3000'))

}


