import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const secret = process.env.JWT_SECRET || "dev-only-change-me";
export async function hashPassword(s) { return bcrypt.hash(s, 12); }
export async function comparePassword(s, h) { return bcrypt.compare(s, h); }
export function signToken(payload) { return jwt.sign(payload, secret, { expiresIn: "8h" }); }
export function verifyToken(t) { return jwt.verify(t, secret); }
