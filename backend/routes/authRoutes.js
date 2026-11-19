const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." }
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const admin = await Admin.findOne({ email }).select("+passwordHash");
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 8 * 60 * 60 * 1000
        });

        return res.json({ success: true, email: admin.email });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Unable to log in right now." });
    }
});

router.get("/session", requireAuth, (req, res) => {
    return res.json({ authenticated: true, email: req.admin.email });
});

router.post("/logout", requireAuth, (req, res) => {
    res.clearCookie("admin_token");
    return res.json({ success: true });
});

module.exports = router;
