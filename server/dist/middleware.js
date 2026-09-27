import { verifyToken } from "./auth.js";
export function auth(req, res, next) { const h = req.headers.authorization; if (!h?.startsWith("Bearer "))
    return res.status(401).json({ message: "Authentication required" }); try {
    req.user = verifyToken(h.slice(7));
    next();
}
catch {
    return res.status(401).json({ message: "Invalid or expired token" });
} }
export function roles(...allowed) { return (req, res, next) => { if (!req.user || !allowed.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" }); next(); }; }
