require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const portfolioRoutes = require("./routes/portfolioRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const requireAuth = require("./middleware/auth");
const Portfolio = require("./models/Portfolio");
const Contact = require("./models/Contact");

const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "http://127.0.0.1:5176",
            "http://localhost:5176"
        ].filter(Boolean);
        callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/upload", uploadRoutes);

app.get("/api/files/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid file id." });
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "portfolioFiles"
        });
        const files = await bucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray();

        if (!files.length) {
            return res.status(404).json({ message: "File not found." });
        }

        const isDownload = req.query.download === "1";
        res.set("Content-Type", files[0].contentType || "application/pdf");
        res.set("Cache-Control", "public, max-age=3600");
        if (isDownload) {
            res.set(
                "Content-Disposition",
                `attachment; filename="${(files[0].filename || "Nandini-Srivastava-Resume.pdf").replace(/["\\]/g, "_")}"`
            );
        } else {
            res.set("Content-Disposition", "inline");
        }
        return bucket.openDownloadStream(files[0]._id).pipe(res);
    } catch (error) {
        return res.status(500).json({ message: "Unable to load the file." });
    }
});

app.get("/api/admin/portfolio", requireAuth, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne().sort({ updatedAt: -1 });
        return res.json(portfolio);
    } catch (error) {
        return res.status(500).json({ message: "Unable to load portfolio." });
    }
});

app.put("/api/admin/portfolio", requireAuth, async (req, res) => {
    try {
        const allowed = {
            profile: req.body.profile,
            socialLinks: req.body.socialLinks,
            skills: req.body.skills,
            projects: req.body.projects,
            experience: req.body.experience,
            certificates: req.body.certificates,
            achievements: req.body.achievements,
            education: req.body.education,
            status: req.body.status
        };

        let portfolio = await Portfolio.findOne();
        if (!portfolio) {
            portfolio = await Portfolio.create(allowed);
        } else {
            portfolio.set(allowed);
            await portfolio.save();
        }

        return res.json({ success: true, portfolio });
    } catch (error) {
        return res.status(400).json({ message: "Please check the portfolio information." });
    }
});

app.get("/api/admin/contact", requireAuth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
        return res.json(contacts);
    } catch (error) {
        return res.status(500).json({ message: "Unable to load contact messages." });
    }
});

app.delete("/api/admin/contact", requireAuth, async (req, res) => {
    try {
        const result = await Contact.deleteMany({});
        return res.json({
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to clear the inbox." });
    }
});

app.delete("/api/admin/contact/:id", requireAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid message id." });
        }

        const message = await Contact.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Unable to delete the message." });
    }
});

app.get("/", (req, res) => {
    res.send("Portfolio Backend is Running!");
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Portfolio API is working!"
    });
});

app.use((req, res) => {
    res.status(404).json({
        message: "API route not found."
    });
});

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server could not start:", error.message);
        process.exitCode = 1;
    }
};

const shutDown = async () => {
    await mongoose.disconnect();
    process.exit(0);
};

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);

startServer();
