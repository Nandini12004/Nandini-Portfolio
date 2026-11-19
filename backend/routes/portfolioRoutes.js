const express = require("express");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ status: "published" })
            .sort({ updatedAt: -1 })
            .lean();

        if (!portfolio) {
            return res.status(404).json({
                message: "No published portfolio is available yet."
            });
        }

        const publicPortfolio = {
            ...portfolio,
            projects: (portfolio.projects || []).filter(
                (project) => project.status === "published"
            )
        };

        return res.json(publicPortfolio);
    } catch (error) {
        return res.status(500).json({
            message: "Unable to load the portfolio."
        });
    }
});

module.exports = router;
