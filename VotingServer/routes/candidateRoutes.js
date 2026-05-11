import express from "express";
import CandidateModel from '../models/CandidateSchema.js';
import multer from '../middlewares/multer.js';
import authentication from '../middlewares/authentication.js';
import { uploadToCloudinary, deleteFromCloudinary } from "../cloudinary.js";

const router = express.Router();

router.post('/postCandidateImage', authentication, multer.uploadCandidate, async (req, res) => {
    try {
        const accountAddress = req.accountAddress;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'CandidateImages');

        // Delete old Cloudinary image if record exists
        const existing = await CandidateModel.findOne({ accountAddress: new RegExp('^' + accountAddress + '$', 'i') });
        if (existing && existing.publicId) {
            try { await deleteFromCloudinary(existing.publicId); } catch (e) { console.error('Old image cleanup failed:', e); }
        }

        // Upsert - works for both new registrations and updates
        await CandidateModel.findOneAndUpdate(
            { accountAddress: new RegExp('^' + accountAddress + '$', 'i') },
            { accountAddress, imageUrl: result.secure_url, publicId: result.public_id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Image uploaded successfully", url: result.secure_url });
    } catch (error) {
        console.error("Candidate Upload Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/getCandidateImage/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const candidate = await CandidateModel.findOne({ accountAddress: new RegExp('^' + address + '$', 'i') });
        
        if (candidate && candidate.imageUrl) {
            return res.redirect(candidate.imageUrl);
        }
        res.status(404).json({ message: "Image not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete('/deleteCandidateRegistration', authentication, async (req, res) => {
    try {
        const accountAddress = req.accountAddress;
        const candidate = await CandidateModel.findOne({ accountAddress: new RegExp('^' + accountAddress + '$', 'i') });
        
        if (!candidate) {
            return res.status(404).json({ message: "Candidate registration not found on server" });
        }

        try {
            await deleteFromCloudinary(candidate.publicId);
        } catch (err) {
            console.error("Cloudinary image deletion failed:", err);
        }

        await CandidateModel.deleteOne({ _id: candidate._id });

        res.status(200).json({ message: "Registration deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;