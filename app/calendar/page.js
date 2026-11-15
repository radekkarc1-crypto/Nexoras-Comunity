"use client";
import { useEffect, useMemo, useState } from "react";

const KEY="nexoras-calendar-v3";
const pad=n=>String(n).padStart(2,"0");
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromKey=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);};
const plusDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};

export default function CalendarPage(){
 const today=keyOf(new Date());
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const [selected,setSelected]=useState(today);
 const [selectMode,setSelectMode]=useState(false);
 const [picked,setPicked]=useState([]);
 const [items,setItems]=useState([]);
 const [title,setTitle]=useState("");
 const [time,setTime]=useState("09:00");
 const [details,setDetails]=useState("");
 const [repeatOpen,setRepeatOpen]=useState(false);
 const [repeat,setRepeat]=useState(false);
 const [unit,setUnit]=useState("weekly");
 const [every,setEvery]=useState("1");
 const [end,setEnd]=useState(keyOf(plusDays(new Date(),30)));
 const [message,setMessage]=useState("");
 const [notify,setNotify]=useState(false);
 const [game,setGame]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [lane,setLane]=useState(1);
 const [rocks,setRocks]=useState([]);
 const [score,setScore]=useState(0);
 const [gameOver,setGameOver]=useState(false);

 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem(KEY)||"[]"));}catch{setItems([]);}setNotify("Notification" in window&&Notification.permission==="granted");if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{}},[items]);
 useEffect(()=>{
  if(!playing||gameOver)return;
  const id=setInterval(()=>{
   setRocks(old=>{
    const moved=old.map(r=>({...r,row:r.row+1})).filter(r=>r.row<5);
    const spawn={lane:Math.floor(Math.random()*3),row:0,id:Date.now()+Math.random()};
    const next=[...moved,spawn];
    if(next.some(r=>r.row===4&&r.lane===lane)){setGameOver(true);setPlaying(false);}
    return next;
   });
   setScore(s=>s+1);
  },560);
  return()=>clearInterval(id);
 },[playing,gameOver,lane]);
 useEffect(()=>{
  if(!playing)return;
  const onKey=e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")setLane(v=>Math.max(0,v-1));if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")setLane(v=>Math.min(2,v+1));};
  window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
 },[playing]);

 const days=useMemo(()=>{const first=new Date(month.getFullYear(),month.getMonth(),1);const start=plusDays(first,-((first.getDay()+6)%7));return Array.from({length:42},(_,i)=>plusDays(start,i));},[month]);
 const selectedItems=items.filter(x=>x.date===selected).sort((a,b)=>a.time.localeCompare(b.time));
 function pickDay(day){
  const k=keyOf(day);setSelected(k);
  if(selectMode)setPicked(old=>old.includes(k)?old.filter(x=>x!==k):[...old,k]);
 }
 function toggleSelect(){if(!selectMode)setPicked([selected]);else setPicked([]);setSelectMode(v=>!v);}
 function makeDates(){
  const starts=selectMode?[...picked]:[selected];
  if(!starts.length){setMessage("Najpierw zaznacz przynajmniej jeden dzień.");return null;}
  const result=new Set();const n=Math.max(1,Math.min(365,Number(every)||1));
  for(const s of starts){
   const start=fromKey(s);
   if(!repeat){result.add(s);continue;}
   const last=fromKey(end);
   if(last<start){setMessage("Data końca powtarzania jest wcześniejsza niż początek.");return null;}
   let d=new Date(start),guard=0;
   while(d<=last&&guard<500){
    result.add(keyOf(d));guard++;
    if(unit==="daily")d=plusDays(d,n);
    else if(unit==="weekly")d=plusDays(d,7*n);
    else if(unit==="monthly"){const day=d.getDate();d=new Date(d.getFullYear(),d.getMonth()+n,1);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));}
    else {const day=d.getDate();d=new Date(d.getFullYear()+n,d.getMonth(),1);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));}
   }
  }
  return [...result].sort();
 }
 function addEvent(e){
  e.preventDefault();if(!title.trim())return;
  const dates=makeDates();if(!dates)return;
  const group=crypto.randomUUID();
  const created=dates.map(date=>({id:crypto.randomUUID(),group,date,time,title:title.trim(),details:details.trim(),repeat:repeat?{unit,every:Number(every)||1,end}:null}));
  setItems(old=>[...old,...created]);setMessage(`Dodano wydarzenie do ${dates.length} ${dates.length===1?"dnia":"dni"}.`);
  setTitle("");setDetails("");setSelectMode(false);setPicked([]);setRepeat(false);setRepeatOpen(false);
 }
 function removeEvent(id){setItems(old=>old.filter(x=>x.id!==id));}
 async function askNotifications(){if(!("Notification"in window)){setMessage("Ta przeglądarka nie obsługuje powiadomień.");return;}const p=await Notification.requestPermission();setNotify(p==="granted");setMessage(p==="granted"?"Zgoda na powiadomienia zapisana. W tej wersji kalendarz musi być otwarty.":"Nie przyznano zgody.");}
 function startGame(){setLane(1);setRocks([]);setScore(0);setGameOver(false);setPlaying(true);setGame(true);}
 return <main className="shell"><section className="calendarPage">
  <a className="calendarBack" href="/">← Wróć do Nexoras Community</a>
  <div className="calendarHead"><div><div className="kicker">NEXORAS • ORGANIZER</div><h1>Twój kalendarz.</h1><p>Wydarzenia, przypomnienia i planowanie offline.</p></div><div className="calendarActions"><button className="calendarBtn" onClick={askNotifications}>🔔 {notify?"Powiadomienia włączone":"Włącz powiadomienia"}</button><button className="calendarBtn" onClick={startGame}>☄️ Asteroid Dash</button><button className="calendarBtn primary" onClick={()=>{setSelected(today);setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1));}}>Dzisiaj</button></div></div>
  <div className="calendarLayout"><section className="calendarBox">
   <div className="monthBar"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>←</button><h2>{month.toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</h2><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>→</button></div>
   <div className="calendarTools"><button className={selectMode?"active":""} onClick={toggleSelect}>{selectMode?"✓ Zakończ zaznaczanie":"☑ Zaznacz dni"}</button>{selectMode&&<><span>Teraz klikaj dni w kalendarzu. Każdy klik dodaje lub usuwa dzień.</span><button onClick={()=>setPicked([])}>Wyczyść wybór</button><strong className="selectionCount">{picked.length} zazn.</strong></>}</div>
   <div className="weekdays">{["Pon","Wt","Śr","Czw","Pt","Sob","Niedz"].map(x=><span key={x}>{x}</span>)}</div>
   <div className="daysGrid">{days.map(day=>{const k=keyOf(day),count=items.filter(x=>x.date===k).length,marked=selectMode&&picked.includes(k);return <button type="button" key={k} aria-pressed={marked} className={`dayCell ${day.getMonth()!==month.getMonth()?"muted":""} ${k===today?"today":""} ${k===selected?"selected":""} ${marked?"multiSelected":""}`} onClick={()=>pickDay(day)}><span className="dayNum">{marked?"✓ ": ""}{day.getDate()}</span>{count>0&&<span className="dayDot">{count} {count===1?"wydarzenie":"wydarzeń"}</span>}</button>})}</div>
   {selectMode&&<button className="calendarBtn primary selectionAdd" disabled={!picked.length} onClick={()=>{setSelected(picked[0]||selected);document.getElementById("event-title")?.focus();}}>Dodaj wydarzenie do {picked.length} zaznaczonych dni ↓</button>}
  </section><aside className="reminderBox"><div className="kicker">📌 PLAN DNIA</div><h2>{fromKey(selected).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</h2><p>{selectMode?`Zaznaczono ${picked.length} dni. Wydarzenie zostanie dodane do każdego z nich.`:"Dodaj wydarzenie na wybrany dzień."}</p>
   <form className="reminderForm" onSubmit={addEvent}><input id="event-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nazwa wydarzenia" maxLength={90} required/><input type="time" value={time} onChange={e=>setTime(e.target.value)} required/><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Szczegóły (opcjonalnie)"/><button type="button" className={`calendarBtn ${repeat?"active":""}`} onClick={()=>setRepeatOpen(true)}>🔁 {repeat?"Powtarzanie ustawione":"Ustaw powtarzanie…"}</button><button className="calendarBtn primary" type="submit">＋ Zapisz wydarzenie</button></form>
   <h2>Wydarzenia tego dnia</h2><div className="reminderList">{selectedItems.length?selectedItems.map(x=><article className="reminderItem" key={x.id}><small>🕒 {x.time}{x.repeat? ` • co ${x.repeat.every} ${({daily:"dni",weekly:"tygodnie",monthly:"miesiące",yearly:"lata"})[x.repeat.unit]}`:""}</small><strong>{x.title}</strong>{x.details&&<p>{x.details}</p>}<button onClick={()=>removeEvent(x.id)}>Usuń</button></article>):<p className="emptyReminders">Brak wydarzeń na ten dzień.</p>}</div><p className="calendarNotice">Dane zapisują się na tym urządzeniu. Powiadomienia w tej wersji wymagają otwartego kalendarza.</p>{message&&<p className="calendarNotice" role="status">{message}</p>}
  </aside></div>
  {repeatOpen&&<div className="calendarModal" role="dialog" aria-modal="true" aria-label="Powtarzanie wydarzenia"><div className="calendarModalCard"><button className="modalClose" onClick={()=>setRepeatOpen(false)}>×</button><div className="kicker">USTAWIENIA WYDARZENIA</div><h2>Powtarzaj wydarzenie</h2><label className="repeatToggle"><input type="checkbox" checked={repeat} onChange={e=>setRepeat(e.target.checked)}/> Włącz powtarzanie</label>{repeat&&<><label>Powtarzaj co</label><div className="repeatRow"><input type="number" min="1" max="365" value={every} onChange={e=>setEvery(e.target.value)}/><select value={unit} onChange={e=>setUnit(e.target.value)}><option value="daily">dni</option><option value="weekly">tygodnie</option><option value="monthly">miesiące</option><option value="yearly">lata</option></select></div><label>Koniec powtarzania</label><input type="date" min={selected} value={end} onChange={e=>setEnd(e.target.value)}/><p className="calendarNotice">Wydarzenie będzie tworzone w wybranym odstępie aż do tej daty.</p></>}<div className="calendarActions"><button className="calendarBtn" onClick={()=>{setRepeat(false);setRepeatOpen(false);}}>Wyłącz</button><button className="calendarBtn primary" onClick={()=>setRepeatOpen(false)}>Zapisz</button></div></div></div>}
  {game&&<div className="calendarModal" role="dialog" aria-modal="true" aria-label="Asteroid Dash"><div className="calendarModalCard arcadeCard"><button className="modalClose" onClick={()=>{setGame(false);setPlaying(false);}}>×</button><div className="kicker">NEXORAS ARCADE • OFFLINE</div><h2>☄️ Asteroid Dash</h2><p>Uciekaj przed asteroidami! Steruj strzałkami lub przyciskami.</p><div className="arcadeScore">WYNIK: <strong>{score}</strong></div><div className="arcadeBoard">{Array.from({length:5},(_,row)=><div className="arcadeRow" key={row}>{[0,1,2].map(col=><div className={`arcadeCell ${lane===col&&row===4?"ship":""}`} key={col}>{rocks.some(r=>r.row===row&&r.lane===col)?"☄️":lane===col&&row===4?"🚀":""}</div>)}</div>)}</div>{gameOver&&<h3 className="arcadeOver">💥 Statek trafiony! Wynik: {score}</h3>}<div className="arcadeControls"><button onClick={()=>setLane(v=>Math.max(0,v-1))} disabled={!playing}>← LEWO</button><button onClick={()=>setLane(v=>Math.min(2,v+1))} disabled={!playing}>PRAWO →</button></div><button className="calendarBtn primary" onClick={startGame}>{gameOver?"Zagraj ponownie":"Start / Restart"}</button></div></div>}
 </section></main>;
}
