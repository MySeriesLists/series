import  Jwt from "jsonwebtoken";
//verifyToken
export default function verifyToken(req, res, next) {
    const token = req.cookies['auth-token'];
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }
    try {
        const verified = Jwt.verify(token, process.env.JWT_AUTH_KEY);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
}