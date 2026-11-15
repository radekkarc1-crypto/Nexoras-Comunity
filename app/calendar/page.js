"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nexoras-calendar-reminders-v2";
const pad = n => String(n).padStart(2, "0");
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDate = value => { const [y,m,d]=value.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const monthNames = {daily:"dzień",weekly:"tydzień",monthly:"miesiąc",yearly:"rok"};
const icons = ["🚀","🌙","⭐","🪐","🛰️","☄️","👾","🌍"];

export default function CalendarPage() {
  const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const [selected,setSelected]=useState(()=>dateKey(new Date()));
  const [multiMode,setMultiMode]=useState(false);
  const [selectedDays,setSelectedDays]=useState([dateKey(new Date())]);
  const [reminders,setReminders]=useState([]);
  const [title,setTitle]=useState("");
  const [time,setTime]=useState("09:00");
  const [details,setDetails]=useState("");
  const [notice,setNotice]=useState("");
  const [notify,setNotify]=useState(false);
  const [repeatOpen,setRepeatOpen]=useState(false);
  const [repeatOn,setRepeatOn]=useState(false);
  const [frequency,setFrequency]=useState("weekly");
  const [interval,setInterval]=useState("1");
  const [until,setUntil]=useState(()=>dateKey(addDays(new Date(),30)));
  const [gameOpen,setGameOpen]=useState(false);
  const [cards,setCards]=useState([]);
  const [flipped,setFlipped]=useState([]);
  const [matched,setMatched]=useState([]);
  const [moves,setMoves]=useState(0);

  useEffect(()=>{
    try { setReminders(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")); } catch { setReminders([]); }
    setNotify("Notification" in window && Notification.permission==="granted");
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  },[]);
  useEffect(()=>{ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(reminders));}catch{} },[reminders]);
  useEffect(()=>{
    const check=()=>{
      const now=new Date(), minute=`${dateKey(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setReminders(current=>{
        let changed=false;
        const next=current.map(item=>{
          if(!item.notified && item.at===minute){
            changed=true;
            if("Notification" in window && Notification.permission==="granted") new Notification("Nexoras • przypomnienie",{body:item.title,icon:"/icon.svg"});
            return {...item,notified:true};
          }
          return item;
        });
        return changed?next:current;
      });
    };
    const id=window.setInterval(check,15000); check();
    return ()=>window.clearInterval(id);
  },[]);
  useEffect(()=>{
    if(flipped.length!==2)return;
    const [a,b]=flipped;
    if(cards[a]===cards[b]) setMatched(current=>[...current,a,b]);
    const id=window.setTimeout(()=>setFlipped([]),cards[a]===cards[b]?550:950);
    return ()=>window.clearTimeout(id);
  },[flipped,cards]);

  const days=useMemo(()=>{
    const first=new Date(month.getFullYear(),month.getMonth(),1), offset=(first.getDay()+6)%7;
    const start=addDays(first,-offset);
    return Array.from({length:42},(_,i)=>addDays(start,i));
  },[month]);
  const selectedItems=reminders.filter(r=>r.at.slice(0,10)===selected).sort((a,b)=>a.at.localeCompare(b.at));
  const today=dateKey(new Date());

  function chooseDay(key){
    setSelected(key);
    if(multiMode) setSelectedDays(current=>current.includes(key)?current.filter(x=>x!==key):[...current,key]);
    else setSelectedDays([key]);
  }
  function toggleMulti(){
    if(!multiMode)setSelectedDays([selected]);
    setMultiMode(v=>!v);
  }
  function buildDates(startKey){
    const starts=multiMode?selectedDays:[startKey];
    const result=[];
    const step=Math.max(1,Math.min(365,Number(interval)||1));
    for(const start of starts){
      if(!repeatOn){result.push(start);continue;}
      const startDate=parseDate(start), end=parseDate(until);
      if(end<startDate){setNotice("Data zakończenia powtarzania nie może być wcześniejsza niż początek.");return null;}
      let cursor=new Date(startDate), guard=0;
      while(cursor<=end && guard<500){
        result.push(dateKey(cursor)); guard++;
        if(frequency==="daily") cursor=addDays(cursor,step);
        else if(frequency==="weekly") cursor=addDays(cursor,7*step);
        else if(frequency==="monthly") cursor=new Date(cursor.getFullYear(),cursor.getMonth()+step,Math.min(startDate.getDate(),new Date(cursor.getFullYear(),cursor.getMonth()+step+1,0).getDate()));
        else cursor=new Date(cursor.getFullYear()+step,cursor.getMonth(),Math.min(startDate.getDate(),new Date(cursor.getFullYear()+step,cursor.getMonth()+1,0).getDate()));
      }
    }
    return [...new Set(result)].sort();
  }
  function addReminder(e){
    e.preventDefault();
    if(!title.trim())return;
    const dates=buildDates(selected);
    if(!dates)return;
    const now=new Date();
    if(dates.some(day=>new Date(`${day}T${time}`)<now)){setNotice("W zaznaczonych dniach jest już przeszła godzina. Wybierz przyszłe terminy.");return;}
    const newItems=dates.map(day=>({id:crypto.randomUUID(),title:title.trim(),details:details.trim(),at:`${day}T${time}`,notified:false,repeat:repeatOn?{frequency,interval:Number(interval)||1,until}:null}));
    setReminders(current=>[...current,...newItems]);
    setTitle("");setDetails("");setNotice(`Dodano ${newItems.length} ${newItems.length===1?"termin":"terminów"}.`);
    setMultiMode(false);setSelectedDays([selected]);setRepeatOpen(false);
  }
  function removeReminder(id){setReminders(current=>current.filter(x=>x.id!==id));}
  async function enableNotifications(){
    if(!("Notification" in window)){setNotice("Ta przeglądarka nie obsługuje powiadomień.");return;}
    const permission=await Notification.requestPermission();setNotify(permission==="granted");
    setNotice(permission==="granted"?"Powiadomienia włączone. Przeglądarka musi mieć otwarty kalendarz.":"Nie przyznano zgody na powiadomienia.");
  }
  function startGame(){
    const deck=[...icons,...icons].sort(()=>Math.random()-.5);
    setCards(deck);setFlipped([]);setMatched([]);setMoves(0);setGameOpen(true);
  }
  function flipCard(index){
    if(flipped.length===2||flipped.includes(index)||matched.includes(index))return;
    setMoves(v=>v+1);setFlipped(v=>[...v,index]);
  }

  return <main className="shell"><section className="calendarPage">
    <a className="calendarBack" href="/">← Wróć do Nexoras Community</a>
    <div className="calendarHead"><div><div className="kicker">NEXORAS • ORGANIZER</div><h1>Twój kalendarz.</h1><p>Plany, wydarzenia i przypomnienia. Także bez internetu.</p></div>
      <div className="calendarActions"><button className="calendarBtn" onClick={enableNotifications}>{notify?"🔔 Powiadomienia włączone":"🔔 Włącz powiadomienia"}</button><button className="calendarBtn" onClick={startGame}>🎮 Nexoras Memory</button><button className="calendarBtn primary" onClick={()=>{setSelected(today);setSelectedDays([today]);setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1));}}>Dzisiaj</button></div>
    </div>
    <div className="calendarLayout"><section className="calendarBox">
      <div className="monthBar"><button aria-label="Poprzedni miesiąc" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>←</button><h2>{month.toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</h2><button aria-label="Następny miesiąc" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>→</button></div>
      <div className="calendarTools"><button className={multiMode?"active":""} onClick={toggleMulti}>{multiMode?"✓ Zaznaczanie aktywne":"▦ Zaznacz dni"}</button>{multiMode&&<><span>Zaznacz dowolne dni, potem dodaj wydarzenie.</span><button onClick={()=>setSelectedDays([])}>Wyczyść</button></>}</div>
      <div className="weekdays">{["Pon","Wt","Śr","Czw","Pt","Sob","Niedz"].map(d=><span key={d}>{d}</span>)}</div>
      <div className="daysGrid">{days.map(day=>{const key=dateKey(day),items=reminders.filter(r=>r.at.slice(0,10)===key),isMarked=multiMode&&selectedDays.includes(key);return <button key={key} className={`dayCell ${day.getMonth()!==month.getMonth()?"muted":""} ${key===today?"today":""} ${key===selected?"selected":""} ${isMarked?"multiSelected":""}`} onClick={()=>chooseDay(key)}><span className="dayNum">{day.getDate()}{isMarked?" ✓":""}</span>{items.slice(0,2).map(item=><span className="dayDot" key={item.id}>• {item.title}</span>)}{items.length>2&&<span className="dayDot">+{items.length-2} więcej</span>}</button>})}</div>
      {multiMode&&<p className="selectionCount">Zaznaczono: <strong>{selectedDays.length}</strong> dni</p>}
    </section><aside className="reminderBox"><div className="kicker">📌 PLAN DNIA</div><h2>{parseDate(selected).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</h2><p>{multiMode?(`Dodaj jedno wydarzenie do ${selectedDays.length} zaznaczonych dni.`):"Dodaj przypomnienie na wybrany dzień."}</p>
      <form className="reminderForm" onSubmit={addReminder}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Co mam Ci przypomnieć?" maxLength={90} required/><input type="time" value={time} onChange={e=>setTime(e.target.value)} required/><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Szczegóły (opcjonalnie)"/>
        <button type="button" className={`calendarBtn ${repeatOn?"active":""}`} onClick={()=>setRepeatOpen(true)}>🔁 {repeatOn?"Powtarzanie ustawione":"Powtarzaj..."}</button>
        <button className="calendarBtn primary" type="submit">＋ Dodaj {multiMode? "na zaznaczone dni":"przypomnienie"}</button></form>
      <h2>Przypomnienia</h2><div className="reminderList">{selectedItems.length?selectedItems.map(item=><article className="reminderItem" key={item.id}><small>🕒 {item.at.slice(11)} {item.repeat?(`• co ${item.repeat.interval} ${monthNames[item.repeat.frequency]}`):""} {item.notified?"• przypomniano":""}</small><strong>{item.title}</strong>{item.details&&<p>{item.details}</p>}<button onClick={()=>removeReminder(item.id)}>Usuń</button></article>):<p className="emptyReminders">Brak przypomnień na ten dzień.</p>}</div>
      <p className="calendarNotice">Dane są przechowywane lokalnie na tym urządzeniu. Powiadomienia w tej wersji działają, gdy kalendarz jest otwarty.</p>{notice&&<p className="calendarNotice">{notice}</p>}
    </aside></div>
    {repeatOpen&&<div className="calendarModal" role="dialog" aria-modal="true" aria-label="Ustaw powtarzanie"><div className="calendarModalCard"><button className="modalClose" onClick={()=>setRepeatOpen(false)}>×</button><div className="kicker">AUTOMATYZACJA TERMINU</div><h2>Powtarzaj wydarzenie</h2><label className="repeatToggle"><input type="checkbox" checked={repeatOn} onChange={e=>setRepeatOn(e.target.checked)}/> Włącz powtarzanie</label>{repeatOn&&<><label>Powtarzaj co</label><div className="repeatRow"><input type="number" min="1" max="365" value={interval} onChange={e=>setInterval(e.target.value)}/><select value={frequency} onChange={e=>setFrequency(e.target.value)}><option value="daily">dzień</option><option value="weekly">tydzień</option><option value="monthly">miesiąc</option><option value="yearly">rok</option></select></div><label>Powtarzaj do</label><input type="date" min={selected} value={until} onChange={e=>setUntil(e.target.value)}/><p className="calendarNotice">Wydarzenie zostanie dodane do kolejnych pasujących dni aż do wybranej daty.</p></>}<div className="calendarActions"><button className="calendarBtn" onClick={()=>{setRepeatOn(false);setRepeatOpen(false);}}>Bez powtarzania</button><button className="calendarBtn primary" onClick={()=>setRepeatOpen(false)}>Zapisz ustawienia</button></div></div></div>}
    {gameOpen&&<div className="calendarModal" role="dialog" aria-modal="true" aria-label="Nexoras Memory"><div className="calendarModalCard memoryCard"><button className="modalClose" onClick={()=>setGameOpen(false)}>×</button><div className="kicker">MINI GRA • OFFLINE</div><h2>Nexoras Memory</h2><p>Znajdź wszystkie 8 par kosmicznych symboli.</p><div className="memoryStats">Ruchy: <strong>{moves}</strong> · Pary: <strong>{matched.length/2}/8</strong></div><div className="memoryGrid">{cards.map((symbol,i)=><button key={i} className={`memoryTile ${flipped.includes(i)||matched.includes(i)?"revealed":""}`} onClick={()=>flipCard(i)}>{flipped.includes(i)||matched.includes(i)?symbol:"?"}</button>)}</div>{matched.length===16&&<p className="memoryWin">🚀 Misja wykonana! Ukończono w {moves} ruchach.</p>}<button className="calendarBtn primary" onClick={startGame}>Nowa gra</button></div></div>}
  </section></main>;
}
