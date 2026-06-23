import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import userRouter from './routes/UserRoute.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();

// 1. Immediately establish Middleware (CRITICAL for Vercel CORS)
app.use(express.json());
app.use(cors({
    origin: 'https://resume-builder-8kdk.vercel.app',
    credentials: true
}));

// 2. Connect to MongoDB lazily so it works perfectly in serverless environments
connectDB().catch(err => console.error("Database connection failed:", err));

// 3. Define Routes
app.get('/', (req, res) => res.send("Server is live...."));
app.use('/api/users', userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);

// 4. ONLY call app.listen if running locally (Vercel ignores app.listen)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on PORT ${PORT}`);
    });
}

// 5. Export for Vercel's serverless handler
export default app;