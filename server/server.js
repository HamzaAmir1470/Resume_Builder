import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import userRouter from './routes/UserRoute.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Run server + DB connection properly
const startServer = async () => {
    try {
        await connectDB(); // <-- FIXED: now inside async function

        app.use(express.json());
        app.use(cors({ origin: 'https://resume-builder-8kdk.vercel.app' }));

        app.get('/', (req, res) => res.send("Server is live...."));

        app.use('/api/users', userRouter);
        app.use('/api/resumes', resumeRouter);
        app.use('/api/ai', aiRouter);

        app.listen(PORT, () => {
            console.log(`Server running on PORT ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
    }
};

startServer(); 
module.exports = app; 