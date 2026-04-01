import jwt from "jsonwebtoken";
import User from "../models/User.js";



const protectRoute = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No auth header or doesn't start with Bearer");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("User not found for token ID:", decoded.id);
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export default protectRoute;