const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");

const router = express.Router();

const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string"
        ) {
            return res.status(400).json({ message: "Please complete all contact fields." });
        }

        const cleanData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
        };

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanData.email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        await Contact.create(cleanData);

        if (
            process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            process.env.CONTACT_TO
        ) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT),
                    secure: Number(process.env.SMTP_PORT) === 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    to: process.env.CONTACT_TO,
                    replyTo: cleanData.email,
                    subject: `Portfolio contact: ${cleanData.subject}`,
                    text: `Name: ${cleanData.name}\nEmail: ${cleanData.email}\n\n${cleanData.message}`,
                    html: `<p><strong>Name:</strong> ${escapeHtml(cleanData.name)}</p><p><strong>Email:</strong> ${escapeHtml(cleanData.email)}</p><p>${escapeHtml(cleanData.message)}</p>`
                });
            } catch (mailError) {
                console.error("Contact email delivery failed:", mailError.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Thank you! Your message has been received."
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Please check all fields and try again." });
        }

        console.error("Contact submission failed:", error.message);
        return res.status(500).json({ message: "Unable to send your message right now." });
    }
});

module.exports = router;
