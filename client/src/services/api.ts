import axios from "axios";
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://localhost:4000/api"});
api.interceptors.request.use(c=>{const t=localStorage.getItem("rhc_token"); if(t)c.headers.Authorization=`Bearer ${t}`; return c;});
export async function login(email:string,password:string){const r=await api.post("/auth/login",{email,password}); localStorage.setItem("rhc_token",r.data.token); localStorage.setItem("rhc_user",JSON.stringify(r.data.user)); return r.data;}
export function logout(){localStorage.removeItem("rhc_token");localStorage.removeItem("rhc_user");}
export function user(){try{return JSON.parse(localStorage.getItem("rhc_user")||"null")}catch{return null}}