import {openDB} from "idb";
const dbPromise=openDB("rhc-offline",1,{upgrade(db){if(!db.objectStoreNames.contains("ops"))db.createObjectStore("ops",{keyPath:"id",autoIncrement:true});}});
export async function queueOperation(type:string,payload:unknown){const db=await dbPromise;await db.add("ops",{type,payload,createdAt:Date.now()});}
export async function pendingOperations(){const db=await dbPromise;return db.getAll("ops");}
export async function clearOperation(id:number){const db=await dbPromise;await db.delete("ops",id);}
export async function syncPending(){if(!navigator.onLine)return 0;const ops=await pendingOperations();let done=0;for(const op of ops){try{await fetch(`${import.meta.env.VITE_API_URL||"http://localhost:4000/api"}/sync`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("rhc_token")||""}`},body:JSON.stringify(op)});await clearOperation(op.id);done++;}catch{break;}}return done;}