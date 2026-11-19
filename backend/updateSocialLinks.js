require("dotenv").config();

const connectDB = require("./config/db");
const Portfolio = require("./models/Portfolio");

const updateSocialLinks = async () => {
    try {
        await connectDB();

        const result = await Portfolio.updateMany(
            {},
            {
                $set: {
                    "socialLinks.github": "https://github.com/Nandini12004",
                    "socialLinks.linkedin": "https://www.linkedin.com/in/nandinisrivastava012/",
                    "socialLinks.email": "nandini.1210sr@gmail.com"
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} portfolio record.`);
        process.exit(0);
    } catch (error) {
        console.error("Unable to update social links:", error.message);
        process.exit(1);
    }
};

updateSocialLinks();
