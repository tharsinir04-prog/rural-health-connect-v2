import {Request,Response,NextFunction} from "express";
import {Role} from "@prisma/client";
import {verifyToken} from "./auth.js";
export type AuthedRequest=Request & {user?:{id:number,role:Role}};
export function auth(req:AuthedRequest,res:Response,next:NextFunction){const h=req.headers.authorization;if(!h?.startsWith("Bearer "))return res.status(401).json({message:"Authentication required"});try{req.user=verifyToken(h.slice(7));next()}catch{return res.status(401).json({message:"Invalid or expired token"})}}
export function roles(...allowed:Role[]){return (req:AuthedRequest,res:Response,next:NextFunction)=>{if(!req.user||!allowed.includes(req.user.role))return res.status(403).json({message:"Forbidden"});next()}}
