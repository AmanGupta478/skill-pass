import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRoute from "./routes/user.route.js"
import adminRoute from "./routes/admin.route.js"
import entrieRoute from "./routes/entries.routes.js"
import verifireRoute from "./routes/verificationRoutes.js"
import flagRoute from "./routes/flag.route.js"
import dotenv from "dotenv";
dotenv.config({});

const app = express();
const prisma = new PrismaClient();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:3000", // Next.js frontend
  credentials: true,
};
app.use(cors(corsOptions));

// api
app.use("/v1/auth", userRoute);
app.use("/v1/admin", adminRoute);
app.use("/v1/entri", entrieRoute);
app.use("/v1/varifire", verifireRoute);
app.use("/v1/flag", flagRoute);


const PORT =process.env.PORT || 4000;

app.listen(PORT,() => {
    console.log(`Server running at port ${PORT}`);
})