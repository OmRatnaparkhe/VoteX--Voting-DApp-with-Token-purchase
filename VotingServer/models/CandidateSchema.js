import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
    accountAddress: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    }
})

const CandidateModel = mongoose.model('candidates', CandidateSchema);
export default CandidateModel;