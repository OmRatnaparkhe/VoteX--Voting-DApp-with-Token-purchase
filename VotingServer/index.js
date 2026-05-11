import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import candidateRoutes from './routes/candidateRoutes.js';
import connectDB from "./db/connect.js";
import authenticationRoute from './routes/authenticationRoute.js';
import voterRoutes from './routes/voterRoutes.js';
import "dotenv/config";

const app = express();

app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-access-token"]
}));

app.use(express.json());

// Serve static images
app.use('/images', express.static(path.join(process.cwd(), 'votingSystem')));

app.use('/api', candidateRoutes);
app.use('/api', authenticationRoute);
app.use('/api', voterRoutes);

connectDB(process.env.MONGO_URI)
.then(()=> {
    console.log("Database connected successfully");
    app.listen(3000,()=> {
        console.log("Server is running on port :",3000);
    })
})
.catch((error)=>{
    console.error("Database connection failed:", error);
});

