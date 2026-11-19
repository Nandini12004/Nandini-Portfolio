const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
    const token = req.cookies?.admin_token;

    if (!token) {
        return res.status(401).json({ message: "Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Your session has expired." });
    }
};

module.exports = requireAuth;
