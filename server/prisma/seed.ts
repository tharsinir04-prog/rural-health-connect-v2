import {PrismaClient,Role,Availability,StockStatus,AppointmentStatus,ReferralStatus,Urgency} from "@prisma/client";
import bcrypt from "bcryptjs";
const p=new PrismaClient();
async function main(){
  const pass=async(s:string)=>bcrypt.hash(s,12);
  const users:any[]=[
    ["patient@demo.local","Patient@123","Demo Patient",Role.PATIENT],
    ["asha@demo.local","Asha@123","Demo ASHA",Role.ASHA],
    ["doctor@demo.local","Doctor@123","Demo Doctor",Role.DOCTOR],
    ["admin@demo.local","Admin@123","Demo Admin",Role.ADMIN]
  ];
  const made:any={};
  for(const [email,password,name,role] of users) made[role]=await p.user.upsert({where:{email},update:{},create:{email,passwordHash:await pass(password),name,role}});
  const patient=await p.patient.upsert({where:{userId:made[Role.PATIENT].id},update:{},create:{userId:made[Role.PATIENT].id,patientCode:"RHC-DEMO-001",age:28,gender:"Female",village:"Manavilai",bloodGroup:"O+",allergies:"None",emergencyContact:"Demo Contact"}});
  await p.aSHAWorker.upsert({where:{userId:made[Role.ASHA].id},update:{},create:{userId:made[Role.ASHA].id,village:"Manavilai"}});
  const doctor=await p.doctor.upsert({where:{userId:made[Role.DOCTOR].id},update:{availability:Availability.AVAILABLE},create:{userId:made[Role.DOCTOR].id,specialty:"General Medicine",availability:Availability.AVAILABLE}});
  const phc=await p.pHC.create({data:{name:"Manavilai Primary Health Centre — DEMO",latitude:8.3,longitude:77.42,phone:"DEMO",services:["General Medicine","Maternal Care","Vaccination"]}});
  const hosp=await p.hospital.create({data:{name:"District Hospital — DEMO",latitude:8.31,longitude:77.43,phone:"DEMO",services:["Emergency","General Medicine","Diagnostics"],phcId:phc.id}});
  const pharmacy=await p.pharmacy.create({data:{name:"Community Medical Store — DEMO",latitude:8.305,longitude:77.425,phone:"DEMO"}});
  for(const name of ["Paracetamol","ORS","Amoxicillin","Metformin","Amlodipine"]) {const med=await p.medicine.create({data:{name}});await p.medicineStock.create({data:{medicineId:med.id,pharmacyId:pharmacy.id,quantity:name==="Paracetamol"?80:8,status:name==="Paracetamol"?StockStatus.AVAILABLE:StockStatus.LOW_STOCK}});}
  const ap=await p.appointment.create({data:{patientId:patient.id,doctorId:doctor.id,date:new Date(Date.now()+86400000),reason:"Demo appointment",status:AppointmentStatus.CONFIRMED}});
  await p.referral.create({data:{patientId:patient.id,referringPhcId:phc.id,receivingPhcId:phc.id,referringDoctorId:doctor.id,reason:"Demo referral",urgency:Urgency.MEDIUM,status:ReferralStatus.CREATED,expectedBy:new Date(Date.now()+172800000)}});
  await p.governmentScheme.createMany({data:[
    {name:"Ayushman Bharat / PM-JAY",description:"Government health assurance scheme information.",eligibility:"Eligibility must be verified through official channels.",documents:"As specified by the official scheme.",applicationProcess:"Use official enrollment channels.",officialSource:"https://pmjay.gov.in",lastVerified:new Date()},
    {name:"Mahatma Jyotirao Phule Jan Arogya Yojana",description:"Maharashtra public health assurance scheme information.",eligibility:"Eligibility must be verified through official channels.",documents:"As specified by the official scheme.",applicationProcess:"Use official Maharashtra scheme channels.",officialSource:"https://www.jeevandayee.gov.in",lastVerified:new Date()}
  ]});
  await p.reminder.create({data:{patientId:patient.id,type:"APPOINTMENT",title:"Demo doctor appointment",dueAt:ap.date}});
  console.log("Seed complete.");
}
main().finally(()=>p.$disconnect());