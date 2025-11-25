import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables if using .env
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://greatstack:Mehroz123@cluster0.wwzi4ij.mongodb.net/?appName=Cluster0";

(uri)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        mongoose.connection.close();
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
