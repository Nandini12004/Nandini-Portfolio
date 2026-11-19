require("dotenv").config();

const connectDB = require("./config/db");
const Portfolio = require("./models/Portfolio");

const initialPortfolio = {
    profile: {
        name: "Nandini Srivastava",
        title: "Final-year Computer Science Engineering Student",
        bio: "",
        location: "India",
        education: "B.Tech Computer Science Engineering",
        profilePhotoUrl: "",
        resumeUrl: ""
    },
    socialLinks: {
        github: "https://github.com/Nandini12004",
        linkedin: "https://www.linkedin.com/in/nandinisrivastava012/",
        email: "nandini.1210sr@gmail.com"
    },
    skills: [
        { name: "HTML", category: "core" },
        { name: "CSS", category: "core" },
        { name: "JavaScript", category: "core" },
        { name: "React.js", category: "core" },
        { name: "Python", category: "core" },
        { name: "SQL", category: "core" },
        { name: "Excel", category: "core" },
        { name: "Power BI", category: "core" },
        { name: "Git", category: "core" },
        { name: "GitHub", category: "core" },
        { name: "Node.js", category: "learning" },
        { name: "Express.js", category: "learning" },
        { name: "MongoDB", category: "learning" }
    ],
    projects: [
        {
            title: "Attendance Buddy",
            description: "Attendance tracking and academic progress management application.",
            technologies: [],
            projectUrl: "",
            githubUrl: "",
            imageUrl: "",
            status: "published"
        },
        {
            title: "Suraksha",
            description: "Smart disaster preparedness platform developed as a hackathon project.",
            technologies: [],
            projectUrl: "",
            githubUrl: "",
            imageUrl: "",
            status: "published"
        },
        {
            title: "Customer Analytics Dashboard",
            description: "Dashboard project to be added after completion.",
            technologies: [],
            projectUrl: "",
            githubUrl: "",
            imageUrl: "",
            status: "draft"
        }
    ],
    experience: [
        {
            company: "DENSO India",
            role: "Frontend/Web Development Intern",
            description: "",
            startDate: "",
            endDate: ""
        }
    ],
    certificates: [
        {
            name: "Generative AI",
            issuer: "IBM SkillBuild",
            certificateUrl: ""
        },
        {
            name: "Basics of Python",
            issuer: "Infosys Springboard",
            certificateUrl: ""
        }
    ],
    achievements: [
        {
            title: "Hackathon participation and recognition",
            description: ""
        }
    ],
    status: "published"
};

const seedPortfolio = async () => {
    try {
        await connectDB();

        const existingPortfolio = await Portfolio.findOne();

        if (existingPortfolio) {
            console.log("Portfolio already exists. Seed skipped.");
            process.exit(0);
        }

        await Portfolio.create(initialPortfolio);
        console.log("Portfolio seed created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Unable to seed portfolio:", error.message);
        process.exit(1);
    }
};

seedPortfolio();
