"use client";
import {useEffect,useState} from "react";
import {getSupabaseBrowser} from "../../lib/supabase-browser";

function daysSince(date){if(!date)return 0;return Math.max(1,Math.floor((Date.now()-new Date(date).getTime())/86400000))}

export default function Dashboard(){
 const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[stats,setStats]=useState({messages:0,notifications:0}),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{(async()=>{try{const s=getSupabaseBrowser();const{data:{user}}=await s.auth.getUser();if(!user){location.href="/auth";return}setUser(user);const[{data:p,error:pe},{count:mc,error:me},{count:nc,error:ne}]=await Promise.all([
   s.from("profiles").select("username,display_name,avatar_url,bio,created_at,last_seen_at").eq("id",user.id).single(),
   s.from("messages").select("id",{count:"exact",head:true}).eq("sender_id",user.id),
   s.from("notifications").select("id",{count:"exact",head:true}).eq("user_id",user.id).is("read_at",null)
 ]);if(pe)throw pe;if(me)throw me;if(ne)throw ne;setProfile(p);setStats({messages:mc||0,notifications:nc||0})}catch(e){setError(e.message||"Nie udało się załadować dashboardu.")}finally{setLoading(false)}})()},[]);
 if(loading)return <main className="shell"><div className="notesEmpty">Ładowanie dashboardu... 📊</div></main>;
 if(error)return <main className="shell"><div className="notesEmpty">⚠️ {error}</div></main>;
 const display=profile?.display_name||profile?.username||"Nexorian";
 const completeness=[profile?.username,profile?.display_name,profile?.avatar_url,profile?.bio].filter(Boolean).length*25;
 return <main className="shell"><header className="topbar"><div className="logo">NEXORAS <span>DASHBOARD</span></div><a className="profile" href="/profile">👤 Profil</a></header><section className="notesPage"><div className="kicker">📊 NEXORAS DASHBOARD</div><h1>Witaj, {display}!</h1><p>Twoje konto w jednym miejscu. Mały panel sterowania, zero tabelkowego smutku. 🚀</p><div className="communityStats" style={{marginTop:30}}><b>{stats.messages}</b><span>wiadomości wysłane</span><b>{stats.notifications}</b><span>nieprzeczytane</span><b>{daysSince(profile?.created_at)}</b><span>dni w Nexoras</span></div><div className="grid" style={{marginTop:25}}><article className="card"><div className="icon">👤</div><h2>Profil</h2><p>{completeness}% uzupełnienia profilu</p><button onClick={()=>location.href="/profile"}>Edytuj profil</button></article><article className="card"><div className="icon">💬</div><h2>Wiadomości</h2><p>Wysłano {stats.messages} wiadomości.</p><button onClick={()=>location.href="/messages"}>Otwórz wiadomości</button></article><article className="card"><div className="icon">🔔</div><h2>Powiadomienia</h2><p>{stats.notifications?`Masz ${stats.notifications} nowych.`:"Wszystko przeczytane. ✨"}</p><button onClick={()=>location.href="/notifications"}>Powiadomienia</button></article><article className="card"><div className="icon">🌐</div><h2>Społeczność</h2><p>Poznaj aktywnych użytkowników Nexorasa.</p><button onClick={()=>location.href="/community"}>Community</button></article></div><div style={{marginTop:25}}><button onClick={async()=>{const s=getSupabaseBrowser();await s.auth.signOut();location.href="/"}}>🚪 Wyloguj</button></div></section></main>
}
