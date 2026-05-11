import express from "express";
import authentication from '../middlewares/authentication.js';
import multer from "../middlewares/multer.js";
import VoterModel from '../models/VoterSchema.js';
import { uploadToCloudinary, deleteFromCloudinary } from "../cloudinary.js";

const router = express.Router();

router.post('/postVoterImage', authentication, multer.uploadVoter, async (req, res) => {
    try {
        const accountAddress = req.accountAddress;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'VoterImages');

        // Delete old Cloudinary image if record exists
        const existing = await VoterModel.findOne({ accountAddress: new RegExp('^' + accountAddress + '$', 'i') });
        if (existing && existing.publicId) {
            try { await deleteFromCloudinary(existing.publicId); } catch (e) { console.error('Old image cleanup failed:', e); }
        }

        // Upsert - works for both new registrations and updates
        await VoterModel.findOneAndUpdate(
            { accountAddress: new RegExp('^' + accountAddress + '$', 'i') },
            { accountAddress, imageUrl: result.secure_url, publicId: result.public_id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Image uploaded successfully", url: result.secure_url });
    } catch (error) {
        console.error("Voter Upload Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/getVoterImage/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const voter = await VoterModel.findOne({ accountAddress: new RegExp('^' + address + '$', 'i') });
        
        if (voter && voter.imageUrl) {
            return res.redirect(voter.imageUrl);
        }
        res.status(404).json({ message: "Image not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete('/deleteVoterRegistration', authentication, async (req, res) => {
    try {
        const accountAddress = req.accountAddress;
        const voter = await VoterModel.findOne({ accountAddress: new RegExp('^' + accountAddress + '$', 'i') });
        
        if (!voter) {
            return res.status(404).json({ message: "Voter registration not found on server" });
        }

        try {
            await deleteFromCloudinary(voter.publicId);
        } catch (err) {
            console.error("Cloudinary image deletion failed:", err);
        }

        await VoterModel.deleteOne({ _id: voter._id });

        res.status(200).json({ message: "Registration deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;