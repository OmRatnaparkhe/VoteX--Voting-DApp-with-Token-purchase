import mongoose from "mongoose";
import "dotenv/config";
import VoterModel from "./models/VoterSchema.js";
import CandidateModel from "./models/CandidateSchema.js";

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Voters:");
    const voters = await VoterModel.find({});
    console.log(voters);
    
    console.log("Candidates:");
    const candidates = await CandidateModel.find({});
    console.log(candidates);
    
    process.exit(0);
});
