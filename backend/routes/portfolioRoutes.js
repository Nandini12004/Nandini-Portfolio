const express = require("express");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

const getLegacyContactItems = (portfolio) => [
    portfolio.socialLinks?.email && {
        type: "email",
        label: "Email",
        value: portfolio.socialLinks.email,
        url: `mailto:${portfolio.socialLinks.email}`,
        visible: true
    },
    portfolio.profile?.location && {
        type: "location",
        label: "Location",
        value: portfolio.profile.location,
        url: "",
        visible: true
    },
    portfolio.socialLinks?.github && {
        type: "link",
        label: "GitHub",
        value: portfolio.socialLinks.github,
        url: portfolio.socialLinks.github,
        visible: true
    },
    portfolio.socialLinks?.linkedin && {
        type: "link",
        label: "LinkedIn",
        value: portfolio.socialLinks.linkedin,
        url: portfolio.socialLinks.linkedin,
        visible: true
    }
].filter(Boolean);

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

        const contactItems = (portfolio.contactItems?.length
            ? portfolio.contactItems
            : getLegacyContactItems(portfolio)
        ).filter((item) => item.visible && item.value);
        const managedSocialLinks = portfolio.contactItems?.length
            ? {
                ...portfolio.socialLinks,
                github: contactItems.some((item) => item.label.toLowerCase() === "github")
                    ? portfolio.socialLinks?.github
                    : "",
                linkedin: contactItems.some((item) => item.label.toLowerCase() === "linkedin")
                    ? portfolio.socialLinks?.linkedin
                    : ""
            }
            : portfolio.socialLinks;

        const publicPortfolio = {
            ...portfolio,
            socialLinks: managedSocialLinks,
            projects: (portfolio.projects || []).filter(
                (project) => project.status === "published" && project.title
            ),
            contactItems
        };

        return res.json(publicPortfolio);
    } catch (error) {
        return res.status(500).json({
            message: "Unable to load the portfolio."
        });
    }
});

module.exports = router;
