"use client";

import { useEffect, useState } from "react";

const empty = Array(9).fill(null);
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b){for(const [a,c,d] of lines) if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a]; return b.every(Boolean)?"draw":null;}
function ai(b){const free=b.map((v,i)=>v?null:i).filter(i=>i!==null); for(const i of free){const x=[...b];x[i]="O";if(winner(x)==="O")return x;} for(const i of free){const x=[...b];x[i]="X";if(winner(x)==="X"){const n=[...b];n[i]="O";return n;}} const order=[4,0,2,6,8,1,3,5,7].filter(i=>!b[i]); const n=[...b]; if(order.length)n[order[Math.floor(Math.random()*Math.min(3,order.length))]]="O"; return n;}

export default function Games(){
 const [game,setGame]=useState("menu"),[board,setBoard]=useState(empty),[thinking,setThinking]=useState(false),[score,setScore]=useState({wins:0,draws:0,losses:0});
 const [reaction,setReaction]=useState({running:false,start:0,result:null});
 function move(i){if(thinking||board[i]||winner(board))return;const n=[...board];n[i]="X";setBoard(n);if(winner(n))return finish(winner(n));setThinking(true);setTimeout(()=>{const a=ai(n);setBoard(a);setThinking(false);if(winner(a))finish(winner(a));},350)}
 function finish(r){setScore(s=>({...s,wins:s.wins+(r==="X"?1:0),draws:s.draws+(r==="draw"?1:0),losses:s.losses+(r==="O"?1:0)}));}
 function reset(){setBoard(empty);setThinking(false);}
 function startReaction(){setReaction({running:false,start:performance.now(),result:null});setTimeout(()=>setReaction(r=>({...r,running:true,start:performance.now()})),Math.random()*1800+800)}
 function clickReaction(){if(!reaction.running)return;setReaction(r=>({...r,running:false,result:Math.round(performance.now()-r.start)}))}
 return <main style={{minHeight:"100vh",padding:"40px 20px",background:"#09090f",color:"white",fontFamily:"Arial,sans-serif"}}>
  <div style={{maxWidth:900,margin:"0 auto"}}><a href="/" style={{color:"#aaa",textDecoration:"none"}}>← Nexoras Community</a>
  <div style={{textAlign:"center",margin:"35px 0"}}><div style={{letterSpacing:4,color:"#a78bfa",fontWeight:700}}>🎮 NEXORAS GAMES</div><h1 style={{fontSize:"clamp(40px,8vw,72px)",margin:"10px 0"}}>Gry</h1><p style={{color:"#aaa"}}>Małe gry. Dużo rewanżów. Zero nudy.</p></div>
  {game==="menu"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:18}}>{[["❌⭕","Kółko i krzyżyk","Pokonaj AI.","ttt"],["⚡","Refleks","Kliknij, gdy ekran zmieni kolor.","reaction"]].map(([i,t,d,g])=><button key={g} onClick={()=>g==="ttt"?setGame(g):startReaction()||setGame(g)} style={{padding:28,borderRadius:22,border:"1px solid #272735",background:"#12121b",color:"white",textAlign:"left",cursor:"pointer"}}><div style={{fontSize:42}}>{i}</div><h2>{t}</h2><p style={{color:"#aaa"}}>{d}</p></button>)}</div>}
  {game==="ttt"&&<section style={{maxWidth:430,margin:"0 auto",textAlign:"center"}}><button onClick={()=>setGame("menu")} style={{float:"left"}}>← Gry</button><h2>Kółko i krzyżyk</h2><p style={{color:"#aaa"}}>Ty: ❌ X • AI: ⭕ O</p><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{board.map((v,i)=><button key={i} onClick={()=>move(i)} style={{height:110,fontSize:44,borderRadius:15,border:"1px solid #333",background:"#15151f",color:"white"}}>{v}</button>)}</div><h3>{thinking?"🤖 AI myśli...":winner(board)==="X"?"🏆 Wygrałeś!":winner(board)==="O"?"🤖 AI wygrało!":winner(board)==="draw"?"🤝 Remis!":"Twój ruch"}</h3><button onClick={reset}>🔄 Nowa gra</button><p style={{color:"#aaa"}}>🏆 {score.wins} wygranych · 🤝 {score.draws} remisów · 🤖 {score.losses} porażek</p></section>}
  {game==="reaction"&&<section style={{textAlign:"center"}}><button onClick={()=>setGame("menu")}>← Gry</button><h2>⚡ Refleks</h2><p style={{color:"#aaa"}}>Kliknij pole dokładnie wtedy, gdy zmieni się na zielone.</p><button onClick={reaction.running?clickReaction:startReaction} style={{width:"100%",height:350,borderRadius:25,border:0,background:reaction.running?"#22c55e":"#15151f",color:"white",fontSize:28,cursor:"pointer"}}>{reaction.result?`${reaction.result} ms 🎯`:reaction.running?"KLIKNIJ TERAZ!":"START"}</button>{reaction.result&&<p>Wynik: <b>{reaction.result} ms</b>. Spróbujesz zejść niżej? 😈</p>}</section>}
  </div></main>
}