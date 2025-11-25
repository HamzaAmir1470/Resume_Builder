import express from 'express';
import protect from '../Middleware/authMiddleware.js';
import upload from '../configs/multer.js';
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from '../controllers/resumeController.js';

const resumeRouter = express.Router();

resumeRouter.post('/create', protect, createResume);
resumeRouter.put('/update', upload.single('image'), protect, updateResume);
resumeRouter.delete('/delete/:resumeId', protect, deleteResume);
resumeRouter.get('/get/:resumeId', protect, getResumeById);
resumeRouter.get('/public/:resumeId', getPublicResumeById);


export default resumeRouter;
