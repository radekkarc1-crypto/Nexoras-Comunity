"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {getSupabaseBrowser} from "../../../lib/supabase-browser";

export default function PublicProfile(){
 const {username}=useParams();const [profile,setProfile]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{if(!username)return;(async()=>{const s=getSupabaseBrowser();const value=decodeURIComponent(username);const{data,error}=await s.from("profiles").select("id,username,display_name,avatar_url,created_at").eq("username",value).maybeSingle();if(error)setError(error.message);else setProfile(data);setLoading(false)})()},[username]);
 return <main className="shell"><header className="topbar"><div className="logo">NEXORAS <span>PROFILE</span></div><nav className="nav"><a href="/community">Community</a><a href="/">Start</a></nav></header><section className="notesPage"><div className="kicker">👤 PUBLIC PROFILE</div>{loading?<h1>Ładowanie... 🛰️</h1>:error?<h1>⚠️ {error}</h1>:!profile?<><h1>👻 Nie znaleziono profilu</h1><p>Ten Nexorian jeszcze nie istnieje albo zmienił nick.</p><a className="profile" href="/community">← Wróć do Community</a></>:<div className="editor" style={{maxWidth:650,marginTop:30}}><div style={{fontSize:90}}>{profile.avatar_url?<img src={profile.avatar_url} alt="Avatar" style={{width:120,height:120,borderRadius:"50%",objectFit:"cover"}}/>:"👤"}</div><h1>{profile.display_name||profile.username||"Nexorian"}</h1><p>@{profile.username}</p><p>🟢 Członek Nexoras Community</p><hr/><p>📅 Dołączył: {new Date(profile.created_at).toLocaleDateString("pl-PL")}</p><div style={{display:"flex",gap:10,marginTop:20,flexWrap:"wrap"}}><a className="profile" href="/community">🌐 Community</a><a className="profile" href="/">🏠 Nexoras</a></div></div>}</section></main>;
}
