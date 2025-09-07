
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { router } from "./app/routes";
const app = express()

app.use(cookieParser());
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true
}))

app.use("/api/v1", router)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to our Parcel Delivery App"
    })
})

app.use(globalErrorHandler)

app.use(notFound)

export default app;