import express from "express"; 
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import problemRoutes from "./routes/problem.routes.js";
import executionRoutes from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import aiAnalyzeRoutes from "./routes/aiAnalyze.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

export const judge0Limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 code executions per minute
  message: 'Too many code submissions, please wait.'
});


dotenv.config();


const app = express();
app.set("trust proxy", 1);


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : ["https://dsa2z.in","https://dsa-2-z.vercel.app/" ,"https://dsa-2-z.vercel.app","https://www.dsa2z.in","https://dsa2z.in/","https://www.dsa2z.in/"],
    credentials : true
}));

app.use('/api/v1/', apiLimiter);
app.use('/api/v1/execute-code', judge0Limiter);

app.get("/",(req,res)=>{
    res.send("Hello guys, Welcome to DSA2Z🐬")
})

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/problems",problemRoutes);
app.use("/api/v1/execute-code",executionRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/ai-analyze",aiAnalyzeRoutes);
app.use("/api/v1/payment",paymentRoutes)

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running at port ${process.env.PORT}`);
})
