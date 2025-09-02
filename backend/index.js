// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";
import { connectArduino, sendToArduino } from "./controllers/aurdino.js";

// ✅ Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors({
  origin: "http://localhost:5173",  // frontend origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);


// ✅ Start server
app.listen(port, () => {
  connectDb();
  console.log(`🚀 Server running on port ${port}`);
});
