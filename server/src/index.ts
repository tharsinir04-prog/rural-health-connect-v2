import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import http from "http";
import crypto from "crypto";
import {Server} from "socket.io";
import {z} from "zod";
import {prisma} from "./db.js";
import {auth,roles,AuthedRequest} from "./middleware.js";
import {comparePassword,hashPassword,signToken} from "./auth.js";
import {Role,Availability,AppointmentStatus,ReferralStatus,EmergencyStatus,StockStatus} from "@prisma/client";

const app=express();
app.use(helmet());app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:5173"}));app.use(express.json({limit:"1mb"}));app.use(rateLimit({windowMs:15*60*1000,max:300}));
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:process.env.CLIENT_ORIGIN||"http://localhost:5173"}});

app.get("/api/health",(_,res)=>res.json({ok:true,service:"rural-health-connect"}));

app.post("/api/auth/register",async(req,res)=>{try{const body=z.object({email:z.string().email(),password:z.string().min(8),name:z.string().min(2),role:z.nativeEnum(Role).default(Role.PATIENT)}).parse(req.body);const exists=await prisma.user.findUnique({where:{email:body.email}});if(exists)return res.status(409).json({message:"Email already registered"});const u=await prisma.user.create({data:{email:body.email,name:body.name,role:body.role,passwordHash:await hashPassword(body.password)}});if(body.role===Role.PATIENT)await prisma.patient.create({data:{userId:u.id,patientCode:`RHC-${u.id}-${Date.now()}`}});return res.status(201).json({id:u.id,email:u.email,name:u.name,role:u.role})}catch(e){return res.status(400).json({message:"Invalid registration data"})}});

app.post("/api/auth/login",async(req,res)=>{const body=z.object({email:z.string().email(),password:z.string()}).parse(req.body);const u=await prisma.user.findUnique({where:{email:body.email}});if(!u||!(await comparePassword(body.password,u.passwordHash)))return res.status(401).json({message:"Invalid credentials"});return res.json({token:signToken({id:u.id,role:u.role}),user:{id:u.id,name:u.name,email:u.email,role:u.role}})});
app.post("/api/auth/logout",auth,(_,res)=>res.json({ok:true}));

app.get("/api/patients/:id",auth,async(req:AuthedRequest,res)=>{const id=Number(req.params.id);const p=await prisma.patient.findUnique({where:{id},include:{user:true,records:true,history:true,prescriptions:true,vaccinations:true,reminders:true}});if(!p)return res.status(404).json({message:"Patient not found"});if(req.user!.role===Role.PATIENT&&p.userId!==req.user!.id)return res.status(403).json({message:"Forbidden"});res.json(p)});
app.post("/api/patients",auth,roles(Role.PATIENT,Role.ASHA,Role.ADMIN),async(req:AuthedRequest,res)=>{const b=z.object({name:z.string().min(2),age:z.number().int().nonnegative().optional(),gender:z.string().optional(),village:z.string().optional(),phone:z.string().optional(),emergencyContact:z.string().optional()}).parse(req.body);const u=await prisma.user.create({data:{name:b.name,email:`patient-${Date.now()}@local.invalid`,passwordHash:await hashPassword(crypto.randomUUID()),role:Role.PATIENT,phone:b.phone}});const p=await prisma.patient.create({data:{userId:u.id,patientCode:`RHC-${Date.now()}`,age:b.age,gender:b.gender,village:b.village,emergencyContact:b.emergencyContact}});res.status(201).json(p)});
app.put("/api/patients/:id",auth,roles(Role.PATIENT,Role.ASHA,Role.ADMIN),async(req,res)=>{const p=await prisma.patient.update({where:{id:Number(req.params.id)},data:req.body});res.json(p)});

app.get("/api/doctors",auth,async(req,res)=>res.json(await prisma.doctor.findMany({include:{user:true}})));
app.get("/api/doctors/:id",auth,async(req,res)=>res.json(await prisma.doctor.findUnique({where:{id:Number(req.params.id)},include:{user:true}})));
app.put("/api/doctors/:id/availability",auth,roles(Role.DOCTOR,Role.ADMIN),async(req:AuthedRequest,res)=>{const a=z.nativeEnum(Availability).parse(req.body.availability);const d=await prisma.doctor.update({where:{id:Number(req.params.id)},data:{availability:a},include:{user:true}});io.emit("doctor:availability",d);res.json(d)});

app.post("/api/appointments",auth,roles(Role.PATIENT,Role.ASHA,Role.ADMIN),async(req:AuthedRequest,res)=>{const b=z.object({doctorId:z.coerce.number().int(),date:z.coerce.date(),reason:z.string().optional(),patientId:z.coerce.number().int().optional()}).parse(req.body);const patientId=b.patientId||(await prisma.patient.findFirst({where:{userId:req.user!.id}}))?.id;if(!patientId)return res.status(400).json({message:"Patient profile required"});const existing=await prisma.appointment.findFirst({where:{doctorId:b.doctorId,date:b.date,status:{in:[AppointmentStatus.PENDING,AppointmentStatus.CONFIRMED]}}});if(existing)return res.status(409).json({message:"That doctor time is already booked"});const a=await prisma.appointment.create({data:{patientId,doctorId:b.doctorId,date:b.date,reason:b.reason}});io.emit("appointment:created",a);res.status(201).json(a)});
app.get("/api/appointments", auth, async (req: AuthedRequest, res) => {
  const where = req.user!.role === Role.PATIENT ? { patient: { userId: req.user!.id } } : {};
  const appointments = await prisma.appointment.findMany({
    where,
    include: { doctor: { include: { user: true } }, patient: true },
    orderBy: { date: "asc" }
  });
  res.json(appointments);
});
app.put("/api/appointments/:id",auth,async(req,res)=>{const a=await prisma.appointment.update({where:{id:Number(req.params.id)},data:{status:z.nativeEnum(AppointmentStatus).parse(req.body.status)}});io.emit("appointment:updated",a);res.json(a)});

app.post("/api/consultations",auth,async(req:AuthedRequest,res)=>{const b=z.object({appointmentId:z.number().int(),mode:z.string().default("VIDEO")}).parse(req.body);const a=await prisma.appointment.findUnique({where:{id:b.appointmentId}});if(!a)return res.status(404).json({message:"Appointment not found"});const c=await prisma.consultation.upsert({where:{appointmentId:a.id},update:{mode:b.mode},create:{appointmentId:a.id,patientId:a.patientId,doctorId:a.doctorId,mode:b.mode}});res.json(c)});
app.get("/api/consultations/:id",auth,async(req,res)=>res.json(await prisma.consultation.findUnique({where:{id:Number(req.params.id)},include:{patient:true,doctor:{include:{user:true}}}})));

app.get("/api/health-card/:patientId",auth,async(req,res)=>{const p=await prisma.patient.findUnique({where:{id:Number(req.params.patientId)},include:{user:true,history:true,records:true,prescriptions:true,vaccinations:true,reminders:true}});if(!p)return res.status(404).json({message:"Not found"});res.json(p)});
app.post("/api/health-records",auth,roles(Role.DOCTOR,Role.ASHA,Role.ADMIN),async(req:AuthedRequest,res)=>res.status(201).json(await prisma.healthRecord.create({data:{...req.body,authorId:req.user!.id}})));
app.put("/api/health-records/:id",auth,roles(Role.DOCTOR,Role.ASHA,Role.ADMIN),async(req,res)=>res.json(await prisma.healthRecord.update({where:{id:Number(req.params.id)},data:req.body})));

app.get("/api/medicines/search",auth,async(req,res)=>{const q=String(req.query.q||"");res.json(await prisma.medicine.findMany({where:{name:{contains:q,mode:"insensitive"}},include:{stock:{include:{pharmacy:true}}}}))});
app.get("/api/medicine-stock",auth,async(_,res)=>res.json(await prisma.medicineStock.findMany({include:{medicine:true,pharmacy:true}})));
app.put("/api/medicine-stock/:id",auth,roles(Role.ADMIN),async(req,res)=>{const quantity=z.coerce.number().int().min(0).parse(req.body.quantity);const status=quantity===0?StockStatus.OUT_OF_STOCK:quantity<10?StockStatus.LOW_STOCK:StockStatus.AVAILABLE;res.json(await prisma.medicineStock.update({where:{id:Number(req.params.id)},data:{quantity,status}}))});

app.get("/api/nearby",auth,async(_,res)=>res.json({phcs:await prisma.pHC.findMany(),hospitals:await prisma.hospital.findMany(),pharmacies:await prisma.pharmacy.findMany(),ambulances:await prisma.ambulance.findMany()}));

app.post("/api/emergency",auth,async(req:AuthedRequest,res)=>{const patient=await prisma.patient.findFirst({where:{userId:req.user!.id}});const e=await prisma.emergencyRequest.create({data:{patientId:patient?.id,latitude:req.body.latitude,longitude:req.body.longitude,notes:req.body.notes}});io.emit("emergency:created",e);res.status(201).json(e)});
app.get("/api/emergency",auth,roles(Role.ASHA,Role.DOCTOR,Role.ADMIN),async(_,res)=>res.json(await prisma.emergencyRequest.findMany({orderBy:{createdAt:"desc"}})));

app.get("/api/schemes",async(_,res)=>res.json(await prisma.governmentScheme.findMany()));
app.get("/api/reminders",auth,async(req:AuthedRequest,res)=>{const p=await prisma.patient.findFirst({where:{userId:req.user!.id}});res.json(p?await prisma.reminder.findMany({where:{patientId:p.id},orderBy:{dueAt:"asc"}}):[])});
app.post("/api/reminders",auth,async(req,res)=>res.status(201).json(await prisma.reminder.create({data:req.body})));

app.post("/api/referrals",auth,roles(Role.DOCTOR,Role.ASHA,Role.ADMIN),async(req:AuthedRequest,res)=>{const b=z.object({patientId:z.number().int(),receivingPhcId:z.number().int(),referringPhcId:z.number().int().optional(),reason:z.string().min(2),urgency:z.string().default("MEDIUM"),expectedBy:z.coerce.date().optional(),notes:z.string().optional()}).parse(req.body);const d=await prisma.referral.create({data:{...b,referringDoctorId:req.user!.role===Role.DOCTOR?undefined:undefined,urgency:b.urgency as any}});io.emit("referral:updated",d);res.status(201).json(d)});
app.get("/api/referrals", auth, async (req: AuthedRequest, res) => {
  const where = req.user!.role === Role.PATIENT ? { patient: { userId: req.user!.id } } : {};
  const referrals = await prisma.referral.findMany({
    where,
    include: { patient: true, receivingPhc: true, referringPhc: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(referrals);
});
app.get("/api/referrals/:id",auth,async(req,res)=>res.json(await prisma.referral.findUnique({where:{id:Number(req.params.id)},include:{patient:true,receivingPhc:true,referringPhc:true}})));
app.put("/api/referrals/:id/status",auth,async(req:AuthedRequest,res)=>{const status=z.nativeEnum(ReferralStatus).parse(req.body.status);const data:any={status};if(status===ReferralStatus.ACCEPTED)data.acceptedAt=new Date();if(status===ReferralStatus.ARRIVED)data.arrivedAt=new Date();if(status===ReferralStatus.COMPLETED)data.completedAt=new Date();const r=await prisma.referral.update({where:{id:Number(req.params.id)},data});await prisma.auditLog.create({data:{userId:req.user!.id,action:"REFERRAL_STATUS",entity:"Referral",entityId:String(r.id),details:{status}}});io.emit("referral:updated",r);res.json(r)});

app.post("/api/voice/process",auth,async(req,res)=>{if(!process.env.BHASHINI_API_KEY)return res.json({mode:"DEMO_FALLBACK",message:"Bhashini is not configured; use text fallback.",text:req.body.text||""});res.status(501).json({message:"Configure the Bhashini adapter for your account before enabling live speech."})});

app.post("/api/sync",auth,async(req:AuthedRequest,res)=>{const op=await prisma.offlineSync.create({data:{userId:req.user!.id,operationType:String(req.body.type),payload:req.body.payload||{}}});res.json({ok:true,syncId:op.id,mode:"RECORDED_FOR_RECONCILIATION"})});

io.on("connection",socket=>{socket.on("consultation:join",id=>socket.join(`consultation:${id}`));socket.on("webrtc:signal",({consultationId,payload})=>socket.to(`consultation:${consultationId}`).emit("webrtc:signal",payload));socket.on("referral:watch",id=>socket.join(`referral:${id}`));});

setInterval(async()=>{const now=new Date();const delayed=await prisma.referral.findMany({where:{status:{in:[ReferralStatus.CREATED,ReferralStatus.PENDING]},expectedBy:{lt:now}}});for(const r of delayed)await prisma.referral.update({where:{id:r.id},data:{status:ReferralStatus.DELAYED}})},60000);

const port=Number(process.env.PORT||4000);
server.listen(port,()=>console.log(`RHC API listening on http://localhost:${port}`));