const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        technologies: [{ type: String, trim: true }],
        projectUrl: { type: String, default: "", trim: true },
        githubUrl: { type: String, default: "", trim: true },
        imageUrl: { type: String, default: "", trim: true },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published"
        }
    },
    { timestamps: true }
);

const portfolioSchema = new mongoose.Schema(
    {
        profile: {
            name: { type: String, required: true, default: "Nandini Srivastava" },
            title: { type: String, default: "Final-year Computer Science Engineering Student" },
            tagline: { type: String, default: "Turning Ideas Into Interactive Digital Experiences." },
            bio: { type: String, default: "" },
            location: { type: String, default: "India" },
            education: { type: String, default: "B.Tech Computer Science Engineering" },
            focus: { type: String, default: "Development & Analytics" },
            profilePhotoUrl: { type: String, default: "" },
            resumeUrl: { type: String, default: "" }
        },
        socialLinks: {
            github: { type: String, default: "https://github.com/Nandini12004" },
            linkedin: { type: String, default: "https://www.linkedin.com/in/nandinisrivastava012/" },
            email: { type: String, default: "" }
        },
        contactItems: [
            {
                type: {
                    type: String,
                    enum: ["email", "phone", "location", "link"],
                    default: "link"
                },
                label: { type: String, required: true, trim: true, maxlength: 80 },
                value: { type: String, required: true, trim: true, maxlength: 300 },
                url: { type: String, default: "", trim: true, maxlength: 500 },
                visible: { type: Boolean, default: true }
            }
        ],
        skills: [
            {
                name: { type: String, required: true, trim: true },
                category: {
                    type: String,
                    enum: ["core", "advanced", "learning"],
                    default: "core"
                }
            }
        ],
        projects: [projectSchema],
        education: [
            {
                degree: { type: String, default: "B.Tech in Computer Science Engineering" },
                institution: { type: String, default: "Dr. A.P.J. Abdul Kalam Technical University, Lucknow" },
                startYear: { type: String, default: "2023" },
                endYear: { type: String, default: "2027" }
            }
        ],
        experience: [
            {
                company: { type: String, default: "DENSO India" },
                role: { type: String, default: "Frontend/Web Development Intern" },
                description: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" }
            }
        ],
        certificates: [
            {
                name: { type: String, required: true, trim: true },
                issuer: { type: String, default: "" },
                certificateUrl: { type: String, default: "" }
            }
        ],
        achievements: [
            {
                title: { type: String, required: true, trim: true },
                description: { type: String, default: "" }
            }
        ],
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
