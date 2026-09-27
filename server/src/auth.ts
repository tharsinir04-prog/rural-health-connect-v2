import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {Role} from "@prisma/client";
const secret=process.env.JWT_SECRET||"dev-only-change-me";
export async function hashPassword(s:string){return bcrypt.hash(s,12)}
export async function comparePassword(s:string,h:string){return bcrypt.compare(s,h)}
export function signToken(payload:{id:number,role:Role}){return jwt.sign(payload,secret,{expiresIn:"8h"})}
export function verifyToken(t:string){return jwt.verify(t,secret) as {id:number,role:Role}}
