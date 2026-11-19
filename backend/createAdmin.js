require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const createAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before running this script.");
        }

        await connectDB();

        const existingAdmin = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (existingAdmin) {
            console.log("An admin account already exists for this email.");
            await mongoose.disconnect();
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await Admin.create({ email: email.trim().toLowerCase(), passwordHash });

        console.log("Admin account created successfully.");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Unable to create admin account:", error.message);
        process.exit(1);
    }
};

createAdmin();
