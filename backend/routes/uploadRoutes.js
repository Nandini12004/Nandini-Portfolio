const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/auth");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const allowedTypes = {
    photo: ["image/jpeg", "image/png", "image/webp"],
    resume: ["application/pdf"]
};

async function storeFile(file, folder) {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "portfolioFiles"
    });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: { folder }
        });

        uploadStream.on("error", reject);
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.end(file.buffer);
    });
}

async function removeOldFile(fileUrl) {
    const match = fileUrl?.match(/\/api\/files\/([a-f\d]{24})$/i);
    if (!match) return;

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "portfolioFiles"
    });
    await bucket.delete(new mongoose.Types.ObjectId(match[1])).catch(() => {});
}

async function uploadFile(req, res, type) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please select a file." });
        }

        if (!allowedTypes[type].includes(req.file.mimetype)) {
            return res.status(400).json({
                message: type === "resume"
                    ? "Only PDF resume files are allowed."
                    : "Only JPG, PNG, or WebP images are allowed."
            });
        }

        const maximumSize = type === "resume" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (req.file.size > maximumSize) {
            return res.status(400).json({
                message: type === "resume"
                    ? "Resume must be smaller than 10 MB."
                    : "Profile photo must be smaller than 5 MB."
            });
        }

        const fileId = await storeFile(req.file, type);
        let portfolio = await Portfolio.findOne();

        if (!portfolio) {
            portfolio = await Portfolio.create({ status: "published" });
        }

        const field = type === "resume" ? "resumeUrl" : "profilePhotoUrl";
        await removeOldFile(portfolio.profile?.[field]);
        portfolio.profile[field] = `/api/files/${fileId.toString()}`;
        await portfolio.save();

        return res.json({
            success: true,
            url: portfolio.profile[field]
        });
    } catch (error) {
        console.error("File upload failed:", error.message);
        return res.status(500).json({ message: "Unable to upload the file." });
    }
}

router.post(
    "/profile-photo",
    requireAuth,
    upload.single("file"),
    (req, res) => uploadFile(req, res, "photo")
);

router.post(
    "/resume",
    requireAuth,
    upload.single("file"),
    (req, res) => uploadFile(req, res, "resume")
);

router.delete("/:type", requireAuth, async (req, res) => {
    try {
        const type = req.params.type;
        if (!["profile-photo", "resume"].includes(type)) {
            return res.status(400).json({ message: "Invalid file type." });
        }

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found." });
        }

        const field = type === "resume" ? "resumeUrl" : "profilePhotoUrl";
        await removeOldFile(portfolio.profile?.[field]);
        portfolio.profile[field] = "";
        await portfolio.save();

        return res.json({ success: true, url: "" });
    } catch (error) {
        console.error("File removal failed:", error.message);
        return res.status(500).json({ message: "Unable to remove the file." });
    }
});

module.exports = router;
