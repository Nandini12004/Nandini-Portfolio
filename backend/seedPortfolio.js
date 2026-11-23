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
    skillCategories: [
        "Programming Languages",
        "Frontend",
        "Backend",
        "Databases",
        "Tools & Technologies",
        "Data Analytics"
    ],
    skills: [
        { name: "HTML", category: "Frontend" },
        { name: "CSS", category: "Frontend" },
        { name: "JavaScript", category: "Programming Languages" },
        { name: "React.js", category: "Frontend" },
        { name: "Python", category: "Programming Languages" },
        { name: "SQL", category: "Databases" },
        { name: "Excel", category: "Data Analytics" },
        { name: "Power BI", category: "Data Analytics" },
        { name: "Git", category: "Tools & Technologies" },
        { name: "GitHub", category: "Tools & Technologies" },
        { name: "Node.js", category: "Backend" },
        { name: "Express.js", category: "Backend" },
        { name: "MongoDB", category: "Databases" }
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
