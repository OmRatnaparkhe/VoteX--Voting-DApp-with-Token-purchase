import mongoose from "mongoose";

const VoterSchema = new mongoose.Schema({
    accountAddress: {
        type: String,
        required: true,
        unique: true // Ensure one registration per address
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

const VoterModel = mongoose.model('Voters', VoterSchema);
export default VoterModel;