import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {


    try {

        console.log("All Cookies:", req.cookies);

        const token = req.cookies.jwt;
        console.log("JWT Token:", token);
        if(!token) {
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded);

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            console.log("User not found in DB for ID:", decoded.userId)
            return res.status(401).json({message: "Unauthorized - User not found"});
        }

        req.user = user;
        next();


    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
