import jwt from "jsonwebtoken";
import User from "../models/User";

const response= await fetch("http://localhost:3000/api/books", {
    method: "GET",
    body: JSON.stringify({
        title,
        Caption
    }),
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
});
  
const protectRoute = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

export default protectRoute;